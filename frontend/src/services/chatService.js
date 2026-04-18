import apiClient from '../lib/apiClient';

const chatService = {
    // Send a message to chat with a PR
    sendMessage: async (prId, message) => {
        const response = await apiClient.post('/chat', { pr_id: prId, message });
        return response.data;
    }
};

export default chatService;