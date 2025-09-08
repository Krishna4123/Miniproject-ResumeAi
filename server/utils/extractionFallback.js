/**
 * Fallback and error recovery system for text extraction
 */

const axios = require('axios');
const FormData = require('form-data');

class ExtractionFallbackSystem {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.fallbackServices = [
      {
        name: 'Primary ML Service',
        url: process.env.FLASK_ML_SERVICE_URL || 'http://localhost:5001/predict',
        priority: 1,
        timeout: 30000
      }
      // Add more fallback services here if needed
    ];
  }

  /**
   * Sleep utility for retry delays
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Attempt to send file to ML service with retries
   */
  async sendToMLServiceWithRetry(file, serviceConfig) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempting ML service call (${serviceConfig.name}, attempt ${attempt}/${this.maxRetries})`);
        
        const formData = new FormData();
        formData.append("resume", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

        const response = await axios.post(serviceConfig.url, formData, {
          headers: formData.getHeaders(),
          timeout: serviceConfig.timeout
        });

        console.log(`ML service call successful (${serviceConfig.name}, attempt ${attempt})`);
        return response;
        
      } catch (error) {
        lastError = error;
        console.warn(`ML service call failed (${serviceConfig.name}, attempt ${attempt}/${this.maxRetries}):`, error.message);
        
        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          const delayMs = this.retryDelay * attempt; // Exponential backoff
          console.log(`Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Try multiple ML services in priority order
   */
  async processWithMLService(file) {
    const sortedServices = this.fallbackServices.sort((a, b) => a.priority - b.priority);
    
    for (const service of sortedServices) {
      try {
        const response = await this.sendToMLServiceWithRetry(file, service);
        return {
          success: true,
          data: response.data,
          serviceUsed: service.name
        };
      } catch (error) {
        console.error(`Service ${service.name} failed completely:`, error.message);
        continue;
      }
    }
    
    throw new Error('All ML services failed');
  }

  /**
   * Generate fallback response when ML service is unavailable
   */
  generateFallbackResponse(extractionResult) {
    console.log('Generating fallback response due to ML service unavailability');
    
    // Basic skill extraction from text
    const text = extractionResult.text.toLowerCase();
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
      'git', 'docker', 'aws', 'mongodb', 'postgresql', 'typescript', 'angular',
      'vue.js', 'express', 'spring', 'django', 'flask', 'kubernetes', 'jenkins'
    ];
    
    const detectedSkills = commonSkills.filter(skill => 
      text.includes(skill) || text.includes(skill.replace('.', ''))
    );

    // Basic role prediction based on detected skills
    let predictedRoles = [];
    
    if (detectedSkills.some(skill => ['javascript', 'react', 'angular', 'vue.js', 'html', 'css'].includes(skill))) {
      predictedRoles.push('frontend developer');
    }
    
    if (detectedSkills.some(skill => ['node.js', 'express', 'python', 'django', 'flask', 'java', 'spring'].includes(skill))) {
      predictedRoles.push('backend developer');
    }
    
    if (detectedSkills.some(skill => ['react', 'angular', 'vue.js', 'node.js', 'express'].includes(skill))) {
      predictedRoles.push('full stack developer');
    }
    
    if (detectedSkills.some(skill => ['python', 'sql', 'mongodb', 'postgresql'].includes(skill))) {
      predictedRoles.push('data analyst');
    }
    
    if (detectedSkills.some(skill => ['aws', 'docker', 'kubernetes', 'jenkins'].includes(skill))) {
      predictedRoles.push('devops engineer');
    }
    
    // Default role if no specific skills detected
    if (predictedRoles.length === 0) {
      predictedRoles = ['software engineer'];
    }

    return {
      success: true,
      extractedData: {
        skills: detectedSkills.slice(0, 10),
        sections_found: this.detectSections(extractionResult.text),
        estimated_experience: this.estimateExperience(extractionResult.text),
        text_statistics: {
          word_count: extractionResult.text.split(/\\s+/).length,
          char_count: extractionResult.text.length,
          line_count: extractionResult.text.split('\n').length
        },
        raw_text_preview: extractionResult.text.substring(0, 500) + (extractionResult.text.length > 500 ? '...' : ''),
        fallback_mode: true
      },
      predictedRoles,
      serviceUsed: 'Fallback System'
    };
  }

  /**
   * Detect resume sections
   */
  detectSections(text) {
    const lowerText = text.toLowerCase();
    return {
      experience: /\\b(experience|work history|employment|professional experience)\\b/i.test(text),
      education: /\\b(education|academic|degree|university|college)\\b/i.test(text),
      skills: /\\b(skills|technical skills|competencies|expertise)\\b/i.test(text),
      summary: /\\b(summary|objective|profile|about)\\b/i.test(text),
      projects: /\\b(projects|portfolio|achievements)\\b/i.test(text),
      certifications: /\\b(certifications|certificates|licenses)\\b/i.test(text)
    };
  }

  /**
   * Estimate years of experience
   */
  estimateExperience(text) {
    const experienceMatches = text.match(/(\\d+)\\s*(?:years?|yrs?)\\s*(?:of\\s*)?(?:experience|exp)/gi);
    if (experienceMatches) {
      const years = experienceMatches.map(match => {
        const num = match.match(/\\d+/);
        return num ? parseInt(num[0]) : 0;
      });
      return Math.max(...years);
    }
    return 0;
  }

  /**
   * Handle ML service errors with appropriate fallbacks
   */
  handleMLServiceError(error, extractionResult) {
    console.error('ML Service processing failed:', error.message);
    
    // Determine error type and appropriate response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        error: 'ML service is unavailable',
        details: 'The AI analysis service is currently offline. Using fallback analysis.',
        fallbackData: this.generateFallbackResponse(extractionResult),
        errorType: 'SERVICE_UNAVAILABLE'
      };
    }
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return {
        error: 'ML service timeout',
        details: 'The AI analysis is taking too long. Using fallback analysis.',
        fallbackData: this.generateFallbackResponse(extractionResult),
        errorType: 'TIMEOUT'
      };
    }
    
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return {
        error: 'ML service request error',
        details: error.response.data?.error || 'Invalid request to AI service.',
        errorType: 'CLIENT_ERROR',
        statusCode: error.response.status
      };
    }
    
    // Generic server error
    return {
      error: 'ML service error',
      details: 'An error occurred during AI analysis. Using fallback analysis.',
      fallbackData: this.generateFallbackResponse(extractionResult),
      errorType: 'SERVER_ERROR'
    };
  }

  /**
   * Main processing method with comprehensive fallback
   */
  async processFile(file, extractionResult) {
    try {
      // Attempt to process with ML service
      const mlResult = await this.processWithMLService(file);
      return mlResult;
      
    } catch (mlError) {
      // Handle ML service failure
      const errorResponse = this.handleMLServiceError(mlError, extractionResult);
      
      // If we have fallback data, return it instead of throwing an error
      if (errorResponse.fallbackData) {
        console.log('Using fallback analysis due to ML service failure');
        return {
          ...errorResponse.fallbackData,
          mlServiceError: {
            type: errorResponse.errorType,
            message: errorResponse.error,
            details: errorResponse.details
          }
        };
      }
      
      // If no fallback is possible, throw the error
      throw new Error(errorResponse.details || errorResponse.error);
    }
  }
}

module.exports = ExtractionFallbackSystem;