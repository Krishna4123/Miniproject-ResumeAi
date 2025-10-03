/**
 * Roadmap Controller - Career roadmap generation with AI-powered skill gap analysis
 */

// Try to import Gemini AI (optional - will use fallback if not available)
let genAI = null;
let availableModels = null;

async function initializeGemini() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('✅ Gemini AI initialized successfully');
    console.log('📋 Will discover available models on first use');
  } catch (error) {
    console.log('⚠️ Gemini AI not available, using fallback generation:', error.message);
    genAI = null;
  }
}

// Initialize Gemini on startup
if (process.env.GEMINI_API_KEY) {
  initializeGemini();
}

/**
 * Generate a personalized career roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const { currentRole, targetRole, experience, currentSkills = [], skillsDetail = '' } = req.body;

    // Validate required fields
    if (!currentRole || !targetRole || !experience) {
      return res.status(400).json({ 
        message: 'Missing required fields: currentRole, targetRole, and experience are required.',
        code: 'MISSING_FIELDS'
      });
    }

    if (!currentSkills || currentSkills.length === 0) {
      return res.status(400).json({
        message: 'At least one current skill is required.',
        code: 'MISSING_SKILLS'
      });
    }

    let roadmap;
    let message;

    // Try Gemini AI first if available and API key exists
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        console.log('🤖 Attempting Gemini AI generation...');
        roadmap = await generateWithGeminiAI(currentRole, targetRole, experience, currentSkills, skillsDetail);
        message = 'Roadmap generated successfully using AI analysis.';
      } catch (error) {
        console.log('⚠️ Gemini AI failed, falling back to rule-based generation:', error.message);
        roadmap = generateFallbackRoadmap(currentRole, targetRole, experience, currentSkills);
        message = 'Roadmap generated using enhanced rule-based analysis.';
      }
    } else {
      console.log('📝 Using enhanced rule-based generation (Gemini AI not configured)');
      roadmap = generateFallbackRoadmap(currentRole, targetRole, experience, currentSkills);
      message = 'Roadmap generated using enhanced skill gap analysis. To enable AI-powered generation, set up Gemini AI.';
    }

    res.status(200).json({
      roadmap,
      message
    });

  } catch (error) {
    console.error('[RoadmapController] Error generating roadmap:', error);
    res.status(500).json({
      message: 'Failed to generate roadmap.',
      code: 'GENERATION_FAILED'
    });
  }
};

/**
 * Save user's roadmap for future reference
 */
exports.saveRoadmap = async (req, res) => {
  try {
    const { currentRole, targetRole, experience, currentSkills, skillsDetail, roadmap } = req.body;

    if (!roadmap) {
      return res.status(400).json({ 
        message: 'Roadmap data is required.',
        code: 'MISSING_ROADMAP'
      });
    }

    // TODO: Save to database
    const savedRoadmap = {
      id: Date.now().toString(), // Mock ID
      userId: req.user?.id || 'guest', // Mock user ID
      currentRole,
      targetRole,
      experience,
      currentSkills,
      skillsDetail,
      roadmap,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Roadmap saved successfully.',
      roadmap: savedRoadmap
    });

  } catch (error) {
    console.error('[RoadmapController] Error saving roadmap:', error);
    res.status(500).json({
      message: 'Failed to save roadmap.',
      code: 'SAVE_FAILED'
    });
  }
};

/**
 * Generate roadmap using Gemini AI
 */
async function generateWithGeminiAI(currentRole, targetRole, experience, currentSkills, skillsDetail) {
  // Use the latest Gemini 2.5 model for better performance and quality
  const modelName = 'gemini-2.5-flash';
  console.log(`🎯 Using model: ${modelName}`);

  const prompt = `
You are a career development expert. Generate a personalized learning roadmap based on the following information:

Current Role: ${currentRole}
Target Role: ${targetRole}
Years of Experience: ${experience}
Current Skills: ${currentSkills.join(', ')}
Additional Skills Details: ${skillsDetail || 'None provided'}

Please generate a comprehensive learning roadmap in JSON format with the following structure:
{
  "timeline": "X-X months",
  "difficulty": "Beginner/Intermediate/Advanced",
  "skillGapAnalysis": {
    "currentLevelSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "skillsToImprove": ["skill1", "skill2"]
  },
  "steps": [
    {
      "phase": "Phase Name (Timeline)",
      "title": "Learning Goal",
      "description": "Detailed description",
      "skills": ["skill1", "skill2"],
      "resources": [
        {"type": "Course/Book/Project/Certification", "name": "Resource Name", "duration": "Duration"}
      ],
      "status": "upcoming"
    }
  ],
  "marketInsights": {
    "demand": "High/Medium/Low",
    "averageSalary": "Salary range",
    "topCompanies": ["Company1", "Company2"],
    "keySkills": ["Skill1", "Skill2"]
  }
}

Focus on:
1. Analyzing the gap between current skills and target role requirements
2. Creating actionable steps with specific learning resources
3. Providing realistic timelines based on experience level
4. Including market insights for the target role
5. Making recommendations practical and achievable

Return only the JSON object, no additional text.
`;

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const roadmapText = response.text();

  // Clean and parse the response
  const cleanedText = roadmapText.replace(/```json|```/g, '').trim();
  const roadmap = JSON.parse(cleanedText);

  // Set initial step as current
  if (roadmap.steps && roadmap.steps.length > 0) {
    roadmap.steps[0].status = 'current';
  }

  return roadmap;
}

