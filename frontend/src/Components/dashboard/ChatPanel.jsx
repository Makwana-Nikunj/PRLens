import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';

// Memoize individual messages to prevent expensive markdown re-parsing on every keystroke
const ChatMessage = memo(({ msg }) => (
  <div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] ${msg.who === 'user' ? 'self-end flex-row-reverse' : ''}`}>
    <div className={`w-[28px] h-[28px] shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold ${msg.who === 'ai' ? 'bg-gradient-to-br from-violet-600/20 to-purple-500/20 text-violet-400 border border-violet-600/30' : 'bg-gradient-to-br from-[#0f0f13] to-[#1a1a1f] text-white border border-[#1a1a1f]'}`}>
      {msg.who === 'ai' ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M6 9v9"></path></svg>
      ) : 'NM'}
    </div>
    <div className={`p-3 rounded-xl text-[14px] leading-relaxed break-words min-w-0 prose prose-invert max-w-none ${msg.who === 'ai' ? 'bg-[#1a1a1f] text-white rounded-tl-sm border border-white/5' : 'bg-violet-600 text-white rounded-tr-sm'}`}>
      <ReactMarkdown>{msg.text}</ReactMarkdown>
    </div>
  </div>
));

const ChatPanel = memo(({ chatCollapsed, chatOpenMobile, chatWidth, isResizingRef, toggleChat, messages, isTyping, messagesEndRef, chatInputRef, inputValue, autoResizeInput, handleSendMessage }) => (
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
      <button className="w-8 h-8 flex shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-[#1a1a1f] hover:text-white transition" onClick={() => toggleChat(false)} title="Collapse">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-hide">
      {messages.map(msg => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
      {isTyping && (
        <div className="flex gap-2 sm:gap-3 max-w-[90%]">
          <div className="w-[28px] h-[28px] shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-violet-600/20 to-purple-500/20 text-violet-400 border border-violet-600/30">
            <svg className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M6 9v9"></path></svg>
          </div>
          <div className="p-3 rounded-xl text-[14px] leading-relaxed bg-[#1a1a1f] text-white rounded-tl-sm border border-white/5">
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
));
export default ChatPanel;