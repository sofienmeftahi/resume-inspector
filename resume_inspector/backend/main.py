from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import docx
import io

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_bytes):
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

@app.post("/api/analyze")
async def analyze_cv(file: UploadFile = File(...)):
    content = await file.read()
    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    elif file.filename.endswith(".docx"):
        text = extract_text_from_docx(content)
    else:
        return {"error": "Unsupported file type"}

    # --- Fake analysis for demo ---
    # Here you can add real NLP/AI logic
    result = {
        "overallScore": 78,
        "fileName": file.filename,
        "analysisDate": "2024-07-05",
        "skills": {
            "matched": [
                {"name": "React", "level": "Advanced", "relevance": 95},
                {"name": "Python", "level": "Intermediate", "relevance": 85}
            ],
            "missing": [
                {"name": "TypeScript", "importance": "High", "reason": "Industry standard for React projects"}
            ]
        },
        "experience": {
            "totalYears": 3.5,
            "relevantYears": 2.8,
            "level": "Mid-Level",
            "companies": ["TechCorp", "StartupXYZ"]
        },
        "formatting": {
            "score": 85,
            "issues": [
                "Consider adding more action verbs",
                "Contact information is well formatted"
            ]
        },
        "recommendations": [
            "Add TypeScript to your skills section",
            "Include specific metrics in your achievements"
        ]
    }
    return result 