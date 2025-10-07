// controllers/enhancerController.js

const TextExtractor = require("../utils/textExtractor");
const { validateTextQuality } = require("../middleware/enhancedValidation");

// Try to import Gemini AI (optional - will use fallback if not available)
let genAI = null;

async function initializeGemini() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized for Enhancer');
  } catch (error) {
    console.log('⚠️ Gemini AI not available for Enhancer:', error.message);
    genAI = null;
  }
}

if (process.env.GEMINI_API_KEY && !genAI) {
  initializeGemini();
}

const textExtractor = new TextExtractor();

exports.enhanceResume = async (req, res) => {
  try {
    // Validate file upload (middleware also checks, but double-check here for safety)
    if (!req.file) {
      return res.status(400).json({ 
        error: "Resume file is required",
        details: "Please upload a PDF, DOC, or DOCX file"
      });
    }

    // Extract text from resume
    let extractionResult;
    try {
      extractionResult = await textExtractor.extractText(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      if (!extractionResult.text || !extractionResult.text.trim()) {
        return res.status(400).json({ 
          error: "Could not extract text from the resume",
          details: "The file appears to be empty, corrupted, or contains only images",
          metadata: extractionResult.metadata
        });
      }
    } catch (err) {
      return res.status(400).json({ 
        error: "Failed to extract text from file",
        details: err.message || "The file may be corrupted, password-protected, or in an unsupported format"
      });
    }

    // Validate text quality
    const qualityValidation = validateTextQuality(extractionResult);
    if (!qualityValidation.valid) {
      return res.status(400).json({
        error: "Poor text extraction quality",
        details: "The extracted text quality is too low for reliable processing",
        issues: qualityValidation.issues,
        warnings: qualityValidation.warnings,
        metadata: extractionResult.metadata
      });
    }

    const resumeText = extractionResult.text;

    // If Gemini is not configured, provide a simple heuristic fallback
    if (!genAI || !process.env.GEMINI_API_KEY) {
      const fallback = generateHeuristicEnhancement(resumeText);
      return res.status(200).json({
        ...fallback,
        usedAI: false,
        extractionMetadata: extractionResult.metadata
      });
    }

    try {
      const analysis = await generateEnhancementsWithGemini(resumeText);
      return res.status(200).json({
        ...analysis,
        usedAI: true,
        extractionMetadata: extractionResult.metadata
      });
    } catch (error) {
      console.error('[Enhancer] Gemini generation failed:', error.message);
      const fallback = generateHeuristicEnhancement(resumeText);
      return res.status(200).json({
        ...fallback,
        usedAI: false,
        extractionMetadata: extractionResult.metadata,
        aiError: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('[Enhancer] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function generateEnhancementsWithGemini(resumeText) {
  const modelName = 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
You are an ATS optimization expert. Analyze the following resume text and return a JSON object with:
- atsScore: integer 0-100
- improvements: array of 3-6 items with { type: one of ["success","warning","info"], title, description }
- suggestions: array of 3-8 items with { section, original, improved, impact: one of ["High","Medium","Low"] }
- afterResume: a cohesive, fully rewritten resume in plain text, with clear section headings (Summary, Skills, Experience, Education, Projects, Certifications) and quantified achievements where possible. Keep it concise and professional.

Resume Text:
"""
${resumeText}
"""

Guidelines:
- The "original" should be a concise excerpt from the provided text (1-2 sentences).
- "improved" must be a clear rewrite with quantified impact where possible.
- Keep suggestions specific and actionable.
- Keep JSON concise. Do not include any prose outside the JSON. Return only JSON.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Basic shape enforcement
  return {
    score: typeof parsed.atsScore === 'number' ? parsed.atsScore : 70,
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    afterResume: typeof parsed.afterResume === 'string' && parsed.afterResume.trim().length > 0
      ? parsed.afterResume
      : generateHeuristicAfterResume(resumeText)
  };
}

function generateHeuristicEnhancement(text) {
  const lengthScore = Math.max(0, Math.min(40, Math.floor(text.split(/\s+/).length / 25)));
  const keywordBoosters = ['led', 'improved', 'increased', 'reduced', 'designed', 'built', 'shipped', 'optimized'];
  const keywordHits = keywordBoosters.reduce((acc, k) => acc + (text.toLowerCase().includes(k) ? 1 : 0), 0);
  const score = Math.min(100, 50 + lengthScore + keywordHits * 5);

  const suggestions = [
    {
      section: 'Professional Summary',
      original: 'Experienced professional with knowledge of various tools and technologies.',
      improved: 'Results-driven professional with a proven record of delivering scalable systems and measurable impact (e.g., reduced latency 35%, cut infra costs 20%).',
      impact: 'High'
    },
    {
      section: 'Work Experience',
      original: 'Worked on multiple projects to improve performance.',
      improved: 'Led performance optimizations across 3 services, improving p95 latency from 800ms to 320ms and boosting conversion by 12%.',
      impact: 'High'
    },
    {
      section: 'Skills',
      original: 'JavaScript, React, Node.js',
      improved: 'JavaScript (ES6+), React, Node.js, TypeScript, REST APIs, CI/CD, AWS',
      impact: 'Medium'
    }
  ];

  const improvements = [
    { type: 'info', title: 'Quantify Achievements', description: 'Add metrics (%, $, time) to highlight impact.' },
    { type: 'warning', title: 'ATS Keywords', description: 'Include job-specific keywords from the posting.' },
    { type: 'success', title: 'Strong Structure', description: 'Keep consistent tense, bullet style, and formatting.' }
  ];

  return { score, improvements, suggestions, afterResume: generateHeuristicAfterResume(text) };
}

function generateHeuristicAfterResume(text) {
  const firstLine = (text.split('\n').find(l => l && l.trim().length > 0) || '').trim();
  const nameGuess = firstLine.length < 80 ? firstLine : 'Candidate Name';
  return (
    nameGuess + '\n' +
    'SUMMARY\n' +
    'Results-driven professional with hands-on experience delivering measurable impact across products and platforms.\n\n' +
    'SKILLS\n' +
    'JavaScript (ES6+), React, Node.js, REST APIs, Git, CI/CD, Cloud (AWS)\n\n' +
    'EXPERIENCE\n' +
    '- Led optimization initiatives improving p95 latency by 40% and reducing costs by 20%.\n' +
    '- Built and shipped features that increased user engagement by 15% QoQ.\n\n' +
    'EDUCATION\n' +
    'B.S. in Computer Science or related field\n\n' +
    'PROJECTS\n' +
    '- Designed and deployed a full-stack web app with authentication and dashboards.'
  );
}
