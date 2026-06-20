import { create } from 'zustand';
import prService from '../services/prService';

const useDashboardStore = create((set, get) => ({
  // State
  historyList: [],
  activePRId: null,
  isHistoryLoading: false,
  historyError: null,
  isRenaming: null,
  isDeleting: null,
  isAnalyzing: false,

  // Sidebar Layout State
  sidebarOpen: false,
  sidebarCollapsed: false,

  // Actions - UI
  setActivePRId: (id) => set({ activePRId: id }),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setSidebarCollapsed: (isCollapsed) => set({ sidebarCollapsed: isCollapsed }),

  // Actions - Data Fetching
  fetchPRs: async () => {
    set({ isHistoryLoading: true, historyError: null });
    try {
      const data = await prService.getPrList();
      if (data && data.length > 0) {
        set({ historyList: data, isHistoryLoading: false });
      } else {
        set({ historyList: [], isHistoryLoading: false });
      }
    } catch (err) {
      console.error(err);
      set({ historyError: err, historyList: [], isHistoryLoading: false });
    }
  },

  deletePr: async (id) => {
    set({ isDeleting: id });
    try {
      await prService.deletePr(id);
      const state = get();
      if (state.activePRId === id) {
        set({ activePRId: null });
      }
      await state.fetchPRs();
    } catch (err) {
      console.error(err);
      set({ historyError: err });
    } finally {
      set({ isDeleting: null });
    }
  },

  renamePr: async (id, title) => {
    set({ isRenaming: id });
    try {
      const trimmed = title.trim();
      if (!trimmed) return;
      await prService.renamePr(id, trimmed);
      await get().fetchPRs();
    } catch (err) {
      console.error(err);
      set({ historyError: err });
    } finally {
      set({ isRenaming: null });
    }
  },

  pollForAnalysis: async (prUrl, timeoutMs = 300000, intervalMs = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const history = await prService.getHistory();
        if (history && history.length > 0) {
          const match = history.find(item => item.github_pr_url === prUrl);
          if (match) return match;
        }
      } catch (err) {
        console.warn('Polling PR history failed, retrying...', err);
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error('Analysis timed out');
  },

  analyzePr: async (url) => {
    set({ isAnalyzing: true, historyError: null });
    try {
      await prService.analyzePr(url);
      await get().fetchPRs();
      set({ activePRId: null, isAnalyzing: false });
    } catch (error) {
      console.warn('Initial analyze failed, polling for result...', error);
      const rateLimit = error?.status === 429 || /rate limit/i.test(error?.message || '');
      if (rateLimit) {
        set({ historyError: new Error('Rate limit hit. Please wait a moment and try again.'), isAnalyzing: false });
        throw error;
      }
      try {
        await get().pollForAnalysis(url);
        await get().fetchPRs();
        set({ activePRId: null, isAnalyzing: false });
      } catch (pollError) {
        console.error(pollError);
        set({ historyError: pollError, isAnalyzing: false });
        throw pollError;
      }
    }
  },

  analyzePendingPr: async (pendingPrUrl) => {
    set({ isAnalyzing: true, historyError: null });
    try {
      const result = await prService.analyzePr(pendingPrUrl);
      await get().fetchPRs();
      if (result?.analysis?.pr_id) {
        set({ activePRId: result.analysis.pr_id });
      }
    } catch (error) {
      console.warn('Initial analyze failed, polling for result...', error);
      try {
        await get().pollForAnalysis(pendingPrUrl);
        await get().fetchPRs();
      } catch (pollError) {
        console.error(pollError);
        set({ historyError: pollError });
      }
    } finally {
      set({ isAnalyzing: false });
    }
  }
}));

export default useDashboardStore;
