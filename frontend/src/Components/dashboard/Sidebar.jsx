import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import apiClient from '../../lib/apiClient';

const Sidebar = memo(({ sidebarOpen, setSidebarOpen, historyList, activePRId, handleHistoryClick, onNewClick }) => {
  const { user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredHistory = useMemo(() => {
    return historyList ? historyList.filter(item => {
      if (!searchTerm) return true;
      const url = item.github_pr_url || '';
      return url.toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];
  }, [historyList, searchTerm]);

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`fixed md:static inset-y-0 left-0 w-[260px] bg-[#0b0b0f] border-r border-[#1a1a1f] flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-[60px] flex items-center px-4 border-b border-[#1a1a1f] gap-3 shrink-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-purple-500/20 text-purple-400 border border-violet-600/30">
            <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 9v9" /></svg>
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-white">PRLens</div>
        </div>

        <nav className="p-3 shrink-0 flex flex-col gap-3">
          <button
            type="button"
            onClick={onNewClick}
            className="w-full flex justify-center items-center gap-2 px-3 py-2 bg-white text-black font-semibold text-[13px] rounded-lg transition hover:-translate-y-px hover:bg-gray-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Analyze PR
          </button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#71717A]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#1a1a1f] text-white text-[13px] rounded-lg border border-[#2a2a2f] focus:outline-none focus:border-violet-500"
            />
          </div>
        </nav>

        <div className="my-[2px] mx-4 h-px bg-[#1a1a1f] shrink-0"></div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="px-2 py-1.5 text-[11px] font-bold text-[#71717A] uppercase tracking-wider sticky top-0 bg-[#0b0b0f] z-10 mt-1">Recent Analyses</div>
          <div className="flex flex-col gap-1 mt-1">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(item => {
                let repoName = 'Repository';
                let prTitle = 'Unknown PR';
                if (item.github_pr_url) {
                  const parts = item.github_pr_url.split('/');
                  repoName = `${parts[3]}/${parts[4]}`;

                  // Use the PR Title if available, else derive from the AI summary, else just default to PR number
                  if (item.title) {
                    prTitle = item.title;
                  } else if (item.analysis?.summary) {
                    prTitle = item.analysis.summary.split(' ').slice(0, 5).join(' ') + '...';
                  } else {
                    prTitle = `PR #${parts[6]}`;
                  }
                }
                return (
                  <div
                    key={item.pr_id}
                    className={`p-2.5 rounded-lg cursor-pointer transition select-none flex flex-col gap-1 ${activePRId === item.pr_id ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' : 'text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-[#E4E4E7] border border-transparent'}`}
                    onClick={() => handleHistoryClick(item.pr_id)}
                  >
                    <div className="text-[13px] truncate font-medium flex items-center justify-between">
                      <span className="truncate">{repoName}</span>
                    </div>
                    <div className={`text-[11.5px] truncate ${activePRId === item.pr_id ? 'text-violet-400/80' : 'text-[#71717A]'}`}>
                      {prTitle}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center mt-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#1a1a1f] text-[#71717A] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <p className="text-[12px] text-[#A1A1AA]">No PRs analyzed yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-[#1a1a1f] shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1f] rounded-lg transition text-left"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-md object-cover shrink-0 border border-white/10" />
            ) : user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-md object-cover shrink-0 border border-white/10" />
            ) : user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-md object-cover shrink-0 border border-white/10" />
            ) : user?.username ? (
              <img src={`https://github.com/${user.username}.png`} alt="Avatar" className="w-9 h-9 rounded-md object-cover shrink-0 border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[12px] font-bold text-white shadow-inner shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex-1 overflow-hidden flex flex-col justify-center">
              <div className="text-[13px] font-semibold text-[#E4E4E7] truncate">{user?.name || user?.username || 'User'}</div>
              <div className="text-[11px] text-[#71717A] truncate">@{user?.username || 'github'}</div>
            </div>
            <svg className={`w-4 h-4 text-[#A1A1AA] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
          </button>

          {profileDropdownOpen && (
            <div className="absolute bottom-[calc(100%-8px)] left-3 right-3 bg-[#1a1a1f] border border-[#2a2a2f] rounded-lg shadow-xl overflow-hidden py-1 z-50 mb-1 animate-[reveal-up_0.2s_ease-out]">
              <button className="w-full px-4 py-2.5 text-left text-[13px] text-[#E4E4E7] hover:bg-[#2a2a2f] transition flex items-center gap-2">
                <svg className="w-4 h-4 text-[#A1A1AA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[13px] text-[#E4E4E7] hover:bg-[#2a2a2f] transition flex items-center gap-2">
                <svg className="w-4 h-4 text-[#A1A1AA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                Settings
              </button>
              <div className="h-px bg-[#2a2a2f] my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-500/10 transition flex items-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
});
export default Sidebar;