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
  
  // Add download story functionality 
  downloadStory: async (roomCode) => {
    try {
      const response = await apiClient.get(`/api/stories/${roomCode}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'story.txt';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error downloading story:', error);
      throw error;
    }
  },
};