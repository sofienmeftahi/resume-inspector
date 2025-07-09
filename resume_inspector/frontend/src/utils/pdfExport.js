import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (analysisData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  let yPosition = margin;
  const lineHeight = 7;
  const sectionGap = 15;

  // Helper function to add text with word wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.4);
  };

  // Helper function to add section header
  const addSectionHeader = (title, y) => {
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 35, 126); // Dark blue
    pdf.text(title, margin, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    return y + lineHeight + 5;
  };

  // Helper function to add score circle (compatible with jsPDF)
  const addScoreCircle = (score, x, y, radius = 15) => {
    let safeScore = Number(score);
    if (isNaN(safeScore) || safeScore < 0) safeScore = 0;
    if (safeScore > 100) safeScore = 100;
    const centerX = x + radius;
    const centerY = y + radius;
    // Background circle
    pdf.setDrawColor(231, 236, 250);
    pdf.setFillColor(231, 236, 250);
    pdf.circle(centerX, centerY, radius, 'F');
    // Border circle (instead of arc)
    pdf.setDrawColor(75, 181, 67); // Green
    pdf.setLineWidth(2);
    pdf.circle(centerX, centerY, radius, 'S');
    // Score text
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(26, 35, 126);
    pdf.text(isNaN(Number(score)) ? "N/A" : safeScore.toString(), centerX - 3, centerY + 2);
  };

  // Title
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(26, 35, 126);
  pdf.text('Resume Analysis Report', margin, yPosition);
  yPosition += lineHeight + 10;

  // File info
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(90, 106, 133);
  const fileName = analysisData.filename || analysisData.fileName || "CV";
  const analysisDate = analysisData.analysis_date || analysisData.analysisDate || "-";
  pdf.text(`File: ${fileName}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Analyzed: ${analysisDate}`, margin, yPosition);
  yPosition += sectionGap;

  // Overall Score (robust)
  yPosition = addSectionHeader('Overall Score', yPosition);
  const overallScore = Number(analysisData.scores?.overall);
  addScoreCircle(isNaN(overallScore) ? 0 : overallScore, margin, yPosition);
  yPosition += 40;

  // Component Scores (robust)
  yPosition = addSectionHeader('Component Scores', yPosition);
  const componentScores = analysisData.scores?.component_scores ?? {};
  Object.entries(componentScores).forEach(([component, score]) => {
    const componentName = component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const safeScore = Number(score);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text(componentName, margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(`: ${isNaN(safeScore) ? 'N/A' : safeScore + '%'}`, margin + 60, yPosition);
    yPosition += lineHeight;
  });
  yPosition += sectionGap;

  // Experience & Education (robust)
  yPosition = addSectionHeader('Experience & Education', yPosition);
  const yearsExperience = Number(analysisData.scores?.years_experience);
  const academicLevel = analysisData.scores?.academic_level ?? "N/A";
  const grade = analysisData.scores?.grade ?? "N/A";
  pdf.setFontSize(11);
  pdf.text(`Years of Experience: ${isNaN(yearsExperience) ? 'N/A' : yearsExperience}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Academic Level: ${academicLevel}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Grade Level: ${grade}`, margin, yPosition);
  yPosition += sectionGap;

  // Skills Analysis
  yPosition = addSectionHeader('Skills Analysis', yPosition);
  const foundSkills = analysisData.skills?.found ?? [];
  const skillCoverage = analysisData.skills?.coverage ?? {};
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Found Skills:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont(undefined, 'normal');
  if (foundSkills.length > 0) {
    const skillsText = foundSkills.slice(0, 10).join(', ') + (foundSkills.length > 10 ? '...' : '');
    const skillsHeight = addWrappedText(skillsText, margin, yPosition, contentWidth, 10);
    yPosition += skillsHeight + 5;
  } else {
    pdf.text('No skills found', margin, yPosition);
    yPosition += lineHeight;
  }
  // Skill Coverage (robust)
  pdf.setFont(undefined, 'bold');
  pdf.text('Skill Coverage by Category:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFont(undefined, 'normal');
  Object.entries(skillCoverage).forEach(([category, coverage]) => {
    const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const safeCoverage = Number(coverage);
    pdf.text(`${categoryName}: ${isNaN(safeCoverage) ? 'N/A' : safeCoverage + '%'}`, margin, yPosition);
    yPosition += lineHeight;
  });
  yPosition += sectionGap;

  // Strengths
  yPosition = addSectionHeader('Strengths', yPosition);
  const strengths = analysisData.scores?.strengths ?? [];
  if (strengths.length > 0) {
    strengths.forEach((strength, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFontSize(10);
      pdf.text(`• ${strength}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    pdf.text('No specific strengths identified', margin, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionGap;

  // Weaknesses
  yPosition = addSectionHeader('Areas for Improvement', yPosition);
  const weaknesses = analysisData.scores?.weaknesses ?? [];
  const missingSkills = analysisData.skills?.missing ?? {};
  // Add missing skill categories to weaknesses
  const zeroCoverageWeaknesses = [];
  Object.entries(skillCoverage).forEach(([category, coverage]) => {
    const safeCoverage = Number(coverage);
    if (safeCoverage === 0) {
      const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      zeroCoverageWeaknesses.push(`Missing ${categoryName} - Add relevant skills in this category.`);
    }
  });
  const allWeaknesses = [...weaknesses, ...zeroCoverageWeaknesses];
  if (allWeaknesses.length > 0) {
    allWeaknesses.forEach((weakness, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFontSize(10);
      pdf.text(`• ${weakness}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    pdf.text('No specific areas for improvement identified', margin, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionGap;

  // Recommendations
  yPosition = addSectionHeader('Recommendations', yPosition);
  const recommendations = analysisData.recommendations ?? [];
  if (recommendations.length > 0) {
    recommendations.forEach((recommendation, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFontSize(10);
      const recHeight = addWrappedText(`• ${recommendation}`, margin + 5, yPosition, contentWidth - 5, 10);
      yPosition += recHeight + 2;
    });
  } else {
    pdf.text('No specific recommendations available', margin, yPosition);
    yPosition += lineHeight;
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    pdf.text('Generated by Resume Inspector', margin, pageHeight - 10);
  }

  return pdf;
};

export const downloadPDFReport = async (analysisData, filename = 'resume-analysis-report.pdf') => {
  try {
    const pdf = await generatePDFReport(analysisData);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}; 