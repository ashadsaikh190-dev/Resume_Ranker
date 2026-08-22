const path = require('path');
const Resume = require('../models/Resume');
const { extractTextFromPDF } = require('../services/pdfService');

/**
 * @desc   Upload multiple PDF resumes, extract text, store metadata
 * @route  POST /api/resumes/upload
 */
const uploadResumes = async (req, res, next) => {
  try {
    // Validate that files were provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files selected. Please upload at least one PDF resume.',
      });
    }

    const results = [];

    for (const file of req.files) {
      // 1. Create the resume document with metadata
      const resume = await Resume.create({
        candidateName: path.basename(file.originalname, '.pdf'),
        originalFileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      // 2. Extract text from the PDF (FR-3)
      let extractedText = '';
      try {
        extractedText = await extractTextFromPDF(file.path);
      } catch (extractionError) {
        console.warn(
          `⚠️  Text extraction failed for ${file.originalname}: ${extractionError.message}`
        );
        // Continue — the resume is still saved even if extraction fails
      }

      // 3. Update the resume document with extracted text
      resume.extractedText = extractedText;
      await resume.save();

      results.push({
        id: resume._id,
        originalFileName: resume.originalFileName,
        extractedText: extractedText ? true : false,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resumes uploaded successfully',
      resumes: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResumes };
