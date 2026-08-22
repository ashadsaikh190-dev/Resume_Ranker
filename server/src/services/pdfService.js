const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract plain text from a PDF file on disk.
 *
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<string>} The extracted text, or an empty string if
 *                            the PDF contains no readable text.
 * @throws {Error} If the file cannot be read or is corrupted.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // data.text contains all the extracted text
    const text = (data.text || '').trim();

    if (!text) {
      console.warn(`⚠️  No readable text found in: ${filePath}`);
    }

    return text;
  } catch (error) {
    console.error(`❌ PDF extraction failed for ${filePath}:`, error.message);
    throw new Error(
      `Failed to extract text from PDF: ${error.message}`
    );
  }
};

module.exports = { extractTextFromPDF };
