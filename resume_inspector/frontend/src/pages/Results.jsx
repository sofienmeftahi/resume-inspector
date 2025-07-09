import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaLinkedin, FaGithub, FaTwitter, FaDownload } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";
import { downloadPDFReport } from "../utils/pdfExport";

export default function Results() {
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("cv_analysis_result");
    if (stored) {
      try {
      setAnalysisData(JSON.parse(stored));
      } catch (e) {
        setAnalysisData(null);
      }
    } else {
      setAnalysisData(null);
    }
  }, []);

  if (!analysisData) {
    return (
      <div style={{padding: 40, fontSize: 20, color: '#888'}}>
        No analysis data found. Please upload your CV first.
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  // Extract new backend fields safely
  const fileName = analysisData.filename || analysisData.fileName || "CV";
  const analysisDate = analysisData.analysis_date || analysisData.analysisDate || "-";
  const overallScore = analysisData.scores?.overall ?? "N/A";
  const grade = analysisData.scores?.grade ?? "N/A";
  const yearsExperience = analysisData.scores?.years_experience ?? "N/A";
  const academicLevel = analysisData.scores?.academic_level ?? "N/A";
  const componentScores = analysisData.scores?.component_scores ?? {};
  const strengths = analysisData.scores?.strengths ?? [];
  const weaknesses = analysisData.scores?.weaknesses ?? [];
  const foundSkills = analysisData.skills?.found ?? [];
  const missingSkills = analysisData.skills?.missing ?? {};
  const allSkillsWithPresence = analysisData.skills?.all_skills_with_presence ?? {};
  const skillCoverage = analysisData.skills?.coverage ?? {};
  
  // Add 0% coverage categories to weaknesses
  const zeroCoverageWeaknesses = [];
  Object.entries(skillCoverage).forEach(([category, coverage]) => {
    if (coverage === 0) {
      const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      zeroCoverageWeaknesses.push(`Missing ${categoryName} - Add relevant skills in this category.`);
    }
  });
  
  const allWeaknesses = [...weaknesses, ...zeroCoverageWeaknesses];
  const recommendations = analysisData.recommendations ?? [];
  const textLength = analysisData.text_length ?? "-";
  const writingQuality = analysisData.writing_quality || {};
  const missingSections = analysisData.missing_sections || [];
  const jdMatching = analysisData.jd_matching || null;

  // Handler to go back to home/upload
  const handleUploadAnother = () => {
    window.location.href = "/";
  };

  // Handler for PDF download
  const handleDownloadPDF = async () => {
    if (!analysisData) return;
    
    setIsGeneratingPDF(true);
    try {
      const fileName = analysisData.filename || analysisData.fileName || "CV";
      const filename = `${fileName.replace(/\.[^/.]+$/, "")}-analysis-report.pdf`;
      await downloadPDFReport(analysisData, filename);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Add new tabs for Writing Quality and JD Matching
  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "skills", name: "Skills Analysis", icon: "💻" },
    { id: "experience", name: "Experience", icon: "🏢" },
    { id: "writing", name: "Writing Quality", icon: "📝" },
    { id: "missing", name: "Missing Sections", icon: "📌" },
    { id: "jd", name: "JD Matching", icon: "🤝" },
    { id: "recommendations", name: "Recommendations", icon: "💡" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-primary)" }}>
      {/* Navigation Bar */}
      <div
        style={{
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
          background: isDarkMode ? "rgba(31,41,55,0.92)" : "rgba(255,255,255,0.92)",
          boxShadow: `0 2px 12px 0 ${isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(44,54,99,0.08)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.7rem 2.5rem 0.7rem 2.5rem",
          borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e3eaf2"}`,
          backdropFilter: "blur(6px)",
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 24, color: isDarkMode ? "#f9fafb" : "#1a237e", letterSpacing: 1 }}>
          Resume Inspector
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <DarkModeToggle />
          <button
            style={{
              background: "#c62828",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 28px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(198,40,40,0.10)",
              transition: "background 0.2s, box-shadow 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      <div style={{ height: 72 }} /> {/* Spacer for nav */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem 1.5rem 1.5rem" }}>
        {/* Score Card */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 32, 
          alignItems: "center", 
          justifyContent: "space-between", 
          background: "var(--bg-primary)", 
          borderRadius: 18, 
          boxShadow: `0 4px 24px 0 ${isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(44,54,99,0.08)"}`, 
          padding: "2.5rem 2rem", 
          marginBottom: 32 
        }}>
          {/* Circular Score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180 }}>
            <svg width="110" height="110">
              <circle cx="55" cy="55" r="48" fill="#f7fafd" stroke="#e3ecfa" strokeWidth="6" />
              <circle
                cx="55" cy="55" r="48"
                fill="none"
                stroke="#4bb543"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - overallScore / 100)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s" }}
              />
              <text x="50%" y="54%" textAnchor="middle" fontSize="2.2rem" fontWeight="bold" fill="#1a237e" dy="0.3em">
                {overallScore}
              </text>
            </svg>
            <div style={{ color: "#5a6a85", fontWeight: 600, marginTop: 8 }}>Score</div>
          </div>
          {/* File info & progress */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>{fileName}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 10 }}>Analyzed on {analysisDate}</div>
            <div style={{ width: "100%", background: "var(--border-primary)", borderRadius: 8, height: 14, margin: "10px 0 8px 0" }}>
              <div style={{ height: 14, background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))", borderRadius: 8, width: `${overallScore}%`, transition: "width 1s" }} />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: 18 }}>{yearsExperience}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Years Exp.</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 18 }}>{grade}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Level</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-secondary)", fontSize: 18 }}>{academicLevel}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Academic</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>{foundSkills.length}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Skills</div>
              </div>
            </div>
          </div>
          {/* Download Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            style={{
              background: isGeneratingPDF ? "var(--text-muted)" : "var(--accent-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 32px",
              fontWeight: 700,
              fontSize: 17,
              cursor: isGeneratingPDF ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px 0 rgba(75,181,67,0.10)",
              transition: "background 0.2s, box-shadow 0.2s",
              alignSelf: "center",
              marginLeft: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: isGeneratingPDF ? 0.6 : 1,
            }}
          >
            {isGeneratingPDF ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                Generating...
              </>
            ) : (
              <>
                <FaDownload />
                Download PDF
              </>
            )}
          </button>
        </div>
        {/* Tabs */}
        <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px 0 rgba(44,54,99,0.06)", marginBottom: 32 }}>
          <div style={{ borderBottom: "1px solid #e3eaf2", display: "flex", gap: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "1.2rem 0",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid #4bb543" : "3px solid transparent",
                  background: "none",
                  fontWeight: 700,
                  fontSize: 17,
                  color: activeTab === tab.id ? "#1a237e" : "#5a6a85",
                  cursor: "pointer",
                  transition: "border 0.2s, color 0.2s",
                  outline: "none"
                }}
              >
                <span style={{ fontSize: 20, marginRight: 8 }}>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
          <div style={{ padding: "2.2rem 2rem" }}>
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  {/* Component Scores */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                    {Object.entries(componentScores).map(([component, score]) => (
                      <div key={component} style={{ 
                        background: "#e3ecfa", 
                        borderRadius: 12, 
                        padding: "16px 20px", 
                        minWidth: 150,
                        flex: 1
                      }}>
                        <div style={{ color: "#1a237e", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                          {component.charAt(0).toUpperCase() + component.slice(1)}
                        </div>
                        <div style={{ color: "#4bb543", fontWeight: 700, fontSize: 20 }}>
                          {score}
                        </div>
                        <div style={{ color: "#5a6a85", fontSize: 13 }}>
                          / 100
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
                  {/* Strengths */}
                  <div style={{ flex: 1, minWidth: 260, background: "linear-gradient(135deg, #e8f5e9 0%, #f7fafd 100%)", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#388e3c", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>✅ Strengths</h3>
                    <ul style={{ color: "#388e3c", fontSize: 15, paddingLeft: 18 }}>
                        {strengths.length > 0 ? strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No major strengths detected.</li>}
                    </ul>
                  </div>
                  {/* Weaknesses */}
                  <div style={{ flex: 1, minWidth: 260, background: "linear-gradient(135deg, #fff3e0 0%, #f7fafd 100%)", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#e65100", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>⚠️ Weaknesses</h3>
                    <ul style={{ color: "#e65100", fontSize: 15, paddingLeft: 18 }}>
                        {allWeaknesses.length > 0 ? allWeaknesses.map((w, i) => (
                          <li key={i} style={{ 
                            marginBottom: 8,
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: w.includes("Missing") || w.includes("Limited") ? "#ffebee" : "transparent",
                            borderLeft: w.includes("Missing") || w.includes("Limited") ? "3px solid #f44336" : "none"
                          }}>
                            {w}
                          </li>
                        )) : <li>No major weaknesses detected.</li>}
                    </ul>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "skills" && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  {/* Skills Coverage Summary */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                    {Object.entries(skillCoverage).map(([category, coverage]) => (
                      <div key={category} style={{ 
                        background: "#e3ecfa", 
                        borderRadius: 12, 
                        padding: "16px 20px", 
                        minWidth: 200,
                        flex: 1
                      }}>
                        <div style={{ color: "#1a237e", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                          {category.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div style={{ width: "100%", background: "#e3eaf2", borderRadius: 8, height: 12, margin: "8px 0" }}>
                          <div 
                            style={{ 
                              height: 12, 
                              background: coverage === 0 ? "#f44336" : coverage < 30 ? "#ff9800" : "#4bb543", 
                              borderRadius: 8, 
                              width: `${Math.min(coverage, 100)}%`, 
                              transition: "width 0.5s, background 0.3s" 
                            }} 
                          />
                        </div>
                        <div style={{ color: "#5a6a85", fontSize: 13, textAlign: "center" }}>
                          {coverage === 0 ? "No Skills" : coverage < 30 ? "Limited" : coverage < 70 ? "Good" : "Excellent"}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* All Skills by Category */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                    {Object.entries(allSkillsWithPresence).map(([category, skills]) => (
                      <div key={category} style={{ 
                        flex: 1, 
                        minWidth: 300, 
                        background: "#f8f9fa", 
                        borderRadius: 14, 
                        padding: 20,
                        border: "1px solid #e3eaf2"
                      }}>
                        <h3 style={{ 
                          color: "#1a237e", 
                          fontWeight: 700, 
                          fontSize: 18, 
                          marginBottom: 16,
                          textTransform: "capitalize"
                        }}>
                          {category.replace(/_/g, ' ')}
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 20,
                                fontSize: 13,
                                fontWeight: 600,
                                background: skill.present_in_cv ? "#e8f5e9" : "#f5f5f5",
                                color: skill.present_in_cv ? "#2e7d32" : "#757575",
                                border: skill.present_in_cv ? "1px solid #4caf50" : "1px solid #e0e0e0"
                              }}
                            >
                              {skill.name}
                              {skill.present_in_cv && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === "experience" && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 32 }}
                >
                  <div style={{ flex: 1, minWidth: 260, background: "#e3ecfa", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#1a237e", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Years of Experience</h3>
                    <div style={{ color: "#1a237e", fontSize: 22, fontWeight: 700 }}>{yearsExperience}</div>
                    <div style={{ color: "#5a6a85", fontSize: 15, marginTop: 8 }}>
                      Estimated from your CV content
                      {yearsExperience === "N/A" || yearsExperience === 0 ? (
                        <div style={{ color: "#e65100", fontSize: 14, marginTop: 6 }}>
                          Tip: Add explicit years (e.g., "5 years at Company") to help detection.
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 260, background: "#fffde7", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#e65100", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Resume Length</h3>
                    <div style={{ color: "#e65100", fontSize: 22, fontWeight: 700 }}>{textLength} characters</div>
                    <div style={{ color: "#5a6a85", fontSize: 15, marginTop: 8 }}>Longer resumes may show more experience</div>
                  </div>
                </motion.div>
              )}
              {activeTab === "writing" && (
                <motion.div
                  key="writing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 32 }}
                >
                  <div style={{ flex: 1, minWidth: 260, background: "#e3ecfa", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#1a237e", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>📝 Writing Quality</h3>
                    <div style={{ fontSize: 16, color: "#1a237e", marginBottom: 8 }}>
                      <b>Score:</b> {writingQuality.writing_score ?? "-"} / 100
                    </div>
                    <div style={{ fontSize: 15, color: "#e65100", marginBottom: 8 }}>
                      <b>Grammar Errors:</b> {writingQuality.grammar_errors ?? "-"}
                    </div>
                    <ul style={{ color: "#1a237e", fontSize: 15, paddingLeft: 18 }}>
                      {writingQuality.suggestions && writingQuality.suggestions.length > 0 ? writingQuality.suggestions.map((s, i) => <li key={i}>{s}</li>) : <li>No suggestions.</li>}
                    </ul>
                  </div>
                </motion.div>
              )}
              {activeTab === "missing" && (
                <motion.div
                  key="missing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 32 }}
                >
                  <div style={{ flex: 1, minWidth: 260, background: "#fffde7", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#e65100", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>📌 Missing Sections</h3>
                    <ul style={{ color: "#e65100", fontSize: 15, paddingLeft: 18 }}>
                      {missingSections.length > 0 ? missingSections.map((sec, i) => (
                        <li key={i}><b>{sec.section}:</b> {sec.message}</li>
                      )) : <li>All main sections found.</li>}
                    </ul>
                  </div>
                </motion.div>
              )}
              {activeTab === "jd" && (
                <motion.div
                  key="jd"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 32 }}
                >
                  <div style={{ flex: 1, minWidth: 260, background: "#e3ecfa", borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: "#1a237e", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>🤝 JD Matching</h3>
                    {jdMatching ? (
                      <>
                        <div style={{ fontSize: 16, color: "#1a237e", marginBottom: 8 }}>
                          <b>Match Score:</b> {jdMatching.match_score ?? "-"} / 100
                        </div>
                        <div style={{ fontSize: 15, color: "#4bb543", marginBottom: 8 }}>
                          <b>Perfect Matches:</b> {jdMatching.perfect_matches?.join(", ") || "-"}
                        </div>
                        <div style={{ fontSize: 15, color: "#e65100", marginBottom: 8 }}>
                          <b>Missing Skills:</b> {jdMatching.missing_skills?.join(", ") || "-"}
                        </div>
                      </>
                    ) : <div style={{ color: "#5a6a85" }}>No JD provided for matching.</div>}
                  </div>
                </motion.div>
              )}
              {activeTab === "recommendations" && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 32 }}
                >
                  <div style={{ flex: 1, minWidth: 260, background: "#e3ecfa", borderRadius: 14, padding: 24 }}>
                  <h3 style={{ color: "#1a237e", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Recommendations</h3>
                  <ul style={{ color: "#1a237e", fontSize: 15, paddingLeft: 18 }}>
                      {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      )) : <li>No recommendations at this time.</li>}
                  </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button
            onClick={handleUploadAnother}
            style={{
              background: "#6a82fb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(106,130,251,0.10)",
              marginRight: 8
            }}
          >
            Upload Another CV
          </button>
        </div>
      </div>
      {/* Footer */}
      <footer
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.93)",
          borderTop: "1px solid #e3eaf2",
          padding: "1.5rem 0 0.7rem 0",
          textAlign: "center",
          color: "#5a6a85",
          fontSize: 15,
          marginTop: 32,
          boxShadow: "0 -2px 12px 0 rgba(44,54,99,0.04)",
        }}
      >
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
            <a href="#" title="LinkedIn" style={{ color: "#1a237e", fontSize: 20 }}><FaLinkedin /></a>
            <a href="#" title="GitHub" style={{ color: "#1a237e", fontSize: 20 }}><FaGithub /></a>
            <a href="#" title="Twitter" style={{ color: "#1a237e", fontSize: 20 }}><FaTwitter /></a>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#b0b8c9" }}>
          © {new Date().getFullYear()} Resume Inspector. All rights reserved. &nbsp;|&nbsp; Made with <span style={{ color: "#e25555", fontSize: 15 }}>♥</span> by <span style={{ color: "#1a237e", fontWeight: 600 }}>Sofien</span>
        </div>
      </footer>
    </div>
  );
} 