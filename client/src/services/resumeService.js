import api from './api';

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
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

export const getDashboardStats = () => api.get('/match/stats');
