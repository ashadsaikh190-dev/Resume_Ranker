import api from './api';

/**
 * Upload multiple resume PDF files and get parsed text back.
 *
 * @param {File[]} files - Array of PDF File objects to upload.
 * @param {function} onProgress - Callback receiving progress percentage (0–100).
 * @returns {Promise} Axios response with parsed resume data.
 */
export const uploadResumes = (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('resume', file);
  });

  return api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });
};
