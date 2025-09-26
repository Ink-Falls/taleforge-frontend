import apiClient from './index';

export const gameApi = {
  startRoleAssignment: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/start-role-assignment`);
    return response.data;
  },

  assignRoles: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/assign-roles`);
    return response.data;
  },

  startStorytelling: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/start-storytelling`);
    return response.data;
  },

  completeStory: async (roomCode) => {
    const response = await apiClient.post(`/api/stories/${roomCode}/complete`);
    return response.data;
  },
};