import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

/**
 * Dark/Light mode switch. Single source of truth lives in themeStore —
 * this component only dispatches the toggle and renders the matching icon.
 */
const ThemeToggle = ({ className = '' }) => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center w-[40px] h-[40px] min-h-[40px] rounded-lg text-[#A1A1AA] light:text-[#565662] hover:text-white light:hover:text-[#18181f] hover:bg-white/10 light:hover:bg-black/10 transition ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative block w-5 h-5" aria-hidden="true">
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
          strokeWidth={1.75}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
          strokeWidth={1.75}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
