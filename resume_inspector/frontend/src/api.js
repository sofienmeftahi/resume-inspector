// API configuration for Resume Inspector
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  ANALYZE: `${API_BASE_URL}/api/analyze`,
  SKILLS: `${API_BASE_URL}/api/skills`,
  JD_MATCH: `${API_BASE_URL}/api/jd-match`
};

// API functions
export const api = {
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Backend not available' };
    }
  },

  // Analyze CV
  async analyzeCV(file, jdText = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (jdText) {
      formData.append('jd_text', jdText);
    }

    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CV analysis failed:', error);
      throw error;
    }
  },

  // Get available skills
  async getSkills() {
    try {
      const response = await fetch(API_ENDPOINTS.SKILLS);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      return { skills: [], categories: {} };
    }
  },

  // JD matching
  async jdMatch(cvText, jdText) {
    try {
      const response = await fetch(API_ENDPOINTS.JD_MATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv_text: cvText, jd_text: jdText }),
      });

      return await response.json();
    } catch (error) {
      console.error('JD matching failed:', error);
      throw error;
    }
  }
}; 