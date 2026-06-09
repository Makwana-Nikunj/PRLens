import { apiClient } from '../lib/apiClient';
import conf from '../conf/conf';

const chatService = {
    // Send a message to chat with a PR
    sendMessage: async (prId, message, onChunk, summaryToken = null, signal) => {
        const response = await fetch(`${conf.apiBaseUrl}/chat/${prId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ message, summaryToken }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        try {
            while (true) {
                if (signal?.aborted) {
                    try { await reader.cancel(); } catch (_cancelErr) {}
                    throw new Error('Message aborted');
                }
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep last incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            break;
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
                            throw e;
                        }
                    }
                }
            }
        } finally {
            try { reader.releaseLock(); } catch (_releaseErr) {}
        }

        return fullText;
    },

    summarize: async (prId, latestMessage, latestResponse, summaryToken = null) => {
        const response = await apiClient.post(`/chat/${prId}/summarize`, {
            summaryToken,
            latestMessage,
            latestResponse
        });
        return response.data;
    },

    // Fetch chat history for a PR
    getHistory: async (prId) => {
        const response = await fetch(`${conf.apiBaseUrl}/chat/${prId}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to load chat history: ${response.statusText}`);
        }

        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error('Invalid response from server while loading chat history');
        }
        const messages = (result?.data || []).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
        }));
        return { success: true, data: messages };
    }
};

export default chatService;