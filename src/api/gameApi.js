import apiClient from './index';

export const gameApi = {
  startRoleAssignment: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/start-roles`);
    return response.data;
  },

  assignRoles: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/assign-roles`);
    return response.data;
  },

  startStorytelling: async (roomCode) => {
    // Fix the endpoint to match backend controller
    const response = await apiClient.post(`/api/stories/${roomCode}/start-story`);
    return response.data;
  },

  completeStory: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/complete`);
    return response.data;
  },
};