import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    throw error;
  }
);

const apiClient = {
  auth: {
    register: (email, username, password, freefire_uid) =>
      api.post('/auth/register', { email, username, password, freefire_uid }),
    
    login: (email, password) =>
      api.post('/auth/login', { email, password }),
    
    getMe: () => api.get('/auth/me'),
    
    forgotPassword: (email) =>
      api.post('/auth/forgot-password', { email }),
    
    resetPassword: (token, new_password) =>
      api.post('/auth/reset-password', { token, new_password }),
  },

  tournaments: {
    list: (skip = 0, limit = 10) =>
      api.get(`/tournaments?skip=${skip}&limit=${limit}`),
    
    get: (id) => api.get(`/tournaments/${id}`),
    
    create: (data) => api.post('/tournaments', data),
    
    update: (id, data) => api.put(`/tournaments/${id}`, data),
    
    delete: (id) => api.delete(`/tournaments/${id}`),
    
    join: (id, freefire_uid, file) => {
      const formData = new FormData();
      formData.append('freefire_uid', freefire_uid);
      formData.append('file', file);
      return api.post(`/tournaments/${id}/join`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    getParticipants: (id) =>
      api.get(`/tournaments/${id}/participants`),
    
    getPending: (id) =>
      api.get(`/tournaments/${id}/pending`),
    
    approveParticipant: (tournamentId, participantId) =>
      api.post(`/tournaments/${tournamentId}/participants/${participantId}/approve`),
    
    rejectParticipant: (tournamentId, participantId) =>
      api.post(`/tournaments/${tournamentId}/participants/${participantId}/reject`),
  },

  users: {
    get: (id) => api.get(`/users/${id}`),
    getProfile: () => api.get('/users/me/profile'),
  },
};

export default apiClient;
