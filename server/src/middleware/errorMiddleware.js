/**
 * Global error-handling middleware.
 * Catches Multer errors and any other unhandled errors.
 */
const errorMiddleware = (err, _req, res, _next) => {
  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10 MB per file.',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 10 files per upload.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.',
    });
  }

  // Multer file-filter rejection (our custom message)
  if (err.message === 'Only PDF files are allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Generic server error
  console.error('Server error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorMiddleware;
