import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      login: ({ userData, accessToken }) => set({
        user: userData,
        accessToken,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (error) return;
        useAuthStore.setState({ isHydrated: true });
      },
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.setState({ isHydrated: true });
}

export default useAuthStore;
