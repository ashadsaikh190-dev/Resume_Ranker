const fs = require('fs');
const { extractTextFromPDF } = require('../services/pdfService');

/**
 * @desc   Upload multiple PDF resumes, extract text from each, return parsed content
 * @route  POST /api/resumes/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    // Validate that at least one file was provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files selected. Please upload at least one PDF resume.',
      });
    }

    const files = req.files;
    const results = [];

    for (const file of files) {
      try {
        const result = await extractTextFromPDF(file.path);
        results.push({
          fileName: file.originalname,
          fileSize: file.size,
          pages: result.pages,
          text: result.text,
          pdfInfo: result.info,
          success: true,
        });
      } catch (extractionError) {
        results.push({
          fileName: file.originalname,
          fileSize: file.size,
          success: false,
          error: `Could not parse PDF: ${extractionError.message}`,
        });
      } finally {
        // Clean up — delete the uploaded file after parsing
        fs.unlink(file.path, (err) => {
          if (err) console.warn('⚠️  Could not delete temp file:', file.path);
        });
      }
    }

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    res.status(200).json({
      success: true,
      message: `${successful.length} of ${results.length} resume(s) parsed successfully`,
      resumes: results,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
    });
  } catch (error) {
    // Clean up on unexpected error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, () => {});
      });
    }
    next(error);
  }
};

module.exports = { uploadResume };
