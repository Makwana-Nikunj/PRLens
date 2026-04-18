import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

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
}));

export default useAuthStore;