/**
 * Generate fallback roadmap using rule-based analysis
 */
function generateFallbackRoadmap(currentRole, targetRole, experience, currentSkills, skillLevel = null) {
  // Analyze skill levels based on experience
  const experienceNum = parseInt(experience.split('-')[0]) || 0;
  if (!skillLevel) {
    if (experienceNum >= 5) {
      skillLevel = 'Advanced';
    } else if (experienceNum >= 2) {
      skillLevel = 'Intermediate';
    } else {
      skillLevel = 'Beginner';
    }
  }

  let timeline = '6-12 months';
  if (experienceNum >= 5) {
    timeline = '3-6 months';
  } else if (experienceNum >= 2) {
    timeline = '4-8 months';
  }

  // Generate skill gap analysis
  const skillGapAnalysis = generateSkillGapAnalysis(currentSkills, targetRole, skillLevel);
  
  // Generate learning steps based on gap analysis
  const steps = generateLearningSteps(targetRole, skillGapAnalysis, skillLevel, timeline);
  
  // Generate market insights
  const marketInsights = generateMarketInsights(targetRole);

  return {
    timeline,
    difficulty: skillLevel,
    skillGapAnalysis,
    steps,
    marketInsights
  };
}

/**
 * Generate skill gap analysis based on current skills and target role
 */
