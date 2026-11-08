import api from './api';

export const createJob = (payload) => api.post('/jobs', payload);
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const matchResumesToJob = ({ jobId, resumes }) => api.post('/match', { jobId, resumes });
