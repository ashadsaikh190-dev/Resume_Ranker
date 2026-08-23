const fs = require('fs');
const pdfParse = require('pdf-parse');

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

module.exports = { extractTextFromPDF };
