import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const tournamentsAPI = {
  // ============ TOURNAMENT ROUTES ============
  
  /**
   * Create a new tournament
   */
  createTournament: async (tournamentData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/create`,
        tournamentData
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error creating tournament:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get tournament details with all matches
   */
  getDetails: async (tournamentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/details`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching tournament details:', error);
      throw error.response?.data || error;
    }
  },

  // ============ PARTICIPANT ROUTES ============

  /**
   * Player joins a tournament
   */
  joinTournament: async (tournamentId, userId, freefireUid) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/join`,
        {
          tournament_id: tournamentId,
          user_id: userId,
          freefire_uid: freefireUid
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error joining tournament:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all participants in a tournament
   */
  getParticipants: async (tournamentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/participants`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      throw error.response?.data || error;
    }
  },

  // ============ SCORE ENTRY ROUTES ============

  /**
   * Organizer enters match scores
   * scores: [
   *   { participant_id: 1, kills: 5, position: 1, is_booyah: true },
   *   { participant_id: 2, kills: 3, position: 2, is_booyah: false }
   * ]
   */
  enterMatchScores: async (matchId, scores) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${matchId}/enter-score`,
        scores
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error entering match scores:', error);
      throw error.response?.data || error;
    }
  },

  // ============ LEADERBOARD ROUTES ============

  /**
   * Get player's personal leaderboard for a tournament
   */
  getLeaderboard: async (tournamentId, userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/leaderboard/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get player's complete playing history across all tournaments
   */
  getPlayingHistory: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${userId}/playing-history`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching playing history:', error);
      throw error.response?.data || error;
    }
  }
};

export default tournamentsAPI;
