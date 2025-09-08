const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Enhanced text extraction utility with better error handling and text processing
 */
class TextExtractor {
  constructor() {
    this.initialized = true;
  }

  /**
   * Clean and normalize extracted text
   */
  cleanText(text) {
    if (!text) return "";
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove null characters and weird unicode
      .replace(/\u0000/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Fix common PDF extraction issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
      .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Add space between number and letter
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  }

  /**
   * Validate text quality
   */
  validateTextQuality(text) {
    if (!text || text.length < 10) {
      return { valid: false, reason: "Text too short", confidence: 0.0 };
    }

    const alphaNumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const totalLength = text.length;
    const readabilityRatio = alphaNumericCount / totalLength;

    if (readabilityRatio < 0.5) {
      return { valid: false, reason: "Too many non-alphanumeric characters", confidence: 0.3 };
    }

    // Check for common OCR/extraction errors
    const commonErrors = [
      /[|]{3,}/, // Multiple pipes often indicate poor extraction
      /[_]{5,}/, // Multiple underscores
      /\s{10,}/, // Excessive spaces
    ];

    for (const errorPattern of commonErrors) {
      if (errorPattern.test(text)) {
        return { valid: false, reason: "Contains extraction artifacts", confidence: 0.4 };
      }
    }

    return { valid: true, reason: "Text quality acceptable", confidence: 0.8 };
  }

  /**
   * Extract text from PDF using enhanced pdf-parse
   */
  async extractFromPDF(buffer) {
    try {
      const pdfData = await pdfParse(buffer, {
        max: 0, // No page limit
        version: 'v1.10.100'
      });
      
      const cleanedText = this.cleanText(pdfData.text);
      const validation = this.validateTextQuality(cleanedText);
      
      return {
        text: cleanedText,
        method: 'enhanced-pdf-parse',
        pages: pdfData.numpages,
        quality: validation,
        confidence: validation.confidence
      };
    } catch (error) {
      console.error("Enhanced PDF extraction failed:", error.message);
      return null;
    }
  }

  /**
   * Extract text from DOCX files with enhanced processing
   */
  async extractFromDOCX(buffer) {
    try {
      function toArrayBuffer(buffer) {
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      }

      const result = await mammoth.extractRawText({ 
        arrayBuffer: toArrayBuffer(buffer) 
      });
      
      const cleanedText = this.cleanText(result.value);
      const validation = this.validateTextQuality(cleanedText);

      return {
        text: cleanedText,
        method: 'enhanced-mammoth',
        quality: validation,
        confidence: validation.confidence,
        warnings: result.messages
      };
    } catch (error) {
      console.error("Enhanced DOCX extraction failed:", error.message);
      return null;
    }
  }

  /**
   * Main extraction method with fallback
   */
  async extractText(buffer, mimetype, filename = 'unknown') {
    console.log(`Starting enhanced text extraction for ${filename} (${mimetype})`);
    
    let result = null;

    if (mimetype === "application/pdf") {
      result = await this.extractFromPDF(buffer);
    } else if (
      mimetype === "application/msword" ||
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      result = await this.extractFromDOCX(buffer);
    }

    if (!result || !result.text) {
      throw new Error("Failed to extract text using available methods");
    }

    console.log(`Enhanced text extraction completed using ${result.method}, confidence: ${result.confidence}, length: ${result.text.length}`);

    return {
      text: result.text,
      metadata: {
        extractionMethod: result.method,
        confidence: result.confidence,
        quality: result.quality,
        textLength: result.text.length,
        pages: result.pages
      }
    };
  }

  /**
   * Cleanup resources (placeholder for future OCR cleanup)
   */
  async cleanup() {
    // Currently no resources to cleanup, but keeping for future OCR integration
    console.log("Text extractor cleanup completed");
  }
}

module.exports = TextExtractor;