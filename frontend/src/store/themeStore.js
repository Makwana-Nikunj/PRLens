import { create } from 'zustand';

const THEME_STORAGE_KEY = 'prlens-theme';
const THEMES = { DARK: 'dark', LIGHT: 'light' };

/**
 * Reads the saved theme. The inline script in index.html performs the same
 * lookup before first paint to prevent a flash of the wrong theme; this runs
 * afterwards so React state stays in sync even if that script was blocked.
 */
const getInitialTheme = () => {
  if (typeof window === 'undefined') return THEMES.DARK;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  } catch {
    return THEMES.DARK;
  }
};

const applyThemeToDom = (theme) => {
  const root = document.documentElement;
  root.classList.toggle(THEMES.DARK, theme === THEMES.DARK);
  root.classList.toggle(THEMES.LIGHT, theme === THEMES.LIGHT);

  // Keep the browser UI (address bar on mobile) in sync with the page
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === THEMES.LIGHT ? '#fafaff' : '#0f0f13');
};

/**
 * Adds a short-lived class that cross-fades color changes (see index.css).
 * Removed after the transition so it never interferes with other animations.
 */
const withTransition = (apply) => {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  apply();
  window.setTimeout(() => root.classList.remove('theme-transition'), 400);
};

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    if (theme !== THEMES.DARK && theme !== THEMES.LIGHT) return;
    if (theme === get().theme) return;
    withTransition(() => applyThemeToDom(theme));
    set({ theme });
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Private mode / storage disabled: theme still applies for this session
    }
  },

  toggleTheme: () => {
    get().setTheme(get().theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  },
}));

// Sync the DOM with the persisted theme on load (no-op when already correct)
if (typeof window !== 'undefined') {
  applyThemeToDom(useThemeStore.getState().theme);
}

export default useThemeStore;
