const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');
const WordExtractor = require('word-extractor');

/**
 * Extract text and metadata from a PDF file on disk.
 *
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<{ text: string, pages: number, info: object }>}
 * @throws {Error} If the file cannot be read or is corrupted.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const text = (data.text || '').trim();

    if (!text) {
      console.warn(`⚠️  No readable text found in: ${filePath}`);
    }

    return {
      text,
      pages: data.numpages || 0,
      info: data.info || {},
    };
  } catch (error) {
    console.error(`❌ PDF extraction failed for ${filePath}:`, error.message);
    throw new Error(
      `Failed to extract text from PDF: ${error.message}`
    );
  }
};

const extractTextFromResume = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.pdf') {
    return extractTextFromPDF(filePath);
  }

  if (extension === '.doc' || extension === '.docx') {
    try {
      const document = await new WordExtractor().extract(filePath);
      const text = (document.getBody() || '').trim();
      if (!text) {
        console.warn(`  No readable text found in: ${filePath}`);
      }

      return { text, pages: null, info: {} };
    } catch (error) {
      console.error(`Word document extraction failed for ${filePath}:`, error.message);
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  throw new Error(`Unsupported resume file type: ${extension || 'unknown'}`);
};

module.exports = { extractTextFromPDF, extractTextFromResume };
