import api from './api';

/**
 * Save a new job description.
 */
export const createJob = (data) => {
  return api.post('/jobs', data);
};

/**
 * Get all job descriptions.
 */
export const getJobs = () => {
  return api.get('/jobs');
};

/**
 * Get a single job description by ID.
 */
export const getJobById = (id) => {
  return api.get(`/jobs/${id}`);
};
