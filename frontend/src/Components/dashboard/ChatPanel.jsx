import React, { memo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = memo(({ msg, isStreaming }) => {
  const userBubble = 'bg-violet-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-violet-900/30 p-2 sm:p-3 max-w-[75%] sm:max-w-[70%]';
  const aiBase = 'rounded-2xl rounded-bl-sm p-2 sm:p-3 max-w-[100%] sm:max-w-[100%]';
  const aiBubble = `text-[#E4E4E7] ${aiBase}`;
  const proseBase = 'break-words min-w-0 prose prose-invert prose-sm max-w-none prose-sm:leading-snug prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-pre:bg-[#0f0f13] prose-pre:border prose-pre:border-[#1a1a1f] prose-pre:rounded-xl prose-pre:p-3 prose-pre:text-[13px] prose-code:text-[13px] prose-code:bg-[#0b0b0f] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#1a1a1f] prose-h1:text-[15px] prose-h1:font-semibold prose-h2:text-[13px] prose-h2:font-semibold prose-h3:text-[13px] prose-h3:font-semibold prose-strong:text-white prose-headings:text-white prose-li:marker:text-violet-400 prose-a:text-violet-400 hover:prose-a:text-violet-300';

  return (
    <div className={msg.who === 'user' ? 'flex justify-end' : 'w-full'}>
      <div className={msg.who === 'user' ? userBubble : aiBubble}>
        <div className={msg.who === 'ai' ? proseBase : 'break-words min-w-0 text-white'}>
          {msg.who === 'ai' ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          ) : (
            msg.text
          )}
        </div>
        {isStreaming && (
          <span className="inline-block w-[2px] h-[16px] bg-violet-400 ml-[1px] align-middle animate-pulse" />
        )}
      </div>
    </div>
  );
});

const ChatPanel = memo(({ chatCollapsed, chatOpenMobile, chatWidth, isResizingRef, toggleChat, messages, isTyping, streamingMsgId, messagesEndRef, chatInputRef, inputValue, autoResizeInput, handleSendMessage, onToggleSidebar }) => {
  useEffect(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: streamingMsgId ? 'auto' : 'smooth' });
    }
  }, [messages, isTyping, streamingMsgId, messagesEndRef]);

  return (
    <aside
      className={`flex flex-col bg-[#161618] border-l border-[#1a1a1f] absolute lg:static top-0 right-0 h-full z-20 transition-transform duration-300 ${chatCollapsed ? 'translate-x-[110%] lg:w-0 lg:border-none lg:opacity-0' : 'translate-x-full md:translate-x-0 w-[100vw] sm:w-[380px] lg:w-[360px]'} ${chatOpenMobile ? '!translate-x-0' : ''}`}
      style={{ width: window.innerWidth >= 1024 && !chatCollapsed ? chatWidth + 'px' : undefined }}
    >
      <div
        className="hidden lg:block absolute left-[-4px] top-0 bottom-0 w-[8px] cursor-col-resize z-50 group hover:bg-violet-500/20 active:bg-violet-500/50 transition"
        onMouseDown={(e) => {
          isResizingRef.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          e.preventDefault();
        }}
      ></div>
      <div className="h-[60px] border-b border-[#1a1a1f] flex items-center justify-between px-4 sm:px-5 shrink-0" onClick={(e) => { if (window.innerWidth < 768 && !e.target.closest('button')) toggleChat(); }}>
        <div className="text-[15px] font-semibold text-[#E4E4E7]">Ask PRLens</div>
        <div className="flex items-center gap-1">
          <button className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-white transition" onClick={onToggleSidebar} title="Toggle sidebar">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <button className="w-8 h-8 flex shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-white transition md:hidden" onClick={() => toggleChat(false)} title="Close">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 scrollbar-hide">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} isStreaming={msg.id === streamingMsgId} />
        ))}
        {isTyping && !streamingMsgId && (
          <div className="flex gap-2 sm:gap-3 self-start">
            <div className="p-2 sm:p-3 rounded-2xl rounded-bl-sm text-[#E4E4E7] w-full">
              <span className="inline-flex gap-1">
                <span className="w-[5px] h-[5px] rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-[5px] h-[5px] rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-[5px] h-[5px] rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-[#161618] border-t border-[#1a1a1f] shrink-0">
        <div className="relative flex items-end bg-[#0b0b0f] border border-[#1a1a1f] rounded-xl focus-within:border-violet-500/50 transition overflow-hidden">
          <textarea
            className="w-full bg-transparent border-none text-[14px] text-white p-3 md:pr-12 pr-10 focus:outline-none resize-none min-h-[44px] max-h-[120px] scrollbar-hide leading-relaxed placeholder-[#71717A]"
            ref={chatInputRef} value={inputValue} onChange={autoResizeInput}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Ask anything..." rows="1"
          ></textarea>
          <button className="absolute right-2 bottom-2 w-[28px] md:w-[32px] h-[28px] md:h-[32px] shrink-0 flex items-center justify-center rounded-lg bg-[#1a1a1f] text-white hover:bg-violet-600 transition disabled:opacity-50 disabled:bg-[#1a1a1f]" onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
});

export default ChatPanel;
