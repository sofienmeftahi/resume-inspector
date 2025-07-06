# 🚀 Resume Inspector - AI-Powered CV Analysis

A modern, intelligent CV analysis web application that provides comprehensive feedback on resumes using AI-powered analysis, skill matching, and professional recommendations.

## ✨ Features

### 🎯 **Smart Analysis**
- **AI-Powered Scoring**: Multi-component analysis (Skills, Experience, Education, Formatting, Keywords)
- **Academic Level Detection**: Automatically identifies degree levels (Master, Bachelor, PhD, etc.)
- **Years of Experience**: Intelligent extraction from date ranges and work history
- **Real-time Processing**: Always analyzes fresh uploads, no cached data

### 💻 **Comprehensive Skills Analysis**
- **7 Skill Categories**: Programming Languages, Frameworks, Databases, Cloud Platforms, Tools, Soft Skills, Languages
- **Visual Progress Bars**: Intuitive skill coverage visualization
- **Smart Categorization**: Automatic skill classification and matching
- **Coverage Analysis**: Identifies missing skill categories as weaknesses

### 📝 **Writing Quality & Structure**
- **Grammar Analysis**: Integration with LanguageTool API
- **Missing Sections Detection**: Identifies gaps in CV structure
- **Professional Recommendations**: Actionable improvement suggestions
- **Formatting Assessment**: Structure and organization scoring

### 🤝 **Job Description Matching**
- **JD Comparison**: Match CV skills against job requirements
- **Match Scoring**: Percentage-based compatibility analysis
- **Missing Skills Highlighting**: Identifies gaps for specific positions
- **Perfect Matches**: Shows aligned skills and experience

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Animations**: Smooth transitions with Framer Motion
- **Interactive Components**: Progress bars, tabs, and visual feedback
- **Professional Styling**: Clean, modern interface with TailwindCSS

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Icons** - Beautiful icon library

### **Backend**
- **Flask** - Python web framework
- **spaCy** - Natural language processing
- **LanguageTool API** - Grammar and style checking
- **dateutil** - Date parsing and manipulation
- **Werkzeug** - File upload handling

### **Text Processing**
- **PDF/DOCX Support** - Multi-format document parsing
- **Regex Patterns** - Intelligent text extraction
- **Skill Matching** - Comprehensive skill database
- **Experience Calculation** - Date range analysis

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resume-inspector.git
cd resume-inspector
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd resume_inspector/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install spaCy language model
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd resume_inspector/frontend

# Install Node.js dependencies
npm install
```

## 🚀 Running the Application

### 1. Start Backend Server
```bash
cd resume_inspector/backend
python app.py
```
Backend will be available at: `http://localhost:8000`

### 2. Start Frontend Development Server
```bash
cd resume_inspector/frontend
npm run dev
```
Frontend will be available at: `http://localhost:5173`

### 3. Access the Application
Open your browser and go to: `http://localhost:5173`

## 📖 Usage

### 1. Upload Your CV
- Click "Choose File" or drag and drop your CV
- Supported formats: PDF, DOC, DOCX
- Maximum file size: 5MB

### 2. View Analysis Results
- **Overview**: Overall score, component scores, strengths, and weaknesses
- **Skills Analysis**: Visual skill coverage with progress bars
- **Experience**: Years of experience and resume length analysis
- **Writing Quality**: Grammar score and improvement suggestions
- **Missing Sections**: Identified gaps in CV structure
- **JD Matching**: Job description compatibility (if provided)
- **Recommendations**: Actionable improvement tips

### 3. Interpret Results
- **Green Progress Bars**: Good skill coverage
- **Orange Progress Bars**: Limited skill coverage
- **Red Progress Bars**: Missing skills in category
- **Component Scores**: Detailed breakdown of CV quality
- **Weaknesses**: Areas for improvement with specific suggestions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
MAX_CONTENT_LENGTH=5242880
```

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/analyze` - CV analysis
- `GET /api/skills` - Available skills
- `POST /api/jd-match` - Job description matching

## 📁 Project Structure

```
resume_inspector/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── models/
│   │   ├── skill_matcher.py   # Skill extraction and matching
│   │   └── scoring.py         # CV scoring algorithms
│   └── parser/
│       └── extract_text.py    # Document text extraction
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Upload page
│   │   │   └── Results.jsx    # Analysis results
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # App entry point
│   ├── package.json           # Node.js dependencies
│   └── index.html             # HTML template
└── README.md                  # This file
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Add tests for new features
- Update documentation for API changes

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend won't start:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Skills not detected:**
- Ensure CV has clear "Skills" section
- Check if skills are mentioned in text
- Verify file format is supported

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LanguageTool** for grammar checking API
- **spaCy** for natural language processing
- **React** and **Flask** communities
- **TailwindCSS** for beautiful styling

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Made with Sofien for better resumes and career success!**
