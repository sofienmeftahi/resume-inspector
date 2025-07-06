import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ResumeIllustration from "../assets/2d75b10d-10aa-4a29-ad05-b285afb32d37.png";

export default function Home() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setError("");
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file");
      return;
    }
    
    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    // Clear localStorage before uploading to avoid old data
    localStorage.clear();
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }
      const result = await response.json();
      // Save result to localStorage for Results page
      localStorage.setItem('cv_analysis_result', JSON.stringify(result));
      navigate('/results', { state: { analysis: result } });
    } catch (err) {
      setError("Failed to analyze CV. Please try again.");
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "linear-gradient(135deg, #e3ecfa 0%, #f7fafd 100%)", position: "relative", overflow: "hidden" }}>
      {/* Navigation Bar */}
      <div style={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 20, background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 12px 0 rgba(44,54,99,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 2.5rem 0.7rem 2.5rem", borderBottom: "1px solid #e3eaf2", backdropFilter: "blur(6px)" }}>
        <span style={{ fontWeight: 800, fontSize: 24, color: "#1a237e", letterSpacing: 1 }}>
          Resume Inspector
        </span>
        <button style={{ background: "#4bb543", color: "#fff", border: "none", borderRadius: 8, padding: "8px 28px", fontWeight: 700, fontSize: 17, cursor: "pointer", boxShadow: "0 2px 8px 0 rgba(75,181,67,0.10)", transition: "background 0.2s, box-shadow 0.2s" }}>
          Login
        </button>
      </div>
      {/* Main Content */}
      <div style={{ minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: 1100, minHeight: 520, background: "rgba(255,255,255,0.04)", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(44, 54, 99, 0.10)", overflow: "hidden", border: "1px solid #1a237e22" }}>
          {/* Left Side: All content */}
          <div style={{ flex: 1, background: "#fff", padding: "3.5rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", minWidth: 0 }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 18, color: "#2a3a5a", letterSpacing: "-1px", textAlign: "left", textShadow: "none" }}>
              Resume Inspector
            </h1>
            <ul style={{ padding: 0, margin: 0, listStyle: "none", marginBottom: 32 }}>
              <li style={{ marginBottom: 18, display: "flex", alignItems: "flex-start" }}>
                <span style={{ color: "#4bb543", fontSize: 20, marginRight: 10, marginTop: 2 }}>✔</span>
                <div>
                  <b style={{ color: "#2a3a5a" }}>Upload your CV for instant feedback</b>
                  <div style={{ color: "#5a6a85", fontSize: 15, marginTop: 2 }}>
                    Get a score and smart recommendations to improve your resume.
                  </div>
                </div>
              </li>
              <li style={{ marginBottom: 18, display: "flex", alignItems: "flex-start" }}>
                <span style={{ color: "#4bb543", fontSize: 20, marginRight: 10, marginTop: 2 }}>✔</span>
                <div>
                  <b style={{ color: "#2a3a5a" }}>Safe & private</b>
                  <div style={{ color: "#5a6a85", fontSize: 15, marginTop: 2 }}>
                    Your file is never shared and is deleted after analysis.
                  </div>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start" }}>
                <span style={{ color: "#4bb543", fontSize: 20, marginRight: 10, marginTop: 2 }}>✔</span>
                <div>
                  <b style={{ color: "#2a3a5a" }}>Free to use</b>
                  <div style={{ color: "#5a6a85", fontSize: 15, marginTop: 2 }}>
                    No signup required. Fast, simple, and effective.
                  </div>
                </div>
              </li>
            </ul>
            <div style={{ width: "100%", maxWidth: 380 }}>
              <h2 style={{ color: "#2a3a5a", fontWeight: 700, fontSize: 20, marginBottom: 18, textAlign: "left" }}>
                Upload your CV
              </h2>
              
              {/* File Upload Area */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.7 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{ 
                  width: "100%", 
                  background: dragActive ? "#e8f2ff" : file ? "#f0f9ff" : "#f7fafd", 
                  border: `2px dashed ${dragActive ? "#4bb543" : file ? "#4bb543" : "#6a82fb"}`, 
                  borderRadius: 10, 
                  padding: "1.5rem 0.5rem", 
                  textAlign: "center", 
                  color: "#2a3a5a", 
                  fontWeight: 500, 
                  fontSize: 18, 
                  marginBottom: 0, 
                  transition: "all 0.2s", 
                  display: "block", 
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                {file ? (
                  <div>
                    <i className="fas fa-check-circle" style={{ color: "#4bb543", fontSize: 32, marginBottom: 8 }}></i>
                    <div style={{ margin: "10px 0 4px 0", fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: "#5a6a85", fontSize: 14 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </div>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-cloud-upload-alt" style={{ color: dragActive ? "#4bb543" : "#6a82fb", fontSize: 32, marginBottom: 8 }}></i>
                    <div style={{ margin: "10px 0 4px 0" }}>
                      {dragActive ? "Drop your CV here" : "Click to upload CV"}
                    </div>
                    <div style={{ color: "#5a6a85", fontSize: 14 }}>
                      PDF or DOCX (max 5MB)
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                style={{ display: "none" }}
              />

              {/* Error message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    color: "#dc2626", 
                    fontSize: 14, 
                    marginTop: 8, 
                    textAlign: "center",
                    background: "#fef2f2",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #fecaca"
                  }}
                >
                  {error}
                </motion.div>
              )}

              <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                style={{ 
                  width: "100%", 
                  background: !file || isUploading ? "#9ca3af" : "#4bb543", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 8, 
                  padding: "14px 0", 
                  fontSize: 18, 
                  fontWeight: 700, 
                  marginTop: 18, 
                  cursor: !file || isUploading ? "not-allowed" : "pointer", 
                  boxShadow: "0 2px 12px 0 rgba(75,181,67,0.10)", 
                  transition: "all 0.2s",
                  opacity: !file || isUploading ? 0.6 : 1
                }}
              >
                {isUploading ? (
                  <span>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </div>
          </div>
          {/* Right Side: Illustration only */}
          <div style={{ flex: 1, background: "linear-gradient(135deg, #0a102a 0%, #1a237e 100%)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 520, position: "relative" }}>
            <img src={ResumeIllustration} alt="Resume Illustration" style={{ width: "90%", maxWidth: 520, minWidth: 260, objectFit: "contain", filter: "drop-shadow(0 8px 32px rgba(44,54,99,0.13))", borderRadius: 24 }} />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer style={{ width: "100%", background: "rgba(255,255,255,0.93)", borderTop: "1px solid #e3eaf2", padding: "1.5rem 0 0.7rem 0", textAlign: "center", color: "#5a6a85", fontSize: 15, marginTop: 32, boxShadow: "0 -2px 12px 0 rgba(44,54,99,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 2rem" }}>
          {/* Left: Logo & message */}
          <div style={{ textAlign: "left", minWidth: 220 }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#1a237e", letterSpacing: 1 }}>Resume Inspector</span>
            <div style={{ fontSize: 14, color: "#5a6a85", marginTop: 4 }}>
              Helping you land your dream job with a standout CV!
            </div>
          </div>
          {/* Center: Quick Links */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#" style={{ color: "#1a237e", textDecoration: "none", fontWeight: 500 }}>About</a>
            <a href="#" style={{ color: "#1a237e", textDecoration: "none", fontWeight: 500 }}>Contact</a>
            <a href="#" style={{ color: "#1a237e", textDecoration: "none", fontWeight: 500 }}>Privacy Policy</a>
          </div>
          {/* Right: Social icons */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "flex-end", minWidth: 120 }}>
            <a href="#" title="LinkedIn" style={{ color: "#1a237e", fontSize: 20 }}><i className="fab fa-linkedin"></i></a>
            <a href="#" title="GitHub" style={{ color: "#1a237e", fontSize: 20 }}><i className="fab fa-github"></i></a>
            <a href="#" title="Twitter" style={{ color: "#1a237e", fontSize: 20 }}><i className="fab fa-twitter"></i></a>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#b0b8c9" }}>
          © {new Date().getFullYear()} Resume Inspector. All rights reserved. &nbsp;|&nbsp; Made with <span style={{ color: "#e25555", fontSize: 15 }}>♥</span> by <span style={{ color: "#1a237e", fontWeight: 600 }}>Sofien</span>
        </div>
      </footer>
    </div>
  );
} 