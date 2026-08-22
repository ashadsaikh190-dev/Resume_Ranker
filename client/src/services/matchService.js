import api from './api';

/**
 * Match all resumes against a specific job description.
 */
export const matchResumesToJob = (jobId) => {
  return api.get(`/match/${jobId}`);
};

/**
 * Get dashboard summary stats.
 */
export const getDashboardStats = () => {
  return api.get('/match/stats');
};
