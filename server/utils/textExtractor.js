const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const pdf2pic = require("pdf2pic");
const fs = require("fs");
const path = require("path");

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
   * Extract text from PDF using enhanced pdf-parse with multiple fallback methods
   */
  async extractFromPDF(buffer) {
    const extractionMethods = [
      {
        name: 'pdf-parse-standard',
        method: () => this.extractWithPdfParse(buffer, { max: 0 })
      },
      {
        name: 'pdf-parse-no-version',
        method: () => this.extractWithPdfParse(buffer, {})
      },
      {
        name: 'pdf-parse-with-options',
        method: () => this.extractWithPdfParse(buffer, {
          max: 0,
          version: 'v1.10.100',
          normalizeWhitespace: true
        })
      }
    ];

    for (const extractionMethod of extractionMethods) {
      try {
        console.log(`Trying PDF extraction method: ${extractionMethod.name}`);
        const result = await extractionMethod.method();
        
        if (result && result.text && result.text.trim().length > 10) {
          console.log(`PDF extraction successful with method: ${extractionMethod.name}`);
          return result;
        }
      } catch (error) {
        console.warn(`PDF extraction method ${extractionMethod.name} failed:`, error.message);
        continue;
      }
    }

    // Try OCR as last resort for image-based PDFs
    try {
      console.log("Attempting OCR fallback for image-based PDF");
      const ocrResult = await this.extractWithOCR(buffer);
      if (ocrResult && ocrResult.text && ocrResult.text.trim().length > 10) {
        console.log("OCR extraction successful");
        return ocrResult;
      }
    } catch (ocrError) {
      console.warn("OCR extraction failed:", ocrError.message);
    }

    console.error("All PDF extraction methods failed");
    return null;
  }

  /**
   * Extract text using OCR for image-based PDFs
   */
  async extractWithOCR(buffer) {
    try {
      // Convert PDF to images
      const convert = pdf2pic.fromBuffer(buffer, {
        density: 300,           // Higher density for better OCR
        saveFilename: "page",
        savePath: "./temp",
        format: "png",
        width: 2000,
        height: 2000
      });

      const results = await convert.bulk(-1); // Convert all pages
      let fullText = "";

      // Process each page with OCR
      for (let i = 0; i < results.length; i++) {
        try {
          const { data: { text } } = await Tesseract.recognize(
            results[i].path,
            'eng',
            {
              logger: m => console.log(m)
            }
          );
          fullText += text + "\n";
        } catch (pageError) {
          console.warn(`OCR failed for page ${i + 1}:`, pageError.message);
        }
      }

      const cleanedText = this.cleanText(fullText);
      const validation = this.validateTextQuality(cleanedText);

      return {
        text: cleanedText,
        method: 'ocr-tesseract',
        pages: results.length,
        quality: validation,
        confidence: Math.max(0.3, validation.confidence * 0.8) // OCR typically has lower confidence
      };
    } catch (error) {
      console.error("OCR extraction failed:", error.message);
      throw error;
    }
  }

  /**
   * Extract text using pdf-parse with specific options
   */
  async extractWithPdfParse(buffer, options = {}) {
    const pdfData = await pdfParse(buffer, options);
    
    const cleanedText = this.cleanText(pdfData.text);
    const validation = this.validateTextQuality(cleanedText);
    
    return {
      text: cleanedText,
      method: 'pdf-parse',
      pages: pdfData.numpages,
      quality: validation,
      confidence: validation.confidence
    };
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
   * Main extraction method with enhanced fallback and error handling
   */
  async extractText(buffer, mimetype, filename = 'unknown') {
    console.log(`Starting enhanced text extraction for ${filename} (${mimetype})`);
    
    let result = null;
    let extractionErrors = [];

    try {
      if (mimetype === "application/pdf") {
        result = await this.extractFromPDF(buffer);
      } else if (
        mimetype === "application/msword" ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        result = await this.extractFromDOCX(buffer);
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      extractionErrors.push(`Primary extraction failed: ${error.message}`);
      console.error("Primary extraction failed:", error.message);
    }

    // If primary extraction failed, try alternative approaches
    if (!result || !result.text || result.text.trim().length < 10) {
      console.log("Primary extraction failed or produced poor results, trying alternative methods...");
      
      // For PDFs, try different approaches
      if (mimetype === "application/pdf") {
        try {
          console.log("Attempting alternative PDF processing...");
          // Try with different pdf-parse options
          const altResult = await this.extractWithPdfParse(buffer, {
            max: 0,
            normalizeWhitespace: false,
            disableCombineTextItems: true
          });
          
          if (altResult && altResult.text && altResult.text.trim().length > 10) {
            result = altResult;
            result.method = 'pdf-parse-alternative';
          }
        } catch (altError) {
          extractionErrors.push(`Alternative PDF extraction failed: ${altError.message}`);
          console.warn("Alternative PDF extraction failed:", altError.message);
        }
      }
    }

    if (!result || !result.text || result.text.trim().length < 10) {
      const errorMessage = `Failed to extract text from ${filename}. Errors: ${extractionErrors.join('; ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`Enhanced text extraction completed using ${result.method}, confidence: ${result.confidence}, length: ${result.text.length}`);

    return {
      text: result.text,
      metadata: {
        extractionMethod: result.method,
        confidence: result.confidence,
        quality: result.quality,
        textLength: result.text.length,
        pages: result.pages,
        extractionErrors: extractionErrors.length > 0 ? extractionErrors : undefined
      }
    };
  }

  /**
   * Cleanup resources including temp OCR files
   */
  async cleanup() {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          if (file.startsWith('page')) {
            fs.unlinkSync(path.join(tempDir, file));
          }
        }
        console.log("OCR temp files cleaned up");
      }
    } catch (error) {
      console.warn("Cleanup failed:", error.message);
    }
  }
}

module.exports = TextExtractor;