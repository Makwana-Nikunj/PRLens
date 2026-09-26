import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatPanel from '../Components/dashboard/ChatPanel';
import { useChat, useChatResize } from '../hooks/useChat';

const ChatInterface = () => {
    const { id: prId } = useParams();
    const [chatCollapsed, setChatCollapsed] = useState(false);
    const [chatOpenMobile, setChatOpenMobile] = useState(true);
    const isResizingRef = useRef(false);

    const chat = useChat({ prId: prId || null });
    const resize = useChatResize({ chatCollapsed, setChatCollapsed, chatOpenMobile, setChatOpenMobile, isResizingRef });

    if (!prId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b] light:bg-[#ffffff] text-[#a1a1aa] light:text-[#5d5d6a]">
                <p>Invalid chat link.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[100dvh] bg-[#09090b] light:bg-[#ffffff] text-[#E4E4E7] light:text-[#2a2a33] font-sans flex overflow-hidden">
            <main className="flex-1 min-w-0 flex flex-col bg-[#09090b] light:bg-[#ffffff]">
                <div className="flex-1 overflow-y-auto bg-[#09090b] light:bg-[#ffffff] p-4 sm:p-6 lg:p-8 scrollbar-hide">
                    <div className="max-w-[760px] mx-auto w-full flex items-center justify-center h-full">
                        <div className="text-[#ccff00]enter">
                            <h2 className="text-2xl font-bold text-[#fafafa] light:text-[#18181f] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Chat with PRLens</h2>
                            <p className="text-[14px] text-[#a1a1aa] light:text-[#5d5d6a]">Ask questions about this pull request</p>
                        </div>
                    </div>
                </div>
            </main>
            <ChatPanel
                chatCollapsed={chatCollapsed}
                chatOpenMobile={chatOpenMobile}
                chatWidth={resize.chatWidth}
                isResizingRef={isResizingRef}
                toggleChat={resize.toggleChat}
                messages={chat.messages}
                isTyping={chat.isTyping}
                streamingMsgId={chat.streamingMsgId}
                messagesEndRef={chat.messagesEndRef}
                chatInputRef={chat.chatInputRef}
                inputValue={chat.inputValue}
                autoResizeInput={chat.autoResizeInput}
                handleSendMessage={chat.handleSendMessage}
                onStopStreaming={chat.stopStreaming}
            />
            <button
                className={`fixed right-4 md:right-5 bottom-4 md:bottom-5 w-12 h-12 text-white rounded-full flex items-center justify-center z-10 transition-all duration-300 hover:bg-[#ccff00] ${resize.isReopenShown ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0 pointer-events-none'}`}
                style={{ background: '#ccff00', boxShadow: '0 8px 32px rgba(204,255,0,0.35)' }}
                onClick={() => resize.toggleChat(true)}
                title="Open chat"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h7" /></svg>
            </button>
        </div>
    );
};

export default ChatInterface;
