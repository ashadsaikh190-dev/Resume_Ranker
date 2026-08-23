import api from './api';

/**
 * Upload a single resume PDF file and get parsed text back.
 *
 * @param {File} file - The PDF File object to upload.
 * @param {function} onProgress - Callback receiving progress percentage (0–100).
 * @returns {Promise} Axios response with parsed resume data.
 */
export const uploadResume = (file, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);

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
