const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://tournamentapi-production-4846.up.railway.app/api';

export const apiClient = {
  tournaments: {
    list: async (skip = 0, limit = 10, status_filter = null) => {
      try {
        const params = new URLSearchParams();
        params.append('skip', skip);
        params.append('limit', limit);
        if (status_filter) params.append('status_filter', status_filter);
        
        const response = await fetch(`${API_BASE}/tournaments?${params}`);
        if (!response.ok) throw new Error('Failed to fetch tournaments');
        return await response.json();
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        return [];
      }
    },

    get: async (id) => {
      try {
        const response = await fetch(`${API_BASE}/tournaments/${id}`);
        if (!response.ok) throw new Error('Tournament not found');
        return await response.json();
      } catch (error) {
        console.error('Error fetching tournament:', error);
        return null;
      }
    },

    create: async (data, token) => {
      try {
        const response = await fetch(`${API_BASE}/tournaments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create tournament');
        return await response.json();
      } catch (error) {
        console.error('Error creating tournament:', error);
        return null;
      }
    },

    join: async (id, freefire_uid, file) => {
      try {
        const formData = new FormData();
        formData.append('freefire_uid', freefire_uid);
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/tournaments/${id}/join`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('Failed to join tournament');
        return await response.json();
      } catch (error) {
        console.error('Error joining tournament:', error);
        return null;
      }
    }
  },

  auth: {
    login: async (email, password) => {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      } catch (error) {
        console.error('Error logging in:', error);
        return null;
      }
    },

    register: async (email, username, password) => {
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
        if (!response.ok) throw new Error('Registration failed');
        return await response.json();
      } catch (error) {
        console.error('Error registering:', error);
        return null;
      }
    }
  }
};

export default apiClient;
