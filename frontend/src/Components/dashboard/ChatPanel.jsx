import React, { memo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = memo(({ msg, isStreaming }) => {
  const userBubble = 'bg-[#ccff00] text-[#09090b] rounded-lg rounded-br-sm shadow-md shadow-violet-900/30 p-2 sm:p-3 max-w-[75%] sm:max-w-[70%]';
  const aiBase = 'rounded-lg rounded-bl-sm p-2 sm:p-3 max-w-[100%] sm:max-w-[100%]';
  const aiBubble = `text-[#E4E4E7] light:text-[#2a2a33] ${aiBase}`;
  const proseBase = 'text-[#E4E4E7] light:text-[#2a2a33] break-words min-w-0 prose prose-invert prose-sm max-w-none prose-sm:leading-snug prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-p:text-[#E4E4E7] prose-p:light:text-[#2a2a33] prose-ul:my-1 prose-ul:text-[#E4E4E7] prose-ul:light:text-[#2a2a33] prose-ol:my-1 prose-ol:text-[#E4E4E7] prose-ol:light:text-[#2a2a33] prose-li:my-0 prose-li:text-[#E4E4E7] prose-li:light:text-[#2a2a33] prose-pre:my-2 prose-pre:bg-[#18181b] prose-pre:light:bg-[#f4f4f9] prose-pre:text-[#E4E4E7] prose-pre:light:text-[#2a2a33] prose-pre:border prose-pre:border-[#27272a] prose-pre:light:border-[#27272a] prose-pre:rounded-md prose-pre:p-3 prose-pre:text-[13px] prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:text-[13px] prose-code:text-[#E4E4E7] prose-code:light:text-[#18181f] prose-code:bg-[#18181b] prose-code:light:bg-[#f4f4f9] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#27272a] prose-code:light:border-[#27272a] prose-h1:text-[15px] prose-h1:font-semibold prose-h2:text-[13px] prose-h2:font-semibold prose-h3:text-[13px] prose-h3:font-semibold prose-strong:text-white prose-strong:light:text-[#18181f] prose-headings:text-white prose-headings:light:text-[#18181f] prose-li:marker:text-[#a3cc00] prose-li:marker:light:text-[#ccff00] prose-a:text-[#a3cc00] prose-a:light:text-[#ccff00] hover:prose-a:text-[#b08bff] hover:prose-a:light:text-[#ccff00]';

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

const ChatPanel = memo(({ chatCollapsed, chatOpenMobile, chatWidth, isResizingRef, toggleChat, messages, isTyping, streamingMsgId, messagesEndRef, chatInputRef, inputValue, autoResizeInput, handleSendMessage, onStopStreaming, onToggleSidebar }) => {
  useEffect(() => {
    if (messagesEndRef?.current) {
      // Only scroll if the chat panel is actually open to prevent unwanted horizontal scrolling
      const isChatVisible = (window.innerWidth < 1024 && chatOpenMobile) || (window.innerWidth >= 1024 && !chatCollapsed);
      if (isChatVisible) {
        const container = messagesEndRef.current.parentElement;
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: streamingMsgId ? 'auto' : 'smooth' });
        }
      }
    }
  }, [messages, isTyping, streamingMsgId, messagesEndRef, chatCollapsed, chatOpenMobile]);

  return (
    <aside
      className={`flex flex-col bg-[#18181b] light:bg-[#f1f1f6] border-l border-[#27272a] light:border-[#27272a] absolute lg:static top-0 right-0 h-full z-20 transition-all duration-300 w-full sm:w-[380px] lg:w-[360px] ${chatCollapsed ? 'translate-x-[110%] lg:w-0 lg:border-none lg:opacity-0' : 'translate-x-full lg:translate-x-0'} ${chatOpenMobile ? '!translate-x-0' : ''}`}
      style={{ width: window.innerWidth >= 1024 && !chatCollapsed ? chatWidth + 'px' : undefined }}
    >
      <div
        className="hidden lg:block absolute left-[-4px] top-0 bottom-0 w-[8px] cursor-col-resize z-50 group hover:bg-[#ccff00]/10 active:bg-[#ccff00]/10 transition"
        onMouseDown={(e) => {
          isResizingRef.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          e.preventDefault();
        }}
      ></div>
      <div className="sticky top-0 z-10 bg-[#18181b] light:bg-[#f1f1f6] h-[60px] border-b border-[#27272a] light:border-[#27272a] flex items-center justify-between px-4 sm:px-5 shrink-0">
        <div className="flex items-center justify-start w-10">
          <button className="w-8 h-8 flex shrink-0 items-center justify-center rounded-lg text-[#a1a1aa] light:text-[#5d5d6a] hover:bg-[#18181b] hover:light:bg-[#ffffff] hover:text-[#fafafa] hover:light:text-[#18181f] transition -ml-1" onClick={() => toggleChat(false)} title="Back">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
        </div>
        <div className="flex-1 flex justify-center text-[15px] font-semibold text-[#fafafa] light:text-[#18181f]" style={{ fontFamily: 'var(--font-display)' }}>
          Ask PRLens
        </div>
        <div className="flex items-center justify-end w-10">
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden p-4 flex flex-col gap-5 scrollbar-hide">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} isStreaming={msg.id === streamingMsgId} />
        ))}
        {isTyping && !streamingMsgId && (
          <div className="flex gap-2 sm:gap-3 self-start">
            <div className="p-2 sm:p-3 rounded-lg rounded-bl-sm text-[#E4E4E7] light:text-[#2a2a33] w-full">
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
       <div className="sticky bottom-0 z-10 p-4 bg-[#18181b] light:bg-[#f1f1f6] border-t border-[#27272a] light:border-[#27272a] shrink-0">
         <div className="relative flex items-end bg-[#18181b] light:bg-[#ffffff] border border-[#27272a] light:border-[#27272a] rounded-md focus-within:border-[#a3cc00]/60 transition overflow-hidden">
           <textarea
             className="w-full bg-transparent border-none text-[14px] text-white light:text-[#18181f] p-3 md:pr-12 pr-10 focus:outline-none resize-none min-h-[44px] max-h-[120px] scrollbar-hide leading-relaxed placeholder-[#a1a1aa] light:placeholder-[#82828e]"
             ref={chatInputRef} value={inputValue} onChange={autoResizeInput}
             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (streamingMsgId || isTyping) { onStopStreaming?.(); } else { handleSendMessage(); } } }}
             placeholder="Ask anything..." rows="1"
           ></textarea>
           {streamingMsgId || isTyping ? (
             <button className="absolute right-2 bottom-2 w-[28px] md:w-[32px] h-[28px] md:h-[32px] shrink-0 flex items-center justify-center rounded-lg bg-[#27272a] light:bg-[#e5e5ee] text-white light:text-[#2a2a33] hover:bg-[#ccff00] hover:light:text-white transition" onClick={onStopStreaming} title="Stop generating">
               <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
             </button>
           ) : (
             <button className="absolute right-2 bottom-2 w-[28px] md:w-[32px] h-[28px] md:h-[32px] shrink-0 flex items-center justify-center rounded-lg bg-[#27272a] light:bg-[#e5e5ee] text-white light:text-[#2a2a33] hover:bg-[#ccff00] hover:light:text-white transition disabled:opacity-50 disabled:bg-[#27272a] disabled:light:bg-[#e5e5ee]" onClick={handleSendMessage} disabled={!inputValue.trim()}>
               <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
             </button>
           )}
         </div>
       </div>
    </aside>
  );
});

export default ChatPanel;
