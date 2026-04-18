import apiClient from '../lib/apiClient';

const prService = {
    // Get list of all PRs analyzed by the user
    getPrList: async () => {
        const response = await apiClient.get('/pr');
        return response.data?.data || response.data;
    },

    // Get specific PR details
    getPrDetails: async (prId) => {
        const response = await apiClient.get(`/pr/${prId}`);
        return response.data?.data || response.data;
    },

    // Trigger analysis for a specific PR
    analyzePr: async (prUrl) => {
        const response = await apiClient.post('/pr/analyze', { url: prUrl });
        return response.data?.data || response.data;
    }
};

export default prService;