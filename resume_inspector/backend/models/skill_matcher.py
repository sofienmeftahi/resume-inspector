import re
import json
import os
from typing import List, Dict, Set
import spacy

class SkillMatcher:
    def __init__(self):
        self.skills_database = self._load_skills_database()
        self.all_skills = self._get_all_skills_from_database()
        self.nlp = spacy.load("en_core_web_sm")

    def _load_skills_database(self) -> Dict[str, List[str]]:
        """
        Load skills database from JSON file or create default
        """
        skills_file = os.path.join(os.path.dirname(__file__), 'skills_database.json')
        
        if os.path.exists(skills_file):
            try:
                with open(skills_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        
        # Default skills database
        return {
            "programming_languages": [
                "python", "javascript", "java", "c++", "c#", "php", "ruby", "go", "rust", "swift",
                "kotlin", "scala", "r", "matlab", "sql", "html", "css", "typescript", "dart"
            ],
            "frameworks": [
                "react", "angular", "vue", "node.js", "django", "flask", "spring", "express",
                "laravel", "rails", "asp.net", "fastapi", "tensorflow", "pytorch", "scikit-learn"
            ],
            "databases": [
                "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "sql server",
                "elasticsearch", "cassandra", "dynamodb", "firebase"
            ],
            "cloud_platforms": [
                "aws", "azure", "google cloud", "heroku", "digitalocean", "linode",
                "kubernetes", "docker", "terraform", "jenkins", "gitlab"
            ],
            "tools": [
                "git", "github", "gitlab", "jira", "confluence", "slack", "trello",
                "figma", "adobe", "photoshop", "illustrator", "excel", "powerpoint"
            ],
            "soft_skills": [
                "leadership", "communication", "teamwork", "problem solving", "critical thinking",
                "time management", "project management", "collaboration", "adaptability",
                "creativity", "analytical thinking", "attention to detail"
            ],
            "languages": [
                "english", "spanish", "french", "german", "chinese", "japanese", "arabic",
                "portuguese", "italian", "russian", "korean", "hindi"
            ]
        }
    
    def _get_all_skills_from_database(self) -> List[str]:
        """
        Get all skills from the database as a flat list
        """
        all_skills = []
        for category_skills in self.skills_database.values():
            all_skills.extend(category_skills)
        return all_skills

    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """
        Extract skills from CV text and categorize them
        Returns: Dict with categories as keys and found skills as values
        """
        text_lower = text.lower()
        found_skills = {category: [] for category in self.skills_database.keys()}
        
        # 1. Extract from comprehensive skills database with flexible matching
        for category, skills in self.skills_database.items():
            for skill in skills:
                # Check for exact match and variations
                if skill.lower() in text_lower:
                    found_skills[category].append(skill)
                # Also check for common variations (e.g., "Python" vs "python")
                elif skill.title() in text or skill.upper() in text:
                    found_skills[category].append(skill)
                # Check for partial matches (e.g., "Python" in "Python Developer")
                elif any(skill.lower() in word.lower() for word in text.split()):
                    found_skills[category].append(skill)
        
        # 2. Dynamic extraction from SKILLS section (more comprehensive)
        skills_section_patterns = [
            r'SKILLS?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'TECHNICAL SKILLS?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'PROGRAMMING SKILLS?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'LANGUAGES?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'TOOLS?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'COMPETENCES?[:\-\s]+([\w\s,\-\.\(\)]+)',  # French
            r'COMPETENCIES?[:\-\s]+([\w\s,\-\.\(\)]+)',
            r'TECHNOLOGIES?[:\-\s]+([\w\s,\-\.\(\)]+)'
        ]
        
        for pattern in skills_section_patterns:
            skills_sections = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for section in skills_sections:
                # Split by common delimiters and clean up
                skills = re.split(r'[\n,\-•\|\/]+', section)
                for skill in skills:
                    skill = skill.strip()
                    if len(skill) > 1:
                        # Try to categorize the skill
                        categorized = False
                        for category, known_skills in self.skills_database.items():
                            if skill.lower() in [s.lower() for s in known_skills]:
                                if skill not in found_skills[category]:
                                    found_skills[category].append(skill)
                                categorized = True
                                break
                        
                        # If not categorized, add to appropriate category based on common patterns
                        if not categorized:
                            if any(tech in skill.lower() for tech in ['python', 'java', 'javascript', 'c++', 'sql', 'html', 'css', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'typescript', 'dart']):
                                if skill not in found_skills['programming_languages']:
                                    found_skills['programming_languages'].append(skill)
                            elif any(fw in skill.lower() for fw in ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel', 'rails', 'asp.net', 'fastapi', 'tensorflow', 'pytorch', 'scikit-learn', 'node.js']):
                                if skill not in found_skills['frameworks']:
                                    found_skills['frameworks'].append(skill)
                            elif any(db in skill.lower() for db in ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase']):
                                if skill not in found_skills['databases']:
                                    found_skills['databases'].append(skill)
                            elif any(cloud in skill.lower() for cloud in ['aws', 'azure', 'google cloud', 'heroku', 'digitalocean', 'linode', 'kubernetes', 'docker', 'terraform', 'jenkins', 'gitlab']):
                                if skill not in found_skills['cloud_platforms']:
                                    found_skills['cloud_platforms'].append(skill)
                            elif any(tool in skill.lower() for tool in ['git', 'jira', 'confluence', 'slack', 'trello', 'figma', 'adobe', 'photoshop', 'illustrator', 'excel', 'powerpoint']):
                                if skill not in found_skills['tools']:
                                    found_skills['tools'].append(skill)
                            elif any(soft in skill.lower() for soft in ['leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'time management', 'project management', 'collaboration', 'adaptability', 'creativity', 'analytical thinking', 'attention to detail']):
                                if skill not in found_skills['soft_skills']:
                                    found_skills['soft_skills'].append(skill)
                            elif any(lang in skill.lower() for lang in ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'arabic', 'portuguese', 'italian', 'russian', 'korean', 'hindi']):
                                if skill not in found_skills['languages']:
                                    found_skills['languages'].append(skill)
                            else:
                                # Add to programming languages as default for technical terms
                                if skill not in found_skills['programming_languages']:
                                    found_skills['programming_languages'].append(skill)
        
        # 3. Additional extraction: Look for skills mentioned in context
        for category, skills in self.skills_database.items():
            for skill in skills:
                # Look for skills mentioned in sentences
                if skill.lower() in text_lower and skill not in found_skills[category]:
                    found_skills[category].append(skill)
        
        # 4. Remove duplicates and sort within each category
        for category in found_skills:
            found_skills[category] = sorted(list(set(found_skills[category])))
        
        return found_skills

    def get_all_skills_with_presence(self, cv_text: str) -> Dict[str, List[Dict[str, any]]]:
        """
        Get all skills from database with presence indicator for each skill
        Returns: Dict with categories and skills with presence info
        """
        cv_text_lower = cv_text.lower()
        result = {}
        
        for category, skills in self.skills_database.items():
            result[category] = []
            for skill in skills:
                present = skill.lower() in cv_text_lower or skill.title() in cv_text or skill.upper() in cv_text
                result[category].append({
                    "name": skill,
                    "present_in_cv": present
                })
        
        return result

    def get_missing_skills(self, found_skills: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """
        Get missing skills by category
        """
        missing = {}
        for category, found in found_skills.items():
            all_category_skills = self.skills_database.get(category, [])
            missing[category] = [skill for skill in all_category_skills if skill not in found]
        return missing

    def get_all_skills(self) -> List[str]:
        """
        Get all skills as a flat list
        """
        return self.all_skills

    def get_skill_categories(self) -> Dict[str, List[str]]:
        """
        Get skills organized by categories
        """
        return self.skills_database

    def _get_skill_categories(self) -> Dict[str, str]:
        """
        Get skill category descriptions
        """
        return {
            "programming_languages": "Programming & Development Languages",
            "frameworks": "Frameworks & Libraries",
            "databases": "Databases & Data Storage",
            "cloud_platforms": "Cloud Platforms & DevOps",
            "tools": "Development Tools & Software",
            "soft_skills": "Soft Skills & Personal Qualities",
            "languages": "Spoken Languages"
        }
    
    def calculate_skill_coverage(self, found_skills: Dict[str, List[str]]) -> Dict[str, float]:
        """
        Calculate skill coverage percentage by category
        """
        coverage = {}
        
        for category, skills in self.skills_database.items():
            found_count = len(found_skills.get(category, []))
            total_count = len(skills)
            # Ensure coverage doesn't exceed 100%
            coverage[category] = min((found_count / total_count) * 100, 100.0) if total_count > 0 else 0.0
        
        return coverage
    
    def get_top_skills(self, found_skills: Dict[str, List[str]], limit: int = 10) -> List[str]:
        """
        Get top skills found in the resume
        """
        all_found = []
        for skills in found_skills.values():
            all_found.extend(skills)
        
        return all_found[:limit] 