import apiClient from '../lib/apiClient';

const chatService = {
    // Send a message to chat with a PR
    sendMessage: async (prId, message) => {
        const response = await apiClient.post('/chat', { pr_id: prId, message });
        return response.data;
    },

    // Fetch chat history for a PR
    getHistory: async (prId) => {
        const response = await apiClient.get(`/chat/${prId}`);
        return response.data;
    }
};

export default chatService;