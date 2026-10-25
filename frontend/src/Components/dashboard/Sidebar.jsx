import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ChevronDown, X, Plus, Search, MoreVertical, SearchX, User, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useDashboardStore from '../../store/dashboardStore';
import useThemeStore from '../../store/themeStore';
import apiClient from '../../lib/apiClient';
import ThemeToggle from '../ui/ThemeToggle';

function stop(e) { e.stopPropagation(); }

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed,
    historyList, activePRId, setActivePRId,
    isHistoryLoading, historyError, fetchPRs,
    renamePr, deletePr, isRenaming, isDeleting
  } = useDashboardStore();
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';
  const hoverSurface = isLight ? '#f1f1f6' : '#18181b';
  const textDim = isLight ? '#5d5d6a' : '#a1a1aa';
  const textHover = isLight ? '#2a2a33' : '#d4d4d8';
  const textFaint = isLight ? '#82828e' : '#a1a1aa';
  const [searchTerm, setSearchTerm] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const menuContainerRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleMenuClick = (e, prId) => {
    stop(e);
    setOpenMenuId(prev => prev === prId ? null : prId);
  };

  const handleMenuMouseDown = (e) => e.stopPropagation();

  useEffect(() => {
    if (!openMenuId) { setMenuPos(null); return; }
    const btn = document.querySelector(`[data-menu-id="${openMenuId}"]`);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - 144) });
  }, [openMenuId]);

  useEffect(() => {
    if (!openMenuId || deleteTarget || renameTarget) return;
    const handler = (e) => {
      const inMenu = menuContainerRef.current && menuContainerRef.current.contains(e.target);
      const onTrigger = !!e.target.closest(`[data-menu-id="${openMenuId}"]`);
      if (!inMenu && !onTrigger) setOpenMenuId(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [openMenuId, deleteTarget, renameTarget]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => { if (e.key === 'Escape') setOpenMenuId(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openMenuId]);

  const handleLogout = async () => {
    try { await apiClient.post('/auth/logout'); } catch (error) { console.error('Logout error:', error); } finally { logout(); }
  };

  useEffect(() => {
    if ((sidebarOpen && window.innerWidth < 1024) || renameTarget || deleteTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, renameTarget, deleteTarget]);

  const filteredHistory = useMemo(() => {
    if (!historyList) return [];
    return historyList.filter(item => {
      if (!searchTerm) return true;
      const url = item.github_pr_url || '';
      return url.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [historyList, searchTerm]);

  const startRename = (item) => {
    setOpenMenuId(null);
    setRenameTarget(item);
    setRenameValue(item.title || item.analysis?.summary || '');
  };
  const confirmRename = () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !renameTarget) return;
    renamePr(renameTarget.pr_id, trimmed);
    setRenameTarget(null);
    setRenameValue('');
  };
  const cancelRename = () => { setRenameTarget(null); setRenameValue(''); };
  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') confirmRename();
    if (e.key === 'Escape') cancelRename();
  };

  const startDelete = (prId) => { setOpenMenuId(null); setDeleteTarget(prId); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePr(deleteTarget);
    setDeleteTarget(null);
  };
  const cancelDelete = () => setDeleteTarget(null);

  const menuPortal = openMenuId && menuPos && !deleteTarget && !renameTarget;
  const menuItem = historyList?.find(h => h.pr_id === openMenuId);

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-[260px] bg-[var(--prl-bg-soft)] border-r border-[var(--prl-border)] flex flex-col z-40 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[260px]'}`}
      >
        <div className="h-[60px] flex items-center px-4 border-b border-[var(--prl-border)] gap-3 shrink-0">
          <div className="relative w-8 h-8 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--prl-accent-soft)] text-[var(--prl-accent)] border border-[var(--prl-accent-line)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 9v9" /></svg>
            </div>
            {sidebarCollapsed && (
              <button type="button" onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex absolute inset-0 w-full h-full items-center justify-center bg-[#18181b]/80 light:bg-[#f4f4f9]/80 rounded-md text-[var(--prl-text)] opacity-0 hover:opacity-100 transition-opacity z-10" title="Expand">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className={`text-[15px] font-semibold tracking-tight text-[var(--prl-text)] truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`} >PRLens</div>
          <div className="flex ml-auto items-center gap-1">
            <div className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <ThemeToggle />
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-white/10 light:hover:bg-black/10 text-[var(--prl-text-dim)]">
              <X className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setSidebarCollapsed(true)} className={`hidden lg:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[var(--prl-text-dim)] hover:bg-[var(--prl-bg-soft)] hover:text-[var(--prl-text)] transition ${sidebarCollapsed ? 'lg:hidden' : ''}`} title="Collapse sidebar">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className={`shrink-0 ${sidebarCollapsed ? 'lg:p-2' : 'p-3'} flex flex-col gap-3`}>
          <button type="button" onClick={() => {
            navigate('/pr/new');
            if (window.innerWidth < 768) setSidebarOpen(false);
          }} className="w-full flex justify-center items-center gap-2 px-3 py-2 min-h-[44px] text-[var(--prl-on-accent)] font-semibold text-[13px] rounded-md transition hover:bg-[var(--prl-accent-fill)] active:scale-[0.98]"
            style={{ background: 'var(--prl-accent-fill)' }}>
            <Plus className="w-4 h-4" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Analyze PR</span>
          </button>
          {sidebarCollapsed ? (
            <button type="button" onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex w-full min-h-[44px] justify-center items-center p-2 rounded-md text-[var(--prl-text-dim)] hover:bg-[var(--prl-bg-soft)] hover:text-[var(--prl-text)] transition" title="Search">
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--prl-text-faint)]">
                <Search className="w-4 h-4" />
              </div>
              <input type="text" placeholder="Search history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 min-h-[44px] bg-[var(--prl-panel)] text-[var(--prl-text)] text-[13px] rounded-md border border-[var(--prl-border)] focus:outline-none focus:border-[var(--prl-accent-2)] transition" />
            </div>
          )}
        </nav>

        <div className={`shrink-0 ${sidebarCollapsed ? 'lg:mx-2 lg:my-2' : 'mx-4'}`}>
          <div className="h-px bg-[#27272a] light:bg-[#e5e5ee]" />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {!sidebarCollapsed && (
            <div className="px-2 py-1.5 text-[11px] font-bold text-[var(--prl-text-faint)] uppercase tracking-wider sticky top-0 bg-[var(--prl-bg-soft)] z-10 mt-1">Recent Analyses</div>
          )}
          <div className={`flex flex-col gap-1 ${sidebarCollapsed ? 'lg:mt-2' : 'mt-1'}`}>
            {isHistoryLoading ? (
              <div className="flex flex-col gap-2 mt-2">{[0,1].map((i) => <div key={i} className="h-14 rounded-md bg-[var(--prl-bg-soft)] animate-pulse" />)}</div>
            ) : historyError ? (
              <div className="mt-3 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-[12px] text-red-400 mb-2">Failed to load history</p>
                <button onClick={fetchPRs} className="text-[12px] px-3 py-1.5 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 transition">Retry</button>
              </div>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map(item => {
                let repoName = 'Repository';
                let prTitle = 'Unknown PR';
                if (item.github_pr_url) {
                  const parts = item.github_pr_url.split('/');
                  repoName = `${parts[3]}/${parts[4]}`;
                  if (item.title) prTitle = item.title;
                  else if (item.analysis?.summary) prTitle = item.analysis.summary.split(' ').slice(0, 5).join(' ') + '...';
                  else prTitle = `PR #${parts[6]}`;
                }
                const isOpen = openMenuId === item.pr_id;

                return (
                  <div key={item.pr_id} className="p-2.5 rounded-md transition select-none flex flex-col gap-1 group cursor-pointer"
                    style={activePRId === item.pr_id
                      ? { background: 'var(--prl-accent-soft)', border: '1px solid var(--prl-accent-line)', color: 'var(--prl-accent)' }
                      : { border: '1px solid transparent', color: textDim }}
                    onMouseEnter={(e) => { if (activePRId !== item.pr_id) { e.currentTarget.style.background = hoverSurface; e.currentTarget.style.color = textHover; } }}
                    onMouseLeave={(e) => { if (activePRId !== item.pr_id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ''; } }}
                    onClick={() => {
                    navigate(`/pr/${item.pr_id}`);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    {!sidebarCollapsed ? (
                      <div className="text-[13px] truncate font-medium flex items-center justify-between">
                        <span className="truncate min-h-[24px] flex items-center">{repoName}</span>
                        <button type="button" data-menu-id={item.pr_id} onMouseDown={handleMenuMouseDown} onClick={(e) => handleMenuClick(e, item.pr_id)} className="w-8 h-8 flex items-center justify-center rounded opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-white/10 hover:light:bg-black/10 text-[var(--prl-text-faint)] hover:text-[var(--prl-text-primary)] transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}
                    {!sidebarCollapsed && (
                      <div className="text-[11.5px] truncate" style={{ color: activePRId === item.pr_id ? 'var(--prl-accent-2)' : textFaint }}>{prTitle}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center mt-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--prl-bg-soft)] text-[var(--prl-text-faint)] flex items-center justify-center mb-3">
                  <SearchX className="w-5 h-5" />
                </div>
                <p className="text-[12px] text-[var(--prl-text-dim)]">No PRs analyzed yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--prl-border)] shrink-0 relative flex justify-center" ref={dropdownRef}>
          <div className={`w-full ${sidebarCollapsed ? 'max-w-[60px]' : 'max-w-[260px]'}`}>
            <button onClick={(e) => { if (sidebarCollapsed) { setSidebarCollapsed(false); setSidebarOpen(true); } else { setProfileDropdownOpen(prev => !prev); } }} className={`w-full min-h-[56px] transition rounded-md ${sidebarCollapsed ? 'flex flex-col items-center gap-2 p-3 text-center' : 'flex items-center gap-3 p-2 hover:bg-[var(--prl-bg-soft)] text-left'}`}>
              {user?.avatar ? (
                <div className="w-8 h-8 rounded-md bg-[var(--prl-accent-soft)] border border-[var(--prl-accent-line)] flex items-center justify-center shrink-0 text-[var(--prl-accent)]">
                  <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : user?.avatarUrl ? (
                <div className="w-8 h-8 rounded-md bg-[var(--prl-accent-soft)] border border-[var(--prl-accent-line)] flex items-center justify-center shrink-0 text-[var(--prl-accent)]">
                  <img src={user.avatarUrl} alt="Avatar" className="w-7 h-7 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : user?.avatar_url ? (
                <div className="w-8 h-8 rounded-md bg-[var(--prl-accent-soft)] border border-[var(--prl-accent-line)] flex items-center justify-center shrink-0 text-[var(--prl-accent)]">
                  <img src={user.avatar_url} alt="Avatar" className="w-7 h-7 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : user?.username ? (
                <div className="w-8 h-8 rounded-md bg-[var(--prl-accent-soft)] border border-[var(--prl-accent-line)] flex items-center justify-center shrink-0 text-[var(--prl-accent)]">
                  <img src={`https://github.com/${user.username}.png`} alt="Avatar" className="w-7 h-7 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-md bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] shadow-inner shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                  <div className="text-[13px] font-semibold text-[var(--prl-text)] truncate">{user?.name || user?.username || 'User'}</div>
                  <div className="text-[11px] text-[var(--prl-text-faint)] truncate">@{user?.username || 'github'}</div>
                </div>
              )}
              {!sidebarCollapsed && (
                <ChevronDown className={`w-4 h-4 text-[var(--prl-text-dim)] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {!sidebarCollapsed && profileDropdownOpen && (
              <div className="absolute bottom-[calc(100%-8px)] left-3 right-3 bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-md shadow-xl overflow-hidden py-1 z-50 mb-1 animate-[reveal-up_0.2s_ease-out]">
                <button className="w-full px-4 py-2.5 text-left text-[13px] text-[var(--prl-text)] hover:bg-[var(--prl-panel)] transition flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--prl-text-dim)]" />
                  Profile
                </button>
                <button className="w-full px-4 py-2.5 text-left text-[13px] text-[var(--prl-text)] hover:bg-[var(--prl-panel)] transition flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--prl-text-dim)]" />
                  Settings
                </button>
                <div className="h-px bg-[#27272a] light:bg-[#e5e5ee] my-1" />
                <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-500/10 transition flex items-center gap-2 font-medium">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {menuPortal && createPortal(
        <div ref={el => { if (el) menuContainerRef.current = el; }} className="fixed w-36 rounded-md bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] shadow-xl py-1 z-[60]" style={{ top: menuPos.top, left: menuPos.left }} onMouseDown={handleMenuMouseDown} onClick={stop}>
          {menuItem && (
            <>
              <button type="button" onMouseDown={handleMenuMouseDown} onClick={() => startRename(menuItem)} className="w-full px-3 py-2 text-left text-[13px] text-[var(--prl-text)] hover:bg-[var(--prl-panel)]">Rename</button>
              <button type="button" onMouseDown={handleMenuMouseDown} onClick={() => startDelete(openMenuId)} className="w-full px-3 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10">Delete</button>
            </>
          )}
        </div>,
        document.body
      )}

      {renameTarget && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) cancelRename(); }} onClick={stop}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[var(--prl-bg-soft)] border border-[var(--prl-border)] rounded-md shadow-2xl p-5">
            <h3 className="text-[15px] font-semibold text-[var(--prl-text)] mb-3">Rename PR</h3>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={handleRenameKeyDown} className="w-full px-3 py-2.5 bg-[var(--prl-bg-soft)] text-[var(--prl-text)] text-[13px] rounded-md border border-[var(--prl-border)] focus:outline-none focus:border-[var(--prl-accent-2)] mb-4" autoFocus />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cancelRename} className="px-3 py-2 text-[13px] text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition">Cancel</button>
              <button type="button" onClick={confirmRename} disabled={isRenaming === renameTarget?.pr_id} className={`px-3 py-2 text-[13px] text-[var(--prl-on-accent)] font-semibold rounded-md transition disabled:opacity-50 hover:bg-[var(--prl-accent-fill)] ${isRenaming === renameTarget?.pr_id ? 'opacity-75 cursor-wait' : ''}`} style={{ background: 'var(--prl-accent-fill)' }}>{isRenaming === renameTarget?.pr_id ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) cancelDelete(); }} onClick={stop}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[var(--prl-bg-soft)] border border-red-500/20 rounded-md shadow-2xl p-5">
            <h3 className="text-[15px] font-semibold text-[var(--prl-text)] mb-2">Delete PR Analysis?</h3>
            <p className="text-[13px] text-[var(--prl-text-dim)] mb-4">This action cannot be undone. All analysis data, chat history, and embeddings for this PR will be permanently removed.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cancelDelete} className="px-3 py-2 text-[13px] text-[var(--prl-text-dim)] hover:text-[var(--prl-text)] transition">Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={isDeleting === deleteTarget} className={`px-3 py-2 text-[13px] bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition disabled:opacity-50 ${isDeleting === deleteTarget ? 'opacity-75 cursor-wait' : ''}`}>{isDeleting === deleteTarget ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

export default Sidebar;
