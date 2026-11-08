import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiGet = (url, config) => api.get(url, config);
export const apiPost = (url, data, config) => api.post(url, data, config);

export default api;
