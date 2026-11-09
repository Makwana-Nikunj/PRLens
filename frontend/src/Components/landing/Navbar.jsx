import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDashboard = () => {
    setMenuOpen(false);
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const linkClass = "text-[15px] font-medium text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition-colors no-underline";

  return (
    <nav className="relative flex justify-between items-center py-6 px-6 max-w-[1320px] mx-auto w-full">
      <Link to="/" className="text-[28px] font-bold tracking-[-2px] font-display text-[var(--prl-text)] no-underline">
        prlens.
      </Link>

      <div className="hidden md:flex items-center gap-7">
        <a href="#faq" className={linkClass}>FAQ</a>
        <Link to="/docs" className={linkClass}>Docs</Link>
        <ThemeToggle />
        <button
          onClick={handleDashboard}
          className="py-2 px-4 rounded font-sans text-[14px] font-semibold text-[var(--prl-text)] bg-[var(--prl-bg-soft)] hover:bg-[var(--prl-accent)] hover:text-black hover:shadow-[0_0_16px_rgba(204,255,0,0.2)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
          Dashboard
        </button>
      </div>

      <div className="flex md:hidden items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          className="flex items-center justify-center w-[40px] h-[40px] min-h-[40px] rounded text-[var(--prl-text)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <X className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--prl-panel-2)] p-6 flex flex-col gap-5 z-50 border-b border-[var(--prl-border)]/60 shadow-2xl prl-tab-fade">
          <a href="#faq" className={linkClass} onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/docs" className={linkClass} onClick={() => setMenuOpen(false)}>Docs</Link>
          <button
            onClick={handleDashboard}
            className="py-3 px-6 rounded font-sans text-[14px] font-semibold text-[var(--prl-text)] bg-[var(--prl-bg-soft)] cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
