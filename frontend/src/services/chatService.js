import conf from '../conf/conf.js';

const chatService = {
    sendMessage: async (prId, message, onChunk, signal) => {
        const response = await fetch(`${conf.apiBaseUrl}/chat/${prId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message }),
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
                    await reader.cancel();
                    throw new Error('Message aborted');
                }
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') break;
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
            reader.releaseLock().catch(() => void 0);
        }

        return fullText;
    },

    getHistory: async (prId) => {
        const response = await fetch(`${conf.apiBaseUrl}/chat/${prId}/history`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`);
        }

        const data = await response.json();
        const messages = (data.data || []).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
        }));
        return { success: true, data: messages };
    }
};

export default chatService;
