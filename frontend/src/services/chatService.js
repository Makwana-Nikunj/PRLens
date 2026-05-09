import { apiClient } from '../lib/apiClient';
import conf from '../conf/conf';

const chatService = {
    // Send a message to chat with a PR
    sendMessage: async (prId, message, onChunk) => {
        // We use native fetch for streaming SSE. `withCredentials: true` ensures cookies (session) are sent.
        const response = await fetch(`${conf.apiBaseUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ pr_id: prId, message })
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep last incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') {
                        return fullText;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            fullText += parsed.text;
                            if (onChunk) onChunk(parsed.text);
                        } else if (parsed.error) {
                            const err = new Error(parsed.error);
                            err._sseError = true;
                            throw err;
                        }
                    } catch (e) {
                        if (e._sseError) throw e;
                    }
                }
            }
        }
        return fullText;
    },

    // Fetch chat history for a PR
    getHistory: async (prId) => {
        const response = await apiClient.get(`/chat/${prId}`);
        return response.data;
    }
};

export default chatService;