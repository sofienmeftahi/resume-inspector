import re
import spacy
from typing import Dict, List, Any
from datetime import datetime
from dateutil import parser

class ResumeScorer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.scoring_weights = {
            'skills': 0.3,
            'experience': 0.25,
            'education': 0.15,
            'formatting': 0.15,
            'keywords': 0.15
        }
    
    def calculate_scores(self, text: str, skills_found: list) -> Dict[str, Any]:
        """
        Calculate comprehensive resume scores using weighted criteria
        """
        # Extract basic information
        years_exp = self.extract_years_experience(text)
        academic_level = self.extract_academic_level(text)
        found_count = len(skills_found)
        
        # Calculate individual component scores
        skills_score = self._calculate_skills_score(skills_found)
        experience_score = self._calculate_experience_score(text)
        education_score = self._calculate_education_score(text)
        formatting_score = self._calculate_formatting_score(text)
        keywords_score = self._calculate_keywords_score(text)
        
        # Calculate weighted overall score
        overall_score = (
            skills_score * self.scoring_weights['skills'] +
            experience_score * self.scoring_weights['experience'] +
            education_score * self.scoring_weights['education'] +
            formatting_score * self.scoring_weights['formatting'] +
            keywords_score * self.scoring_weights['keywords']
        )
        
        # Ensure score is between 0 and 100
        overall_score = max(0, min(100, overall_score))
        
        # Determine grade
        grade = self._get_grade(overall_score)
        
        # Identify strengths and weaknesses
        strengths = self._identify_strengths(skills_score, experience_score, education_score, formatting_score, keywords_score)
        weaknesses = self._identify_weaknesses(skills_score, experience_score, education_score, formatting_score, keywords_score)
        
        # Add skill coverage weaknesses (only if skills_found is a dict)
        if isinstance(skills_found, dict):
            skill_coverage_weaknesses = self._analyze_skill_coverage_weaknesses(skills_found)
            weaknesses.extend(skill_coverage_weaknesses)
        
        return {
            "overall": round(overall_score, 1),
            "grade": grade,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "years_experience": years_exp,
            "academic_level": academic_level,
            "component_scores": {
                "skills": round(skills_score, 1),
                "experience": round(experience_score, 1),
                "education": round(education_score, 1),
                "formatting": round(formatting_score, 1),
                "keywords": round(keywords_score, 1)
            }
        }
    
    def extract_years_experience(self, text):
        # Try to extract date ranges like 'April 2023 - August 2023'
        matches = re.findall(r'([A-Za-z]+ \d{4})\s*-\s*([A-Za-z]+ \d{4})', text)
        total_months = 0
        for start, end in matches:
            try:
                start_date = parser.parse(start)
                end_date = parser.parse(end)
                months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                if months > 0:
                    total_months += months
            except Exception:
                continue
        if total_months:
            return round(total_months / 12, 1)
        # Fallback: look for 'X years' patterns
        matches = re.findall(r"(\d+)\+?\s+years?", text, re.IGNORECASE)
        years = [int(m) for m in matches]
        return max(years) if years else 0
    
    def extract_academic_level(self, text):
        """
        Extract the specific degree name from the CV
        """
        text_lower = text.lower()
        
        # Look for specific degree patterns and extract the full degree name
        degree_patterns = [
            r'(master\s+of\s+\w+)',
            r'(bachelor\s+of\s+\w+)',
            r'(licence\s+en\s+\w+)',
            r'(licence\s+\w+)',
            r'(specialiste\s+en\s+\w+)',
            r'(specialiste\s+\w+)',
            r'(phd\s+in\s+\w+)',
            r'(doctorate\s+in\s+\w+)',
            r'(mba\s+in\s+\w+)',
            r'(diploma\s+in\s+\w+)',
            r'(certificate\s+in\s+\w+)'
        ]
        
        # Try to find specific degree names
        for pattern in degree_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                # Return the first match with proper capitalization
                degree = matches[0].title()
                return degree
        
        # Look for standalone degree keywords and return the specific name
        if 'phd' in text_lower or 'doctorate' in text_lower:
            return 'PhD'
        elif 'master' in text_lower:
            return 'Master'
        elif 'mba' in text_lower:
            return 'MBA'
        elif 'licence' in text_lower:
            return 'Licence'
        elif 'specialiste' in text_lower:
            return 'Specialiste'
        elif 'bachelor' in text_lower or 'bsc' in text_lower or 'ba' in text_lower or 'bs' in text_lower:
            return 'Bachelor'
        elif 'associate' in text_lower:
            return 'Associate'
        elif 'diploma' in text_lower:
            return 'Diploma'
        elif 'certificate' in text_lower:
            return 'Certificate'
        elif 'high school' in text_lower:
            return 'High School'
        
        # If no specific degree found, check for university/college mentions
        if any(word in text_lower for word in ['university', 'college', 'institute']):
            return 'Degree'
        
        return 'Not Specified'
    
    def _calculate_skills_score(self, skills_found: list) -> float:
        """
        Calculate skills score based on variety and relevance
        """
        if not skills_found:
            return 0.0
        
        # Handle both old format (list of strings) and new format (dict of categories)
        if isinstance(skills_found, dict):
            # New format: categorized skills
            total_skills = sum(len(skills) for skills in skills_found.values())
            category_coverage = len([cat for cat, skills in skills_found.items() if skills]) / 7  # 7 main categories
        else:
            # Old format: flat list
            total_skills = len(skills_found)
            category_coverage = 0.5  # Default coverage for flat list
        
        # Calculate score based on number of skills and variety
        base_score = min(total_skills * 8, 60)  # Max 60 points for skills
        coverage_bonus = category_coverage * 40  # Max 40 points for coverage
        
        return min(base_score + coverage_bonus, 100)
    
    def _calculate_experience_score(self, text: str) -> float:
        """
        Calculate experience score based on work history
        """
        # Look for experience indicators
        experience_keywords = [
            'experience', 'work', 'employment', 'job', 'position', 'role',
            'years', 'months', 'worked', 'employed', 'career'
        ]
        
        # Count experience-related content
        experience_count = sum(1 for keyword in experience_keywords if keyword.lower() in text.lower())
        
        # Look for date patterns (years of experience)
        year_patterns = [
            r'\d+\s*years?\s*of\s*experience',
            r'experience.*\d+\s*years?',
            r'\d{4}\s*-\s*\d{4}',
            r'\d{4}\s*-\s*present'
        ]
        
        date_matches = 0
        for pattern in year_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                date_matches += 1
        
        # Calculate score
        base_score = min(experience_count * 8, 40)
        date_bonus = min(date_matches * 15, 30)
        length_bonus = min(len(text) / 100, 30)  # Bonus for longer content
        
        return min(base_score + date_bonus + length_bonus, 100)
    
    def _calculate_education_score(self, text: str) -> float:
        """
        Calculate education score
        """
        education_keywords = [
            'education', 'degree', 'bachelor', 'master', 'phd', 'diploma',
            'university', 'college', 'school', 'graduated', 'certification',
            'certificate', 'course', 'training'
        ]
        
        education_count = sum(1 for keyword in education_keywords if keyword.lower() in text.lower())
        
        # Look for degree levels
        degree_levels = {
            'phd': 100,
            'doctorate': 100,
            'master': 80,
            'bachelor': 60,
            'associate': 40,
            'diploma': 30,
            'certificate': 20
        }
        
        max_degree_score = 0
        for degree, score in degree_levels.items():
            if degree.lower() in text.lower():
                max_degree_score = max(max_degree_score, score)
        
        base_score = min(education_count * 10, 50)
        degree_bonus = max_degree_score * 0.5
        
        return min(base_score + degree_bonus, 100)
    
    def _calculate_formatting_score(self, text: str) -> float:
        """
        Calculate formatting and structure score
        """
        lines = text.split('\n')
        non_empty_lines = [line.strip() for line in lines if line.strip()]
        
        # Check for structure indicators
        structure_keywords = [
            'summary', 'objective', 'experience', 'education', 'skills',
            'projects', 'achievements', 'certifications', 'languages'
        ]
        
        structure_count = sum(1 for keyword in structure_keywords if keyword.lower() in text.lower())
        
        # Calculate formatting score
        base_score = min(structure_count * 15, 60)
        length_bonus = min(len(non_empty_lines) * 2, 40)
        
        return min(base_score + length_bonus, 100)
    
    def _calculate_keywords_score(self, text: str) -> float:
        """
        Calculate keywords and action verbs score
        """
        action_verbs = [
            'developed', 'implemented', 'managed', 'created', 'designed',
            'built', 'maintained', 'improved', 'increased', 'decreased',
            'led', 'coordinated', 'organized', 'analyzed', 'researched',
            'solved', 'optimized', 'automated', 'deployed', 'configured'
        ]
        
        keyword_count = sum(1 for verb in action_verbs if verb.lower() in text.lower())
        
        # Look for quantifiable achievements
        achievement_patterns = [
            r'\d+%',
            r'\$\d+',
            r'\d+\s*users?',
            r'\d+\s*customers?',
            r'increased.*\d+%',
            r'decreased.*\d+%'
        ]
        
        achievement_count = sum(1 for pattern in achievement_patterns if re.search(pattern, text, re.IGNORECASE))
        
        base_score = min(keyword_count * 8, 50)
        achievement_bonus = min(achievement_count * 10, 50)
        
        return min(base_score + achievement_bonus, 100)
    
    def _get_grade(self, score: float) -> str:
        """
        Convert score to letter grade
        """
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'A-'
        elif score >= 75:
            return 'B+'
        elif score >= 70:
            return 'B'
        elif score >= 65:
            return 'B-'
        elif score >= 60:
            return 'C+'
        elif score >= 55:
            return 'C'
        elif score >= 50:
            return 'C-'
        else:
            return 'D'
    
    def _identify_strengths(self, skills_score: float, experience_score: float, 
                           education_score: float, formatting_score: float, 
                           keywords_score: float) -> List[str]:
        """
        Identify resume strengths
        """
        strengths = []
        
        if skills_score >= 80:
            strengths.append("Strong technical skills and diverse skill set")
        if experience_score >= 80:
            strengths.append("Solid work experience and career progression")
        if education_score >= 80:
            strengths.append("Strong educational background")
        if formatting_score >= 80:
            strengths.append("Well-structured and professional formatting")
        if keywords_score >= 80:
            strengths.append("Effective use of action verbs and quantifiable achievements")
        
        if not strengths:
            strengths.append("Good foundation for improvement")
        
        return strengths
    
    def _identify_weaknesses(self, skills_score: float, experience_score: float,
                            education_score: float, formatting_score: float,
                            keywords_score: float) -> List[str]:
        """
        Identify areas for improvement
        """
        weaknesses = []
        
        if skills_score < 50:
            weaknesses.append("Limited technical skills - consider adding more relevant skills")
        if experience_score < 50:
            weaknesses.append("Limited work experience - focus on projects and internships")
        if education_score < 50:
            weaknesses.append("Education section could be enhanced")
        if formatting_score < 50:
            weaknesses.append("Resume structure needs improvement")
        if keywords_score < 50:
            weaknesses.append("Add more action verbs and quantifiable achievements")
        
        return weaknesses
    
    def generate_recommendations(self, text: str, skills_found: list, 
                                scores: Dict[str, Any]) -> List[str]:
        """
        Generate specific recommendations for improvement
        """
        recs = []
        if scores["overall"] < 80:
            recs.append("Consider adding more relevant skills.")
        if len(text) < 500:
            recs.append("Expand your resume with more details.")
        if scores.get("years_experience", 0) < 2:
            recs.append("Add more work experience or describe your roles in detail.")
        return recs
    
    def _analyze_skill_coverage_weaknesses(self, skills_found: Dict[str, List[str]]) -> List[str]:
        """
        Analyze skill coverage and identify missing important skill categories
        """
        weaknesses = []
        
        # Define important skill categories and their importance levels
        important_categories = {
            'programming_languages': 'Programming Languages',
            'frameworks': 'Frameworks & Libraries', 
            'databases': 'Databases',
            'cloud_platforms': 'Cloud Platforms',
            'tools': 'Development Tools'
        }
        
        for category, display_name in important_categories.items():
            if category in skills_found:
                found_count = len(skills_found[category])
                if found_count == 0:
                    weaknesses.append(f"Missing {display_name} - Consider adding relevant skills in this category.")
                elif found_count <= 1:
                    weaknesses.append(f"Limited {display_name} - Add more skills to strengthen this area.")
        
        return weaknesses 