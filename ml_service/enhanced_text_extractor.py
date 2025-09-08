import re
import string
from typing import Dict, List, Tuple, Optional
import pdfplumber  # pyright: ignore[reportMissingImports]
import fitz  # PyMuPDF  # pyright: ignore[reportMissingImports]
import docx2txt  # pyright: ignore[reportMissingImports]
from PIL import Image
import io

class EnhancedTextExtractor:
    """
    Enhanced text extraction utility for ML service with multiple methods and preprocessing
    """
    
    def __init__(self):
        self.text_quality_threshold = 0.6
        
    def clean_and_preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess extracted text for better ML model performance
        """
        if not text:
            return ""
            
        # Basic cleaning
        text = text.strip()
        
        # Remove null characters and control characters
        text = re.sub(r'\x00', '', text)
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Fix common PDF extraction issues
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
        text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)  # Add space between letter and number
        text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)  # Add space between number and letter
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Fix common OCR errors
        text = re.sub(r'\b0\b', 'O', text)  # Replace standalone 0 with O
        text = re.sub(r'\bl\b', 'I', text)  # Replace standalone l with I
        
        # Remove excessive punctuation
        text = re.sub(r'[.]{3,}', '...', text)
        text = re.sub(r'[-]{3,}', '---', text)
        
        # Standardize email and phone patterns
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' EMAIL_ADDRESS ', text)
        text = re.sub(r'\b\+?1?[-.]?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b', ' PHONE_NUMBER ', text)
        
        return text.strip()
    
    def calculate_text_quality(self, text: str) -> Dict:
        """
        Calculate text quality metrics
        """
        if not text:
            return {'score': 0.0, 'metrics': {}, 'valid': False}
            
        # Basic metrics
        total_chars = len(text)
        alpha_chars = sum(c.isalpha() for c in text)
        digit_chars = sum(c.isdigit() for c in text)
        space_chars = sum(c.isspace() for c in text)
        punct_chars = sum(c in string.punctuation for c in text)
        
        # Quality indicators
        alpha_ratio = alpha_chars / total_chars if total_chars > 0 else 0
        digit_ratio = digit_chars / total_chars if total_chars > 0 else 0
        readable_ratio = (alpha_chars + digit_chars + space_chars) / total_chars if total_chars > 0 else 0
        
        # Check for extraction artifacts
        artifacts = [
            len(re.findall(r'[|]{3,}', text)),  # Multiple pipes
            len(re.findall(r'[_]{5,}', text)),  # Multiple underscores
            len(re.findall(r'\s{10,}', text)),  # Excessive spaces
            len(re.findall(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', text))  # Control chars
        ]
        
        artifact_penalty = sum(artifacts) * 0.1
        
        # Calculate overall quality score
        quality_score = (
            alpha_ratio * 0.4 +
            readable_ratio * 0.4 +
            min(digit_ratio * 2, 0.2) * 0.2
        ) - artifact_penalty
        
        quality_score = max(0.0, min(1.0, quality_score))
        
        metrics = {
            'total_chars': total_chars,
            'alpha_ratio': alpha_ratio,
            'digit_ratio': digit_ratio,
            'readable_ratio': readable_ratio,
            'artifacts_count': sum(artifacts),
            'quality_score': quality_score
        }
        
        return {
            'score': quality_score,
            'metrics': metrics,
            'valid': quality_score >= self.text_quality_threshold and total_chars >= 50
        }
    
    def extract_from_pdf_pdfplumber(self, filepath: str) -> Tuple[str, Dict]:
        """
        Extract text using pdfplumber (primary method)
        """
        try:
            text_content = []
            with pdfplumber.open(filepath) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # Try different extraction strategies
                    page_text = page.extract_text()
                    
                    if not page_text or len(page_text.strip()) < 10:
                        # Fallback: extract text from words
                        words = page.extract_words()
                        page_text = ' '.join([word['text'] for word in words])
                    
                    if page_text:
                        text_content.append(page_text)
                        
            full_text = '\n'.join(text_content)
            cleaned_text = self.clean_and_preprocess_text(full_text)
            quality = self.calculate_text_quality(cleaned_text)
            
            return cleaned_text, {
                'method': 'pdfplumber',
                'pages_processed': len(text_content),
                'confidence': 0.8 if quality['valid'] else 0.4,
                'quality': quality
            }
            
        except Exception as e:
            print(f"PDFPlumber extraction failed: {e}")
            return "", {'method': 'pdfplumber', 'error': str(e), 'confidence': 0.0}
    
    def extract_from_pdf_pymupdf(self, filepath: str) -> Tuple[str, Dict]:
        """
        Extract text using PyMuPDF (fallback method)
        """
        try:
            doc = fitz.open(filepath)
            text_content = []
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                
                # Try text extraction first
                page_text = page.get_text()
                
                if not page_text or len(page_text.strip()) < 10:
                    # Fallback: extract with layout preservation
                    page_text = page.get_text("text")
                
                if page_text:
                    text_content.append(page_text)
            
            doc.close()
            
            full_text = '\n'.join(text_content)
            cleaned_text = self.clean_and_preprocess_text(full_text)
            quality = self.calculate_text_quality(cleaned_text)
            
            return cleaned_text, {
                'method': 'pymupdf',
                'pages_processed': len(text_content),
                'confidence': 0.7 if quality['valid'] else 0.3,
                'quality': quality
            }
            
        except Exception as e:
            print(f"PyMuPDF extraction failed: {e}")
            return "", {'method': 'pymupdf', 'error': str(e), 'confidence': 0.0}
    
    def extract_from_docx(self, filepath: str) -> Tuple[str, Dict]:
        """
        Extract text from DOCX files with enhanced preprocessing
        """
        try:
            text = docx2txt.process(filepath)
            cleaned_text = self.clean_and_preprocess_text(text)
            quality = self.calculate_text_quality(cleaned_text)
            
            return cleaned_text, {
                'method': 'docx2txt',
                'confidence': 0.9 if quality['valid'] else 0.4,
                'quality': quality
            }
            
        except Exception as e:
            print(f"DOCX extraction failed: {e}")
            return "", {'method': 'docx2txt', 'error': str(e), 'confidence': 0.0}
    
    def extract_text_with_fallback(self, filepath: str, mimetype: str) -> Dict:
        """
        Extract text with multiple fallback methods
        """
        results = []
        
        if mimetype == "application/pdf":
            # Try multiple PDF extraction methods
            methods = [
                self.extract_from_pdf_pdfplumber,
                self.extract_from_pdf_pymupdf
            ]
            
            for method in methods:
                text, metadata = method(filepath)
                if text and metadata.get('confidence', 0) > 0:
                    results.append((text, metadata))
                    # If we get high-quality text, we can stop
                    if metadata.get('confidence', 0) > 0.7 and len(text) > 100:
                        break
                        
        elif mimetype in [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]:
            text, metadata = self.extract_from_docx(filepath)
            if text:
                results.append((text, metadata))
        
        if not results:
            return {
                'text': '',
                'metadata': {
                    'method': 'none',
                    'confidence': 0.0,
                    'error': 'All extraction methods failed'
                }
            }
        
        # Select the best result based on confidence and text length
        best_text, best_metadata = max(results, key=lambda x: (
            x[1].get('confidence', 0) * 0.7 + 
            min(len(x[0]) / 1000, 1.0) * 0.3
        ))
        
        return {
            'text': best_text,
            'metadata': {
                **best_metadata,
                'alternatives_tried': len(results),
                'text_length': len(best_text)
            }
        }
    
    def extract_enhanced_features(self, text: str) -> Dict:
        """
        Extract enhanced features for better ML processing
        """
        if not text:
            return {}
        
        # Extract sections (common resume sections)
        sections = {}
        section_patterns = {
            'experience': r'(?i)(experience|work history|employment|professional experience)',
            'education': r'(?i)(education|academic|degree|university|college)',
            'skills': r'(?i)(skills|technical skills|competencies|expertise)',
            'summary': r'(?i)(summary|objective|profile|about)',
            'projects': r'(?i)(projects|portfolio|achievements)',
            'certifications': r'(?i)(certifications|certificates|licenses)'
        }
        
        for section, pattern in section_patterns.items():
            matches = re.findall(pattern + r'[\s\S]*?(?=(?:' + '|'.join(section_patterns.values()) + r')|$)', text)
            sections[section] = bool(matches)
        
        # Extract potential skills (title case words, technical terms)
        skills = []
        # Common technical skills patterns
        skill_patterns = [
            r'\b(?:Python|Java|JavaScript|C\+\+|SQL|HTML|CSS|React|Node\.js|Docker|Kubernetes)\b',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'  # Title case phrases
        ]
        
        for pattern in skill_patterns:
            skills.extend(re.findall(pattern, text))
        
        # Remove duplicates and common non-skills
        excluded_words = {'The', 'And', 'With', 'For', 'From', 'This', 'That', 'Where', 'When'}
        skills = list(set([skill for skill in skills if skill not in excluded_words]))[:15]
        
        # Extract years of experience indicators
        experience_years = re.findall(r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)', text.lower())
        total_experience = max([int(year) for year in experience_years], default=0)
        
        return {
            'skills': skills,
            'sections_found': sections,
            'estimated_experience_years': total_experience,
            'raw_text_preview': text[:500] + '...' if len(text) > 500 else text,
            'text_statistics': {
                'word_count': len(text.split()),
                'char_count': len(text),
                'line_count': len(text.split('\n'))
            }
        }

# Global extractor instance
text_extractor = EnhancedTextExtractor()