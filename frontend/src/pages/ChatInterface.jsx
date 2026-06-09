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
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] text-[#A1A1AA]">
                <p>Invalid chat link.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[100dvh] bg-[#0f0f13] text-[#E4E4E7] font-sans flex overflow-hidden">
            <main className="flex-1 min-w-0 flex flex-col bg-[#0f0f13]">
                <div className="flex-1 overflow-y-auto bg-[#0b0b0f] p-4 sm:p-6 lg:p-8 scrollbar-hide">
                    <div className="max-w-[760px] mx-auto w-full flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Chat with PRLens</h2>
                            <p className="text-[14px] text-[#A1A1AA]">Ask questions about this pull request</p>
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
            />
            <button
                className={`fixed right-4 md:right-5 bottom-4 md:bottom-5 w-12 h-12 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/20 z-10 transition-all duration-300 ${resize.isReopenShown ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0 pointer-events-none'}`}
                onClick={() => resize.toggleChat(true)}
                title="Open chat"
            >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h7" /></svg>
            </button>
        </div>
    );
};

export default ChatInterface;
