import { create } from 'zustand';
import { getSummaryToken, saveSummaryToken, deleteSummaryToken } from '../lib/summaryDB';

export const useChatStore = create((set, get) => ({
    summaryToken: null,
    prId: null,

    loadToken: async (prId) => {
        set({ prId });
        try {
            const token = await getSummaryToken(prId);
            set({ summaryToken: token || null });
        } catch (e) {
            console.error("Failed to load summary token", e);
        }
    },

    setToken: async (token) => {
        const { prId } = get();
        if (!prId) return;
        set({ summaryToken: token });
        try {
            await saveSummaryToken(prId, token);
        } catch (e) {
            console.error("Failed to save summary token", e);
        }
    },

    clearToken: async () => {
        const { prId } = get();
        if (!prId) return;
        set({ summaryToken: null });
        try {
            await deleteSummaryToken(prId);
        } catch (e) {
            console.error("Failed to delete summary token", e);
        }
    }
}));
