const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      default: '',
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: String,
      default: 'anonymous',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
