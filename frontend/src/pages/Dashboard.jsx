import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListChecks, FileText, LayoutDashboard } from 'lucide-react';
import Sidebar from '../Components/dashboard/Sidebar';
import Header from '../Components/dashboard/Header';
import PRPageHeader from '../Components/dashboard/PRPageHeader';
import TabSummary from '../Components/dashboard/TabSummary';
import TabChanges from '../Components/dashboard/TabChanges';
import TabRisks from '../Components/dashboard/TabRisks';
import TabChecklist from '../Components/dashboard/TabChecklist';
import TabFileExplanations from '../Components/dashboard/TabFileExplanations';
import ChatPanel from '../Components/dashboard/ChatPanel';
import AnalyzeForm from '../Components/dashboard/AnalyzeForm';
import ErrorBoundary from '../Components/ErrorBoundary';
import { useChat, useChatResize } from '../hooks/useChat';
import useDashboardStore from '../store/dashboardStore';

// Same defensive parsing the tab components use, so tab badges match card contents
const parseListField = (value) => {
  if (!value) return [];
  let parsed = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { /* not JSON */ }
  }
  if (Array.isArray(parsed)) {
    return parsed.filter((item) => item && typeof item === 'string' && item.toLowerCase() !== 'none');
  }
  if (typeof parsed === 'string' && parsed.toLowerCase() !== 'none') {
    return parsed.split('\n').filter((item) => item.trim());
  }
  return [];
};

const parseFileCount = (value) => {
  if (!value) return 0;
  let parsed = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return 0; }
  }
  if (parsed && typeof parsed === 'object') {
    return Object.entries(parsed).filter(([_, v]) => v && typeof v === 'string' && v.toLowerCase() !== 'none').length;
  }
  return 0;
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'checklist', label: 'Reviewer Checklist', icon: ListChecks },
  { id: 'files', label: 'File Explanations', icon: FileText },
];

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    historyList, activePRId, setActivePRId,
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    isAnalyzing, historyError, fetchPRs, analyzePendingPr
  } = useDashboardStore();

  const activePR = useMemo(() => historyList.find(h => h.pr_id === activePRId) || null, [historyList, activePRId]);

  const tabCounts = useMemo(() => {
    const analysis = activePR?.analysis;
    return {
      checklist: parseListField(analysis?.checklist).length,
      files: parseFileCount(analysis?.file_explanations),
    };
  }, [activePR]);

  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const isResizingRef = useRef(false);
  const timersRef = useRef([]);

  const chat = useChat({ prId: activePRId });
  const resize = useChatResize({ chatCollapsed, setChatCollapsed, chatOpenMobile, setChatOpenMobile, isResizingRef });

  useEffect(() => {
    const pendingPr = sessionStorage.getItem('pending_pr_analyze');
    if (pendingPr) {
      sessionStorage.removeItem('pending_pr_analyze');
      const timer = setTimeout(() => {
        analyzePendingPr(pendingPr);
      }, 500);
      timersRef.current.push(timer);
    }
  }, []);

  useEffect(() => {
    fetchPRs();
  }, []);

  const lastId = useRef(id);
  const lastActivePRId = useRef(activePRId);

  useEffect(() => {
    const prIdFromUrl = (id === 'new' || !id) ? null : id;

    const urlChanged = id !== lastId.current;
    const storeChanged = activePRId !== lastActivePRId.current;

    lastId.current = id;
    lastActivePRId.current = activePRId;

    if (urlChanged && !storeChanged) {
      // User navigated via URL/Link. Sync URL -> Store
      setActivePRId(prIdFromUrl);
    } else if (storeChanged && !urlChanged) {
      // Store updated (e.g. analysis finished). Sync Store -> URL
      const targetUrl = activePRId ? `/pr/${activePRId}` : '/pr/new';
      navigate(targetUrl, { replace: true });
    } else if (!urlChanged && !storeChanged) {
      // Initial mount check
      if (activePRId === null && prIdFromUrl !== null) {
        setActivePRId(prIdFromUrl);
      }
    }
  }, [id, activePRId, navigate, setActivePRId]);

  useEffect(() => {
    setChatOpenMobile(false);
    setChatCollapsed(true);
  }, [id]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const isReopenShown = resize.isReopenShown;

  const handleChatToggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#0a0a0d] text-[#E4E4E7] font-sans flex overflow-hidden">
      <div className="flex w-full h-full relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col bg-[#0a0a0d] relative">
          <Header activePR={activePR} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#0a0a0d] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24 scrollbar-hide">
            <div className="max-w-[760px] mx-auto w-full">
              {!activePR ? (
                <AnalyzeForm />
              ) : (
                <>
                  <PRPageHeader activePR={activePR} />

                  {/* Sticky segmented tabs (bleed matches the scroller's padding) */}
                  <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 -mt-2 pt-4 pb-4 bg-[#0a0a0d]">
                    <div
                      className="inline-flex gap-1 overflow-x-auto scrollbar-hide rounded-xl p-1 max-w-full"
                      style={{ background: '#131318', border: '1px solid #232330' }}
                      role="tablist"
                      aria-label="PR insights"
                    >
                      {TABS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        const count = tabCounts[id];
                        return (
                          <button
                            key={id}
                            role="tab"
                            aria-selected={isActive}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${isActive ? 'text-white' : 'text-[#9b9ba8] hover:text-[#f3f3f6] hover:bg-white/5'}`}
                            style={isActive ? { background: '#7c3aed', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' } : undefined}
                            onClick={() => setActiveTab(id)}
                          >
                            <Icon className={`w-[15px] h-[15px] shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                            {label}
                            {count > 0 && (
                              <span
                                className={`ml-0.5 min-w-[20px] h-[18px] px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums ${isActive ? 'bg-white/20 text-white' : 'bg-[#232330] text-[#9b9ba8]'}`}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div key={activeTab} className="animate-[prl-fade-up_0.35s_cubic-bezier(0.16,1,0.3,1)]">
                    <ErrorBoundary inline>
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          <TabSummary activePR={activePR} />
                          <TabChanges activePR={activePR} />
                          <TabRisks activePR={activePR} />
                        </div>
                      )}
                      {activeTab === 'checklist' && <TabChecklist activePR={activePR} />}
                      {activeTab === 'files' && <TabFileExplanations activePR={activePR} />}
                    </ErrorBoundary>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        {activePR && (
          <ErrorBoundary inline>
            <ChatPanel
              chatCollapsed={chatCollapsed} chatOpenMobile={chatOpenMobile}
              chatWidth={resize.chatWidth} isResizingRef={isResizingRef}
              toggleChat={resize.toggleChat} messages={chat.messages} isTyping={chat.isTyping}
              streamingMsgId={chat.streamingMsgId}
              messagesEndRef={chat.messagesEndRef} chatInputRef={chat.chatInputRef}
              inputValue={chat.inputValue} autoResizeInput={chat.autoResizeInput}
              handleSendMessage={chat.handleSendMessage}
              onToggleSidebar={handleChatToggleSidebar}
              onStopStreaming={chat.stopStreaming}
            />
          </ErrorBoundary>
        )}
        {activePR && resize.isReopenShown && !chatOpenMobile && (
          <button
                type="button"
                onClick={() => resize.toggleChat(true)}
                className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full flex items-center justify-center z-30 transition hover:bg-[#8b5cf6]"
                style={{ background: '#7c3aed', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
              >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
