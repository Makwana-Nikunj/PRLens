import apiClient from '../lib/apiClient';
import conf from '../conf/conf';

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

    // Get analysis history
    getHistory: async () => {
        const response = await apiClient.get('/pr/history');
        return response.data?.data || response.data;
    },

    // Trigger analysis for a specific PR
    analyzePr: async (prUrl, onProgress) => {
        const response = await fetch(`${conf.apiBaseUrl}/pr/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ url: prUrl }),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const dataStr = line.replace('data: ', '');
                        const data = JSON.parse(dataStr);
                        
                        if (data.phase === "error") {
                            throw new Error(data.error || "Streaming error occurred");
                        } else if (data.phase === "complete") {
                            return data.result;
                        } else if (data.phase && onProgress) {
                            onProgress({ phase: data.phase, progress: data.progress || 0 });
                        }
                    } catch (e) {
                        if (e.message && e.message.includes("Streaming error")) throw e;
                        console.error('Error parsing SSE data:', e, line);
                    }
                }
            }
        }
    },

    renamePr: async (prId, title) => {
        const response = await apiClient.put(`/pr/${prId}`, { title });
        return response.data?.data || response.data;
    },

    deletePr: async (prId) => {
        const response = await apiClient.delete(`/pr/${prId}`);
        return response.data?.data || response.data;
    }
};

export default prService;