function generateSkillGapAnalysis(currentSkills, targetRole, skillLevel) {
  const commonSkills = {
    'Software Engineer': ['Programming', 'Data Structures', 'Algorithms', 'Version Control'],
    'Senior Software Engineer': ['System Design', 'Code Review', 'Mentoring', 'Architecture'],
    'Tech Lead': ['Team Leadership', 'Project Management', 'Technical Strategy', 'Communication'],
    'Product Manager': ['Product Strategy', 'Market Research', 'User Research', 'Business Analysis'],
    'Data Scientist': ['Statistics', 'Machine Learning', 'Python', 'Data Visualization'],
    'DevOps Engineer': ['CI/CD', 'Cloud Platforms', 'Infrastructure', 'Monitoring'],
    'Frontend Developer': ['React', 'JavaScript', 'CSS', 'Web Performance'],
    'Backend Developer': ['API Development', 'Database Design', 'Security', 'Scalability']
  };

  const targetSkills = commonSkills[targetRole] || ['Technical Skills', 'Problem Solving', 'Communication'];
  
  // Identify missing skills
  const missingSkills = targetSkills.filter(skill => 
    !currentSkills.some(currentSkill => 
      currentSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(currentSkill.toLowerCase())
    )
  );

  // Skills to improve (intersection of current and target)
  const skillsToImprove = currentSkills.filter(skill =>
    targetSkills.some(targetSkill =>
      skill.toLowerCase().includes(targetSkill.toLowerCase()) ||
      targetSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return {
    currentLevelSkills: currentSkills,
    missingSkills: missingSkills.length > 0 ? missingSkills : ['Advanced Technical Skills', 'Leadership Skills'],
    skillsToImprove: skillsToImprove.length > 0 ? skillsToImprove : ['Problem Solving', 'Communication']
  };
}

/**
 * Generate learning steps based on skill gap analysis
 */
function generateLearningSteps(targetRole, skillGapAnalysis, skillLevel, timeline) {
  const steps = [];
  
  // Foundation phase
  if (skillGapAnalysis.missingSkills.length > 0) {
    steps.push({
      phase: `Foundation (${timeline.split('-')[0].trim()}-${Math.floor(parseInt(timeline.split('-')[0]) * 0.4)} months)`,
      title: 'Learn Missing Core Skills',
      description: `Focus on acquiring the essential skills needed for ${targetRole}: ${skillGapAnalysis.missingSkills.slice(0, 3).join(', ')}.`,
      skills: skillGapAnalysis.missingSkills.slice(0, 4),
      resources: [
        { type: 'Course', name: `${skillGapAnalysis.missingSkills[0]} Fundamentals`, duration: '4-6 weeks' },
        { type: 'Project', name: `${targetRole} Portfolio Project`, duration: '2-3 weeks' },
        { type: 'Book', name: 'Industry Best Practices Guide', duration: '3-4 weeks' }
      ],
      status: 'current'
    });
  }

  // Improvement phase
  if (skillGapAnalysis.skillsToImprove.length > 0) {
    steps.push({
      phase: `Growth (${Math.ceil(parseInt(timeline.split('-')[0]) * 0.4)}-${Math.floor(parseInt(timeline.split('-')[1].split(' ')[0]) * 0.7)} months)`,
      title: 'Enhance Existing Skills',
      description: `Deepen your expertise in: ${skillGapAnalysis.skillsToImprove.slice(0, 3).join(', ')} with advanced techniques and practices.`,
      skills: skillGapAnalysis.skillsToImprove.slice(0, 4),
      resources: [
        { type: 'Course', name: 'Advanced Technical Skills', duration: '6-8 weeks' },
        { type: 'Mentorship', name: '1:1 Coaching Session', duration: '8 weeks' },
        { type: 'Certification', name: `${targetRole} Professional Certificate`, duration: '4-6 weeks' }
      ],
      status: 'upcoming'
    });
  }

  // Specialization phase
  const finalPhase = {
    phase: `Specialization (${Math.ceil(parseInt(timeline.split('-')[1].split(' ')[0]) * 0.7)}-${timeline.split('-')[1].split(' ')[0]} months)`,
    title: 'Advanced Specialization',
    description: `Master advanced concepts and develop specialized expertise in ${targetRole} with real-world applications.`,
    skills: ['Advanced Implementation', 'Industry Standards', 'Best Practices', 'Continuous Learning'],
    resources: [
      { type: 'Project', name: 'Large-Scale Implementation', duration: '6-8 weeks' },
      { type: 'Course', name: 'Expert-Level Training', duration: '4-6 weeks' },
      { type: 'Conference', name: 'Industry Conference Attendance', duration: '1 week' }
    ],
    status: 'upcoming'
  };

  if (skillLevel !== 'Beginner') {
    steps.push(finalPhase);
  }

  return steps;
}

/**
 * Generate market insights based on target role
 */
function generateMarketInsights(targetRole) {
  const insights = {
    'Software Engineer': {
      demand: 'High',
      averageSalary: '$90,000 - $130,000',
      topCompanies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
      keySkills: ['JavaScript', 'Python', 'System Design', 'Cloud Computing']
    },
    'Senior Software Engineer': {
      demand: 'High',
      averageSalary: '$120,000 - $180,000',
      topCompanies: ['Google', 'Amazon', 'Microsoft', 'Netflix', 'Uber'],
      keySkills: ['System Design', 'Leadership', 'Code Review', 'Technical Strategy']
    },
    'Tech Lead': {
      demand: 'High',
      averageSalary: '$140,000 - $220,000',
      topCompanies: ['Google', 'Amazon', 'Microsoft', 'Salesforce', 'Adobe'],
      keySkills: ['Team Leadership', 'Architecture', 'Strategic Planning', 'Cross-functional Collaboration']
    },
    'Product Manager': {
      demand: 'High',
      averageSalary: '$100,000 - $160,000',
      topCompanies: ['Google', 'Apple', 'Meta', 'Slack', 'Shopify'],
      keySkills: ['Product Strategy', 'Data Analysis', 'Stakeholder Management', 'Market Research']
    },
    'Data Scientist': {
      demand: 'High',
      averageSalary: '$110,000 - $165,000',
      topCompanies: ['Google', 'Facebook', 'Netflix', 'Spotify', 'Airbnb'],
      keySkills: ['Machine Learning', 'Python', 'Statistics', 'Big Data']
    },
    'DevOps Engineer': {
      demand: 'Very High',
      averageSalary: '$105,000 - $155,000',
      topCompanies: ['Amazon', 'Google', 'Netflix', 'Spotify', 'Uber'],
      keySkills: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD']
    }
  };

  return insights[targetRole] || {
    demand: 'Medium',
    averageSalary: '$80,000 - $140,000',
    topCompanies: ['Tech Companies', 'Startups', 'Enterprise'],
    keySkills: ['Technical Skills', 'Problem Solving', 'Teamwork', 'Communication']
  };
}