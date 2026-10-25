import axios from 'axios';

// Read backend API URL from Vite environment variable (fallback to localhost:5050/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API helpers
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  getMe: () => api.get('/auth/me'),
};

// Document API helpers
export const documentAPI = {
  list: () => api.get('/documents'),
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  download: async (id, originalName) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', originalName || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
  remove: (id) => api.delete(`/documents/${id}`),
};

export default api;
