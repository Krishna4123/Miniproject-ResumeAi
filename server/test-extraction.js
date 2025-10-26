/**
 * Test script for improved text extraction
 * Run with: node test-extraction.js
 */

const TextExtractor = require('./utils/textExtractor');
const fs = require('fs');
const path = require('path');

async function testExtraction() {
  console.log('🧪 Testing improved text extraction...\n');
  
  const textExtractor = new TextExtractor();
  
  try {
    // Test with a sample PDF if available
    const testFiles = [
      { name: 'sample.pdf', mimetype: 'application/pdf' },
      { name: 'sample.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ];
    
    for (const testFile of testFiles) {
      const filePath = path.join(__dirname, 'test-files', testFile.name);
      
      if (fs.existsSync(filePath)) {
        console.log(`📄 Testing ${testFile.name}...`);
        
        try {
          const buffer = fs.readFileSync(filePath);
          const result = await textExtractor.extractText(buffer, testFile.mimetype, testFile.name);
          
          console.log(`✅ Success! Method: ${result.metadata.extractionMethod}`);
          console.log(`   Text length: ${result.metadata.textLength} characters`);
          console.log(`   Confidence: ${result.metadata.confidence}`);
          console.log(`   Pages: ${result.metadata.pages || 'N/A'}`);
          console.log(`   Preview: ${result.text.substring(0, 100)}...\n`);
          
        } catch (error) {
          console.log(`❌ Failed: ${error.message}\n`);
        }
      } else {
        console.log(`⚠️  Test file not found: ${filePath}\n`);
      }
    }
    
    // Cleanup
    await textExtractor.cleanup();
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testExtraction();


