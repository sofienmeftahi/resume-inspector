from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from werkzeug.utils import secure_filename
import json
from datetime import datetime
import uuid
import requests

# Import our custom modules
from parser.extract_text import extract_text_from_file
from models.skill_matcher import SkillMatcher
from models.scoring import ResumeScorer

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
app.config['UPLOAD_FOLDER'] = 'resume_storage'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

# Initialize our analysis modules
skill_matcher = SkillMatcher()
resume_scorer = ResumeScorer()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_writing_quality(text):
    url = "https://api.languagetool.org/v2/check"
    data = {"text": text, "language": "en-US"}
    try:
        response = requests.post(url, data=data, timeout=10)
        matches = response.json().get("matches", [])
        grammar_errors = len(matches)
        suggestions = list(set([m["message"] for m in matches]))
        writing_score = max(0, 100 - grammar_errors * 4)
        return {
            "writing_score": writing_score,
            "grammar_errors": grammar_errors,
            "suggestions": suggestions[:5]
        }
    except Exception as e:
        return {"writing_score": 0, "grammar_errors": 0, "suggestions": ["Grammar check failed"]}

def detect_missing_sections(text):
    text_lower = text.lower()
    
    # Define section keywords with multiple variations
    sections = {
        "Education": {
            "keywords": ["education", "academic", "degree", "university", "college", "school", "graduated", "bachelor", "master", "phd", "diploma"],
            "message": "No Education section found — Consider adding your academic background."
        },
        "Certifications": {
            "keywords": ["certification", "certificate", "certificat", "cert", "accreditation", "license", "licence", "accredited"],
            "message": "Mention relevant certificates."
        },
        "Projects": {
            "keywords": ["project", "portfolio", "work", "development", "application", "software", "website", "app"],
            "message": "Showcase personal or team projects."
        },
        "Experience": {
            "keywords": ["experience", "work", "employment", "job", "position", "role", "career", "professional"],
            "message": "Add work experience section."
        },
        "Skills": {
            "keywords": ["skill", "competence", "technology", "programming", "language", "framework", "tool"],
            "message": "Add skills section."
        }
    }
    
    missing = []
    for section_name, section_info in sections.items():
        # Check if any of the keywords for this section are found
        found = any(keyword in text_lower for keyword in section_info["keywords"])
        if not found:
            missing.append({"section": section_name, "message": section_info["message"]})
    
    return missing

def smart_recommendations(text):
    recs = []
    if "helped" in text:
        recs.append("Use stronger verbs like 'led', 'managed', 'achieved'.")
    if "%" not in text and "increased" in text:
        recs.append("Quantify your impact (e.g., 'increased revenue by 15%').")
    return recs

