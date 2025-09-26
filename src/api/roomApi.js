import apiClient from './index';
import { useSession } from '../context/SessionContext';

export const roomApi = {
  createRoom: async (roomData) => {
    const response = await apiClient.post('/api/stories', roomData);
    return response.data;
  },

  joinRoom: async (roomCode, playerData) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/join`, playerData);
    return response.data;
  },

  getRoomStatus: async (roomCode) => {
    const response = await apiClient.get(`/api/stories/${roomCode}`);
    return response.data;
  },

  leaveRoom: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/leave`);
    return response.data;
  },

  updateTitle: async (roomCode, titleData) => {
    const response = await apiClient.put(`/api/stories/${roomCode}/title`, titleData);
    return response.data;
  },

  updateCharacter: async (roomCode, characterData) => {
    const playerId = sessionStorage.getItem('taleforge_playerId');
    if (!playerId) {
      throw new Error('Player ID not found in session');
    }
    const response = await apiClient.put(`/api/stories/${roomCode}/players/${playerId}`, characterData);
    return response.data;
  },
};