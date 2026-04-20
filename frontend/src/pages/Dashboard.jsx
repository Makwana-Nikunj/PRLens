import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import TabSummary from '../components/dashboard/TabSummary';
import TabChanges from '../components/dashboard/TabChanges';
import TabRisks from '../components/dashboard/TabRisks';
import ChatPanel from '../components/dashboard/ChatPanel';
import prService from '../services/prService';
import chatService from '../services/chatService';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [activePRId, setActivePRId] = useState(null);
  const [newPrUrl, setNewPrUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const activePR = historyList.find(h => h.pr_id === activePRId) || null;

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);
  const [messages, setMessages] = useState([
    { id: 1, who: 'ai', text: "I've analyzed this PR. It adds edge runtime support." },
    { id: 2, who: 'user', text: "Will this break existing API routes?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current || window.innerWidth < 1024) return;
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(Math.max(300, Math.min(520, newWidth)));
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

  useEffect(() => {
    if (activePRId) {
      chatService.getHistory(activePRId)
        .then(res => {
          if (res.success && res.data?.length > 0) {
            const loadedMessages = res.data.map(m => ({
              id: m.id || Date.now() + Math.random(),
              who: m.role === 'user' ? 'user' : 'ai',
              text: m.content
            }));
            setMessages(loadedMessages);
          } else {
            setMessages([{ id: Date.now(), who: 'ai', text: "I'm ready. Ask me anything about this PR!" }]);
          }
        })
        .catch(err => {
          console.error("Failed to load chat history", err);
          setMessages([{ id: Date.now(), who: 'ai', text: "I'm ready. Ask me anything about this PR!" }]);
        });
    }
  }, [activePRId]);

  const handleHistoryClick = (id) => {
    setActivePRId(id);
    setTimeout(() => { setSidebarOpen(false); }, 400);
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    try {
      const data = await prService.getPrList();
      if (data && data.length > 0) {
        setHistoryList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Check if there is a pending PR to analyze from the landing page
    const pendingPr = sessionStorage.getItem('pending_pr_analyze');
    if (pendingPr) {
      sessionStorage.removeItem('pending_pr_analyze');
      setNewPrUrl(pendingPr);

      // Small timeout to allow state to settle before triggering
      setTimeout(() => {
        setIsAnalyzing(true);
        prService.analyzePr(pendingPr)
          .then(async (result) => {
            if (result) {
              await fetchPRs();
              setNewPrUrl('');
              if (result.analysis?.pr_id) {
                setActivePRId(result.analysis.pr_id);
              }
            }
          })
          .catch(error => {
            console.error(error);
            alert('Failed to analyze PR from link');
          })
          .finally(() => {
            setIsAnalyzing(false);
          });
      }, 500);
    }
  }, []);

  const handleNewPR = async () => {
    if (!newPrUrl) return;
    setIsAnalyzing(true);
    try {
      const result = await prService.analyzePr(newPrUrl);
      if (result) {
        await fetchPRs();
        setNewPrUrl('');
        if (result.analysis?.pr_id) {
          setActivePRId(result.analysis.pr_id);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to analyze PR');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !activePRId) return;
    setMessages(prev => [...prev, { id: Date.now(), who: 'user', text }]);
    setInputValue('');
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto';

    setIsTyping(true);
    try {
      const resp = await chatService.sendMessage(activePRId, text);
      const reply = resp?.data?.reply || resp?.reply || "Error generating response.";
      setMessages(prev => [...prev, { id: Date.now(), who: 'ai', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now(), who: 'ai', text: "Sorry, I encountered an error." }]);
    } finally {
      setIsTyping(false);
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
          onNewClick={() => { setActivePRId(null); if (window.innerWidth < 768) setSidebarOpen(false); }}
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
          <div className="flex-1 overflow-y-auto bg-[#0b0b0f] p-4 sm:p-6 lg:p-8">
            <div className="max-w-[760px] mx-auto w-full">
              {!activePR ? (
                <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4 w-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-600/20 to-purple-500/20 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-8 text-violet-400 shadow-[0_0_40px_rgba(124,58,237,0.15)] animate-[reveal-up_0.4s_ease-out_forwards]">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight animate-[reveal-up_0.5s_ease-out_forwards]">Analyze a Pull Request</h2>
                  <p className="text-[15px] text-[#A1A1AA] max-w-lg mb-10 leading-relaxed animate-[reveal-up_0.6s_ease-out_forwards]">
                    Paste a GitHub Pull Request URL below to generate an AI-powered summary, review key file changes, and detect potential risks before merging.
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleNewPR(); }} className="w-full max-w-xl flex flex-col sm:flex-row gap-3 animate-[reveal-up_0.7s_ease-out_forwards]">
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
        <ChatPanel
          chatCollapsed={chatCollapsed} chatOpenMobile={chatOpenMobile}
          chatWidth={chatWidth} isResizingRef={isResizingRef}
          toggleChat={toggleChat} messages={messages} isTyping={isTyping}
          messagesEndRef={messagesEndRef} chatInputRef={chatInputRef}
          inputValue={inputValue} autoResizeInput={autoResizeInput}
          handleSendMessage={handleSendMessage}
        />
        <button
          className={`fixed right-4 md:right-5 bottom-4 md:bottom-5 w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/20 z-10 transition-all duration-300 ${isReopenShown ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0 pointer-events-none'}`}
          onClick={() => toggleChat(true)} title="Open chat"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h7" /></svg>
        </button>
      </div>
    </div>
  );
};
export default Dashboard;