def compare_with_jd(cv_text, jd_text, skills_list):
    cv_skills = [s for s in skills_list if s.lower() in cv_text.lower()]
    jd_skills = [s for s in skills_list if s.lower() in jd_text.lower()]
    missing_skills = [s for s in jd_skills if s not in cv_skills]
    perfect_matches = [s for s in jd_skills if s in cv_skills]
    match_score = int(100 * len(perfect_matches) / max(1, len(jd_skills)))
    return {
        "match_score": match_score,
        "missing_skills": missing_skills,
        "perfect_matches": perfect_matches
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Resume Inspector API'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """Main endpoint for CV analysis - always analyze fresh, do not save or load from disk"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF or DOCX files only.'}), 400
        
        # Create unique filename and save file temporarily
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        # Save file temporarily
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, f"{file_id}.{file_extension}")
        file.save(file_path)
        
        try:
            # Extract text from the file
            print(f"Extracting text from {file_path}")
            extracted_text = extract_text_from_file(file_path)
            print("Extracted text:", extracted_text[:500])
            if not extracted_text or len(extracted_text.strip()) < 50:
                return jsonify({'error': 'Could not extract sufficient text from the file. Please ensure the file contains readable text.'}), 400
            
            # Analyze the resume
            print("Analyzing resume content...")
            # Extract skills (now returns categorized skills)
            skills_found = skill_matcher.extract_skills(extracted_text)
            print("Skills found:", skills_found)
            
            # Get all skills with presence indicators
            all_skills_with_presence = skill_matcher.get_all_skills_with_presence(extracted_text)
            
            # Flatten skills for scoring (backward compatibility)
            flat_skills_found = []
            for category_skills in skills_found.values():
                flat_skills_found.extend(category_skills)
            
            # Calculate scores
            scores = resume_scorer.calculate_scores(extracted_text, flat_skills_found)
            print("Scores:", scores)
            # Generate recommendations
            recommendations = resume_scorer.generate_recommendations(extracted_text, flat_skills_found, scores)
            # --- New: Writing Quality ---
            writing_quality = check_writing_quality(extracted_text)
            # --- New: Missing Sections ---
            missing_sections = detect_missing_sections(extracted_text)
            # --- New: Smart Recommendations ---
            smart_recs = smart_recommendations(extracted_text)
            # --- New: JD Matching (optional, if provided) ---
            jd_text = request.form.get('jd_text', '')
            jd_matching = None
            if jd_text:
                jd_matching = compare_with_jd(extracted_text, jd_text, skill_matcher.get_all_skills())
            # Prepare response
            analysis_result = {
                'file_id': file_id,
                'filename': filename,
                'file_size': os.path.getsize(file_path),
                'analysis_date': datetime.now().isoformat(),
                'scores': scores,
                'skills': {
                    'found': skills_found,  # Categorized skills found in CV
                    'all_skills_with_presence': all_skills_with_presence,  # All skills with presence indicators
                    'missing': skill_matcher.get_missing_skills(skills_found),
                    'total_found': len(flat_skills_found),
                    'coverage': skill_matcher.calculate_skill_coverage(skills_found)
                },
                'recommendations': recommendations + smart_recs,
                'text_length': len(extracted_text),
                'summary': {
                    'overall_score': scores['overall'],
                    'grade': scores['grade'],
                    'strengths': scores['strengths'],
                    'weaknesses': scores['weaknesses']
                },
                'writing_quality': writing_quality,
                'missing_sections': missing_sections,
                'jd_matching': jd_matching
            }
            return jsonify(analysis_result)
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return jsonify({'error': 'An error occurred during analysis. Please try again.'}), 500

@app.route('/api/skills', methods=['GET'])
def get_skills():
    """Get available skills for reference"""
    return jsonify({
        'skills': skill_matcher.get_all_skills(),
        'categories': skill_matcher.get_skill_categories()
    })

@app.route('/api/analysis/<file_id>', methods=['GET'])
def get_analysis(file_id):
    """Retrieve a previous analysis result"""
    try:
        result_file = os.path.join('resume_storage', f"{file_id}_analysis.json")
        if os.path.exists(result_file):
            with open(result_file, 'r') as f:
                return jsonify(json.load(f))
        else:
            return jsonify({'error': 'Analysis not found'}), 404
    except Exception as e:
        return jsonify({'error': 'Error retrieving analysis'}), 500

@app.route('/api/jd-match', methods=['POST'])
def jd_match():
    data = request.json
    cv_text = data.get('cv_text', '')
    jd_text = data.get('jd_text', '')
    skills_list = skill_matcher.get_all_skills()
    result = compare_with_jd(cv_text, jd_text, skills_list)
    return jsonify(result)

if __name__ == '__main__':
    # Create storage directory if it doesn't exist
    os.makedirs('resume_storage', exist_ok=True)
    
    print("🚀 Starting Resume Inspector API...")
    print("📁 Storage directory: resume_storage/")
    print("🌐 API will be available at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/api/health")
    
    app.run(host='0.0.0.0', port=8000, debug=True) 