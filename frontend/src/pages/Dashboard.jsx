import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/dashboard/Sidebar';
import Header from '../Components/dashboard/Header';
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

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const {
    historyList, activePRId, setActivePRId,
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    isAnalyzing, historyError, fetchPRs, analyzePendingPr
  } = useDashboardStore();

  const activePR = useMemo(() => historyList.find(h => h.pr_id === activePRId) || null, [historyList, activePRId]);

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
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#0f0f13] text-[#E4E4E7] font-sans flex overflow-hidden">
      <div className="flex w-full h-full relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col bg-[#0f0f13] relative">
          <Header activePR={activePR} setSidebarOpen={setSidebarOpen} />
          <div className="flex border-b border-[#1a1a1f] px-2 sm:px-4 shrink-0 overflow-x-auto scrollbar-hide">
            {activePR && ['summary', 'changes', 'risks', 'checklist', 'files'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-3.5 text-[14px] font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab ? 'text-violet-500 border-violet-500' : 'text-[#A1A1AA] border-transparent hover:text-white hover:border-white/20'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'summary' ? 'Summary' : tab === 'changes' ? 'Key Changes' : tab === 'risks' ? 'Risks' : tab === 'checklist' ? 'Reviewer Checklist' : 'File Explanations'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#0b0b0f] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24 scrollbar-hide">
            <div className="max-w-[760px] mx-auto w-full">
              {!activePR ? (
                <AnalyzeForm />
              ) : (
                <ErrorBoundary inline>
                  {activeTab === 'summary' && <TabSummary activePR={activePR} />}
                  {activeTab === 'changes' && <TabChanges activePR={activePR} />}
                  {activeTab === 'risks' && <TabRisks activePR={activePR} />}
                  {activeTab === 'checklist' && <TabChecklist activePR={activePR} />}
                  {activeTab === 'files' && <TabFileExplanations activePR={activePR} />}
                </ErrorBoundary>
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
                className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center z-30 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
