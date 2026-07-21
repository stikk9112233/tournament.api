// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tournamentapi-production-4846.up.railway.app/api';

export const apiClient = {
  // Headers helper
  getHeaders: (token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // AUTH ENDPOINTS
  auth: {
    register: async (email, username, password, freefire_uid) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: apiClient.getHeaders(),
        body: JSON.stringify({
          email,
          username,
          password,
          freefire_uid,
        }),
      });
      return response.json();
    },

    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: apiClient.getHeaders(),
        body: JSON.stringify({
          email,
          password,
        }),
      });
      return response.json();
    },

    getCurrentUser: async (token) => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: apiClient.getHeaders(token),
      });
      return response.json();
    },
  },

  // TOURNAMENT ENDPOINTS
  tournaments: {
    create: async (tournamentData, token) => {
      const response = await fetch(`${API_BASE_URL}/tournaments/`, {
        method: 'POST',
        headers: apiClient.getHeaders(token),
        body: JSON.stringify(tournamentData),
      });
      return response.json();
    },

    list: async (skip = 0, limit = 10, status_filter = 'active') => {
      const response = await fetch(
        `${API_BASE_URL}/tournaments/?skip=${skip}&limit=${limit}&status_filter=${status_filter}`,
        {
          method: 'GET',
          headers: apiClient.getHeaders(),
        }
      );
      return response.json();
    },

    getById: async (tournamentId) => {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
        method: 'GET',
        headers: apiClient.getHeaders(),
      });
      return response.json();
    },

    join: async (tournamentId, userId, paymentFile, token) => {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', paymentFile);

      const response = await fetch(
        `${API_BASE_URL}/tournaments/${tournamentId}/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );
      return response.json();
    },

    getParticipants: async (tournamentId) => {
      const response = await fetch(
        `${API_BASE_URL}/tournaments/${tournamentId}/participants`,
        {
          method: 'GET',
          headers: apiClient.getHeaders(),
        }
      );
      return response.json();
    },

    approveParticipant: async (tournamentId, participantId, token) => {
      const response = await fetch(
        `${API_BASE_URL}/tournaments/${tournamentId}/participants/${participantId}/approve`,
        {
          method: 'POST',
          headers: apiClient.getHeaders(token),
        }
      );
      return response.json();
    },
  },

  // USERS ENDPOINTS
  users: {
    getById: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: apiClient.getHeaders(),
      });
      return response.json();
    },

    getProfile: async (token) => {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'GET',
        headers: apiClient.getHeaders(token),
      });
      return response.json();
    },
  },

  // HEALTH CHECK
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: apiClient.getHeaders(),
    });
    return response.json();
  },
};

export default apiClient;
