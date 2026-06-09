import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/dashboard/Sidebar';
import Header from '../Components/dashboard/Header';
import TabSummary from '../Components/dashboard/TabSummary';
import TabChanges from '../Components/dashboard/TabChanges';
import TabRisks from '../Components/dashboard/TabRisks';
import ChatPanel from '../Components/dashboard/ChatPanel';
import prService from '../services/prService';
import { useChat, useChatResize } from '../hooks/useChat';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [activePRId, setActivePRId] = useState(null);
  const [newPrUrl, setNewPrUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const activePR = historyList.find(h => h.pr_id === activePRId) || null;

  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const isResizingRef = useRef(false);
  const timersRef = useRef([]);

  const chat = useChat({ prId: activePRId });
  const resize = useChatResize({ chatCollapsed, setChatCollapsed, chatOpenMobile, setChatOpenMobile, isResizingRef });

  const fetchPRs = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await prService.getPrList();
      if (data && data.length > 0) setHistoryList(data);
      else setHistoryList([]);
    } catch (err) {
      console.error(err);
      setHistoryError(err);
      setHistoryList([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const pollForAnalysis = async (prUrl, timeoutMs = 300000, intervalMs = 5000) => {
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
  };

  useEffect(() => {
    const pendingPr = sessionStorage.getItem('pending_pr_analyze');
    if (pendingPr) {
      sessionStorage.removeItem('pending_pr_analyze');
      setNewPrUrl(pendingPr);
      const timer = setTimeout(async () => {
        setIsAnalyzing(true);
        try {
          const result = await prService.analyzePr(pendingPr);
          await fetchPRs();
          if (result?.analysis?.pr_id) setActivePRId(result.analysis.pr_id);
          setNewPrUrl('');
        } catch (error) {
          console.warn('Initial analyze failed, polling for result...', error);
          try {
            await pollForAnalysis(pendingPr);
            await fetchPRs();
            setNewPrUrl('');
          } catch (pollError) {
            console.error(pollError);
            setHistoryError(pollError);
            setNewPrUrl('');
          }
        } finally {
          setIsAnalyzing(false);
        }
      }, 500);
      timersRef.current.push(timer);
    }
  }, []);

  useEffect(() => {
    fetchPRs();
  }, []);

  const handleNewPR = async () => {
    const url = newPrUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setHistoryError(new Error('Please enter a valid URL'));
      return;
    }
    if (!url.includes('github.com') || !url.includes('/pull/')) {
      setHistoryError(new Error('Please enter a valid GitHub PR URL'));
      return;
    }
    setIsAnalyzing(true);
    setHistoryError(null);
    try {
      await prService.analyzePr(url);
      await fetchPRs();
      setActivePRId(null);
      setNewPrUrl('');
    } catch (error) {
      console.warn('Initial analyze failed, polling for result...', error);
      const rateLimit = error?.status === 429 || /rate limit/i.test(error?.message || '');
      if (rateLimit) {
        setHistoryError(new Error('Rate limit hit. Please wait a moment and try again.'));
        return;
      }
      try {
        await pollForAnalysis(url);
        await fetchPRs();
        setActivePRId(null);
        setNewPrUrl('');
      } catch (pollError) {
        console.error(pollError);
        setHistoryError(pollError);
        setNewPrUrl(url);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistoryClick = (id) => {
    setActivePRId(id);
    if (window.innerWidth < 1024) setChatOpenMobile(true);
    else setChatCollapsed(false);
    const timer = setTimeout(() => setSidebarOpen(false), 400);
    timersRef.current.push(timer);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const isReopenShown = resize.isReopenShown;

  return (
    <div className="w-full h-[100dvh] bg-[#0f0f13] text-[#E4E4E7] font-sans flex overflow-hidden">
      <div className="flex w-full h-full relative overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          historyList={historyList} activePRId={activePRId}
          handleHistoryClick={handleHistoryClick}
          onNewClick={() => {
            setActivePRId(null);
            setChatOpenMobile(false);
            setChatCollapsed(true);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          isHistoryLoading={isHistoryLoading}
          historyError={historyError}
          onRetryHistory={fetchPRs}
        />
        <main className="flex-1 min-w-0 flex flex-col bg-[#0f0f13]">
          <Header activePR={activePR} setSidebarOpen={setSidebarOpen} />
          <div className="flex border-b border-[#1a1a1f] px-2 sm:px-4 shrink-0 overflow-x-auto scrollbar-hide">
            {activePR && ['summary', 'changes', 'risks'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-3.5 text-[14px] font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab ? 'text-violet-500 border-violet-500' : 'text-[#A1A1AA] border-transparent hover:text-white hover:border-white/20'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'summary' ? 'Summary' : tab === 'changes' ? 'Key Changes' : 'Risks'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-[#0b0b0f] p-4 sm:p-6 lg:p-8 scrollbar-hide">
            <div className="max-w-[760px] mx-auto w-full">
              {!activePR ? (
                <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4 w-full">
                  <div className="w-20 h-20 bg-violet-600/30 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-8 text-violet-400 shadow-[0_0_40px_rgba(124,58,237,0.15)] animate-[reveal-up_0.4s_ease-out_forwards]">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight animate-[reveal-up_0.5s_ease-out_forwards]">Analyze a Pull Request</h2>
                  <p className="text-[15px] text-[#A1A1AA] max-w-lg mb-10 leading-relaxed animate-[reveal-up_0.6s_ease-out_forwards]">
                    Paste a GitHub Pull Request URL below to generate an AI-powered summary, review key file changes, and detect potential risks before merging.
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleNewPR(); }} className="w-full max-w-xl flex flex-col sm:flex-row gap-3 animate-[reveal-up_0.7s_ease-out_forwards]">
                    {historyError && (
                      <p className="text-[13px] text-red-400 text-center sm:text-left">
                        {historyError.message}
                      </p>
                    )}
                    <input
                      type="url"
                      placeholder="https://github.com/owner/repo/pull/123"
                      value={newPrUrl}
                      onChange={(e) => setNewPrUrl(e.target.value)}
                      className="flex-1 px-4 py-3.5 bg-[#1a1a1f] text-white text-[15px] rounded-xl border border-[#2a2a2f] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition shadow-inner"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-semibold text-[15px] rounded-xl transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isAnalyzing ? (
                        <><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> Analyzing...</>
                      ) : (
                        <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Analyze PR</>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {activeTab === 'summary' && <TabSummary activePR={activePR} />}
                  {activeTab === 'changes' && <TabChanges activePR={activePR} />}
                  {activeTab === 'risks' && <TabRisks activePR={activePR} />}
                </>
              )}
            </div>
          </div>
        </main>
        {activePR && (
          <>
            <ChatPanel
              chatCollapsed={chatCollapsed} chatOpenMobile={chatOpenMobile}
              chatWidth={resize.chatWidth} isResizingRef={isResizingRef}
              toggleChat={resize.toggleChat} messages={chat.messages} isTyping={chat.isTyping}
              streamingMsgId={chat.streamingMsgId}
              messagesEndRef={chat.messagesEndRef} chatInputRef={chat.chatInputRef}
              inputValue={chat.inputValue} autoResizeInput={chat.autoResizeInput}
              handleSendMessage={chat.handleSendMessage}
            />
            {chat.chatError && (
              <div className="fixed bottom-[88px] right-4 md:right-6 z-30 w-[320px] max-w-[calc(100vw-32px)] rounded-xl bg-[#1a1a1f] border border-white/10 shadow-2xl p-4">
                <p className="text-[13px] text-[#E4E4E7] leading-relaxed">{chat.chatError.message || chat.chatError}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={chat.dismissError} className="text-[12px] px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/15 transition">Dismiss</button>
                  <button onClick={chat.retryLastFailed} className="text-[12px] px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition">Retry last message</button>
                </div>
              </div>
            )}
            <button
              className={`fixed right-4 md:right-5 bottom-4 md:bottom-5 w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/20 z-10 transition-all duration-300 ${isReopenShown ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0 pointer-events-none'}`}
              onClick={() => resize.toggleChat(true)} title="Open chat"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h7" /></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
