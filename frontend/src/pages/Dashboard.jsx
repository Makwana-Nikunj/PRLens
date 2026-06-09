import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/dashboard/Sidebar';
import Header from '../Components/dashboard/Header';
import TabSummary from '../Components/dashboard/TabSummary';
import TabChanges from '../Components/dashboard/TabChanges';
import TabRisks from '../Components/dashboard/TabRisks';
import ChatPanel from '../Components/dashboard/ChatPanel';
import prService from '../services/prService';
import chatService from '../services/chatService';
import { useChatStore } from '../store/chatStore';

const Dashboard = () => {
  const { summaryToken, loadToken, setToken } = useChatStore();
  const [activeTab, setActiveTab] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [activePRId, setActivePRId] = useState(null);
  const [newPrUrl, setNewPrUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const activePR = historyList.find(h => h.pr_id === activePRId) || null;

  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);
  const [messages, setMessages] = useState([
    { id: 1, who: 'ai', text: "I've analyzed this PR. It adds edge runtime support." },
    { id: 2, who: 'user', text: "Will this break existing API routes?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const lastFailedMessageRef = useRef('');

  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isResizingRef = useRef(false);
  const msgIdRef = useRef(3);
  const pollAbortRef = useRef(false);
  const timersRef = useRef([]);
  const chatAbortRef = useRef(null);
  const pollAbortControllerRef = useRef(null);

  const retryLastFailed = async () => {
    const text = lastFailedMessageRef.current;
    lastFailedMessageRef.current = '';
    setChatError(null);
    setInputValue(text);
    setTimeout(() => {
      chatInputRef.current?.focus();
      handleSendMessage();
    }, 0);
  };

  useEffect(() => {
    return () => {
      pollAbortRef.current = true;
      if (pollAbortControllerRef.current) {
        pollAbortControllerRef.current.abort();
      }
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  /**
   * Handle chat panel resizing on desktop by dragging the left edge
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current || window.innerWidth < 1024) return;
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(Math.max(300, Math.min(700, newWidth)));
    };
    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth < 1024) { setChatCollapsed(false); }
        else { setChatOpenMobile(false); }
      }, 50);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  /**
    * Load chat history when a PR is selected from the sidebar. If there is no history, start with a default message.
    * This runs every time activePRId changes, which happens when user clicks on a different PR in the sidebar.
    */
  useEffect(() => {
    if (activePRId) {
      loadToken(activePRId);
      chatService.getHistory(activePRId)
        .then(res => {
          if (res.success && res.data?.length > 0) {
            const loadedMessages = res.data.map(m => ({
              id: m.id || ++msgIdRef.current,
              who: m.role === 'user' ? 'user' : 'ai',
              text: m.content
            }));
            setMessages(loadedMessages);
          } else {
            setMessages([{ id: ++msgIdRef.current, who: 'ai', text: "I'm ready. Ask me anything about this PR!" }]);
          }
        })
        .catch(err => {
          console.error("Failed to load chat history", err);
          setMessages([{ id: Date.now(), who: 'ai', text: "I'm ready. Ask me anything about this PR!" }]);
        });
    }
  }, [activePRId]);


  /**
    * When user clicks on a PR in the sidebar, we set that PR as active, which triggers loading its details and chat history.
    * We also close the sidebar on mobile for better UX.
    */
   
  const handleHistoryClick = (id) => {
    setActivePRId(id);
    if (window.innerWidth < 1024) {
      setChatOpenMobile(true);
    } else {
      setChatCollapsed(false);
    }
    const timer = setTimeout(() => { setSidebarOpen(false); }, 400);
    timersRef.current.push(timer);
  };


  /**
    * On initial load, we fetch the list of PRs that have been analyzed before and show them in the sidebar.
    * This runs only once when the component mounts.
    */
  useEffect(() => {
    fetchPRs();
  }, []);

  /**
    * This function is used to fetch the list of analyzed PRs from the backend and update the sidebar history.
    * We call this after analyzing a new PR to refresh the list, and also on initial load.
    */
  const fetchPRs = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await prService.getPrList();
      if (data && data.length > 0) {
        setHistoryList(data);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error(err);
      setHistoryError(err);
      setHistoryList([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  /**
    * This effect checks if there is a pending PR URL to analyze (e.g. from the landing page) and triggers analysis if found.
    * It also performs a cleanup of the URL parameters after processing to prevent re-analysis on page refresh.
    */
  const pollForAnalysis = async (prUrl, timeoutMs = 300000, intervalMs = 5000) => {
    pollAbortRef.current = false;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (pollAbortRef.current) {
        throw new Error('Analysis polling aborted');
      }
      try {
        const history = await prService.getHistory();
        if (history && history.length > 0) {
          const match = history.find(item => item.github_pr_url === prUrl);
          if (match) {
            return match;
          }
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
          if (result?.analysis?.pr_id) {
            setActivePRId(result.analysis.pr_id);
          }
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

  /**
    * This function handles sending a new message in the chat interface. It optimistically adds the user's message to the chat, then calls the backend to get the AI response as a stream.
    * As chunks of the AI response come in, it updates the last message in the chat to create a live typing effect. It also handles errors gracefully.
    */
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !activePRId) return;

    // Add user message
    setMessages(prev => [...prev, { id: ++msgIdRef.current, who: 'user', text }]);
    setInputValue('');
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto';

    setIsTyping(true);

    const aiMessageId = ++msgIdRef.current;
    let placeholderAdded = false;
    let resultingAiText = "";

    try {
      chatAbortRef.current = new AbortController();
      resultingAiText = await chatService.sendMessage(activePRId, text, (chunk) => {
        if (!placeholderAdded) {
          placeholderAdded = true;
          setIsTyping(false);
          setStreamingMsgId(aiMessageId);
          setMessages(prev => [...prev, { id: aiMessageId, who: 'ai', text: chunk }]);
        } else {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          );
        }
      }, summaryToken, chatAbortRef.current.signal);
      chatAbortRef.current = null;
      
      const sumRes = await chatService.summarize(activePRId, text, resultingAiText, summaryToken);
      if (sumRes && sumRes.summaryToken) {
        setToken(sumRes.summaryToken);
      }

    } catch (err) {
      console.error(err);
      const rateLimit = err?.status === 429 || /rate limit/i.test(err?.message || '');
      const message = rateLimit
        ? 'Too many requests. Please wait a moment and try again.'
        : 'Something went wrong. Please try again.';
      setChatError(message);

      if (!placeholderAdded) {
        setMessages(prev => [...prev, { id: aiMessageId, who: 'ai', text: message }]);
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, text: `${msg.text}\n\n*(response incomplete — please retry)*` }
              : msg
          )
        );
      }

      if (!rateLimit && text) {
        lastFailedMessageRef.current = text;
      }
    } finally {
      setIsTyping(false);
      setStreamingMsgId(null);
    }
  };

  const toggleChat = (forceOpen) => {
    if (window.innerWidth < 1024) setChatOpenMobile(forceOpen !== undefined ? forceOpen : !chatOpenMobile);
    else setChatCollapsed(forceOpen !== undefined ? !forceOpen : !chatCollapsed);
  };

  const autoResizeInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const isReopenShown = (window.innerWidth < 1024 && !chatOpenMobile) || (window.innerWidth >= 1024 && chatCollapsed);

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
              chatWidth={chatWidth} isResizingRef={isResizingRef}
              toggleChat={toggleChat} messages={messages} isTyping={isTyping}
              streamingMsgId={streamingMsgId}
              messagesEndRef={messagesEndRef} chatInputRef={chatInputRef}
              inputValue={inputValue} autoResizeInput={autoResizeInput}
              handleSendMessage={handleSendMessage}
            />
            {chatError && (
              <div className="fixed bottom-[88px] right-4 md:right-6 z-30 w-[320px] max-w-[calc(100vw-32px)] rounded-xl bg-[#1a1a1f] border border-white/10 shadow-2xl p-4">
                <p className="text-[13px] text-[#E4E4E7] leading-relaxed">{chatError.message || chatError}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setChatError(null)} className="text-[12px] px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/15 transition">Dismiss</button>
                  {lastFailedMessageRef.current && (
                    <button onClick={retryLastFailed} className="text-[12px] px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition">Retry last message</button>
                  )}
                </div>
              </div>
            )}
            <button
              className={`fixed right-4 md:right-5 bottom-4 md:bottom-5 w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/20 z-10 transition-all duration-300 ${isReopenShown ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0 pointer-events-none'}`}
              onClick={() => toggleChat(true)} title="Open chat"
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
