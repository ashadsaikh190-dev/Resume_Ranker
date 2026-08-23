const fs = require('fs');
const { extractTextFromPDF } = require('../services/pdfService');

/**
 * @desc   Upload a single PDF resume, extract text, return parsed content
 * @route  POST /api/resumes/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    // Validate that a file was provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected. Please upload a PDF resume.',
      });
    }

    const file = req.file;

    // Extract text and metadata from the PDF
    let result;
    try {
      result = await extractTextFromPDF(file.path);
    } catch (extractionError) {
      // Clean up the uploaded file
      fs.unlink(file.path, () => {});
      return res.status(422).json({
        success: false,
        message: `Could not parse PDF: ${extractionError.message}`,
      });
    }

    // Clean up — delete the uploaded file after parsing
    fs.unlink(file.path, (err) => {
      if (err) console.warn('⚠️  Could not delete temp file:', file.path);
    });

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      resume: {
        fileName: file.originalname,
        fileSize: file.size,
        pages: result.pages,
        text: result.text,
        pdfInfo: result.info,
      },
    });
  } catch (error) {
    // Clean up on unexpected error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

module.exports = { uploadResume };
