import React, { memo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Square, Send } from 'lucide-react';

const ChatMessage = memo(({ msg, isStreaming }) => {
  const userBubble = 'bg-[var(--prl-accent-fill)] text-[var(--prl-on-accent)] rounded-lg rounded-br-sm p-2 sm:p-3 max-w-[75%] sm:max-w-[70%]';
  const aiBase = 'rounded-lg rounded-bl-sm p-2 sm:p-3 max-w-[100%] sm:max-w-[100%]';
  const aiBubble = `text-[var(--prl-text)] ${aiBase}`;
  const proseBase = 'text-[var(--prl-text)] break-words min-w-0 prose prose-invert prose-sm max-w-none prose-sm:leading-snug prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-p:text-[var(--prl-text)] prose-ul:my-1 prose-ul:text-[var(--prl-text)] prose-ol:my-1 prose-ol:text-[var(--prl-text)] prose-li:my-0 prose-li:text-[var(--prl-text)] prose-pre:my-2 prose-pre:bg-[var(--prl-bg-soft)] prose-pre:text-[var(--prl-text)] prose-pre:border prose-pre:border-[var(--prl-border)] prose-pre:rounded-md prose-pre:p-3 prose-pre:text-[13px] prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:font-mono prose-code:text-[13px] prose-code:text-[var(--prl-text)] prose-code:bg-[var(--prl-bg-soft)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[var(--prl-border)] prose-h1:text-[15px] prose-h1:font-semibold prose-h2:text-[13px] prose-h2:font-semibold prose-h3:text-[13px] prose-h3:font-semibold prose-strong:text-[var(--prl-text)] prose-headings:text-[var(--prl-text)] tracking-tight font-display prose-li:marker:text-[var(--prl-accent)] prose-a:text-[var(--prl-accent)] hover:prose-a:text-[var(--prl-text)]';

  return (
    <div className={msg.who === 'user' ? 'flex justify-end' : 'w-full'}>
      <div className={msg.who === 'user' ? userBubble : aiBubble}>
        <div className={msg.who === 'ai' ? proseBase : 'break-words min-w-0 text-[var(--prl-on-accent)]'}>
          {msg.who === 'ai' ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          ) : (
            msg.text
          )}
        </div>
        {isStreaming && (
          <span className="inline-block w-[2px] h-[16px] bg-[var(--prl-accent)] ml-[1px] align-middle animate-pulse" />
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
      className={`flex flex-col bg-[var(--prl-bg-soft)] border-l border-[var(--prl-border)] absolute lg:static top-0 right-0 h-full z-20 transition-all duration-300 w-full sm:w-[380px] lg:w-[360px] ${chatCollapsed ? 'translate-x-[110%] lg:w-0 lg:border-none lg:opacity-0' : 'translate-x-full lg:translate-x-0'} ${chatOpenMobile ? '!translate-x-0' : ''}`}
      style={{ width: window.innerWidth >= 1024 && !chatCollapsed ? chatWidth + 'px' : undefined }}
    >
      <div
        className="hidden lg:block absolute left-[-4px] top-0 bottom-0 w-[8px] cursor-col-resize z-50 group hover:bg-[var(--prl-accent-soft)] active:bg-[var(--prl-accent-soft)] transition"
        onMouseDown={(e) => {
          isResizingRef.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          e.preventDefault();
        }}
      ></div>
      <div className="sticky top-0 z-10 bg-[var(--prl-bg-soft)] h-[60px] border-b border-[var(--prl-border)] flex items-center justify-between px-4 sm:px-5 shrink-0">
        <div className="flex items-center justify-start w-10">
          <button className="w-8 h-8 flex shrink-0 items-center justify-center rounded-md text-[var(--prl-text-dim)] hover:bg-[var(--prl-panel)] hover:text-[var(--prl-text)] transition -ml-1" onClick={() => toggleChat(false)} title="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex justify-center text-[15px] font-semibold text-[var(--prl-text)]" >
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
            <div className="p-2 sm:p-3 rounded-lg rounded-bl-sm text-[var(--prl-text)] w-full">
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
       <div className="sticky bottom-0 z-10 p-4 bg-[var(--prl-bg-soft)] border-t border-[var(--prl-border)] shrink-0">
         <div className="relative flex items-end bg-[var(--prl-panel)] border border-[var(--prl-border)] rounded-md focus-within:border-[var(--prl-accent-2)]/60 transition overflow-hidden">
           <textarea
             className="w-full bg-transparent border-none text-[14px] text-[var(--prl-text)] p-3 md:pr-12 pr-10 focus:outline-none resize-none min-h-[44px] max-h-[120px] scrollbar-hide leading-relaxed placeholder-[#a1a1aa] light:placeholder-[#82828e]"
             ref={chatInputRef} value={inputValue} onChange={autoResizeInput}
             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (streamingMsgId || isTyping) { onStopStreaming?.(); } else { handleSendMessage(); } } }}
             placeholder="Ask anything..." rows="1"
           ></textarea>
           {streamingMsgId || isTyping ? (
             <button className="absolute right-2 bottom-2 w-[28px] md:w-[32px] h-[28px] md:h-[32px] shrink-0 flex items-center justify-center rounded-md bg-[#27272a] light:bg-[#e5e5ee] text-[var(--prl-text)] hover:bg-[var(--prl-accent-fill)] hover:text-[var(--prl-on-accent)] transition" onClick={onStopStreaming} title="Stop generating">
               <Square className="w-3.5 h-3.5" />
             </button>
           ) : (
             <button className="absolute right-2 bottom-2 w-[28px] md:w-[32px] h-[28px] md:h-[32px] shrink-0 flex items-center justify-center rounded-md bg-[#27272a] light:bg-[#e5e5ee] text-[var(--prl-text)] hover:bg-[var(--prl-accent-fill)] hover:text-[var(--prl-on-accent)] transition disabled:opacity-50 disabled:bg-[#27272a] disabled:light:bg-[#e5e5ee]" onClick={handleSendMessage} disabled={!inputValue.trim()}>
               <Send className="w-3.5 h-3.5" />
             </button>
           )}
         </div>
       </div>
    </aside>
  );
});

export default ChatPanel;
