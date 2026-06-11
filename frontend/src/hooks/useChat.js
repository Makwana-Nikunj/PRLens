import { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/chatService';

export const RESIZE_MIN = 300;
export const RESIZE_MAX = 700;

export function useChat({ prId }) {
    const [messages, setMessages] = useState([
        { id: 1, who: 'ai', text: "I'm ready. Ask me anything about this PR!" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingMsgId, setStreamingMsgId] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const chatInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const msgIdRef = useRef(2);
    const chatAbortRef = useRef(null);
    const lastFailedMessageRef = useRef('');

    useEffect(() => {
        if (!prId) return;
        chatService.getHistory(prId)
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
            .catch(() => {
                setMessages([{ id: Date.now(), who: 'ai', text: "I'm ready. Ask me anything about this PR!" }]);
            });
    }, [prId]);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, []);

    const handleSendMessage = useCallback(async () => {
        const text = inputValue.trim();
        if (!text || !prId) return;

        const aiMessageId = ++msgIdRef.current;
        const userMessageId = ++msgIdRef.current;

        let placeholderAdded = false;
        let resultingAiText = '';

        setMessages(prev => [...prev, { id: userMessageId, who: 'user', text }]);
        setInputValue('');
        if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
        setIsTyping(true);
        lastFailedMessageRef.current = '';

        try {
            chatAbortRef.current = new AbortController();
            resultingAiText = await chatService.sendMessage(prId, text, (chunk) => {
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
            }, chatAbortRef.current.signal);
            chatAbortRef.current = null;
        } catch (err) {
            console.error(err);
            const rateLimit = err?.status === 429 || /rate limit/i.test(err?.message || '');
            const message = rateLimit
                ? 'Too many requests. Please wait a moment and try again.'
                : 'Something went wrong. Please try again.';

            if (!placeholderAdded) {
                setMessages(prev => [...prev, { id: aiMessageId, who: 'ai', text: message }]);
            } else {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId
                            ? { ...msg, text: msg.text }
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
            scrollToEnd();
        }
    }, [inputValue, prId, scrollToEnd]);

    const retryLastFailed = useCallback(() => {
        const text = lastFailedMessageRef.current;
        lastFailedMessageRef.current = '';
        setInputValue(text);
        setTimeout(() => {
            chatInputRef.current?.focus();
            handleSendMessage();
        }, 0);
    }, [handleSendMessage]);

    const stopStreaming = useCallback(() => {
        if (chatAbortRef.current) {
            chatAbortRef.current.abort();
            chatAbortRef.current = null;
        }
    }, []);

    const autoResizeInput = useCallback((e) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }, []);

    return {
        messages,
        setMessages,
        isTyping,
        streamingMsgId,
        inputValue,
        setInputValue,
        chatInputRef,
        messagesEndRef,
        handleSendMessage,
        autoResizeInput,
        retryLastFailed,
        stopStreaming,
    };
}

export function useChatResize({ chatCollapsed, setChatCollapsed, chatOpenMobile, setChatOpenMobile, isResizingRef }) {
    const [chatWidth, setChatWidth] = useState(360);
    const chatCollapsedRef = useRef(chatCollapsed);
    const chatOpenMobileRef = useRef(chatOpenMobile);
    useEffect(() => { chatCollapsedRef.current = chatCollapsed; }, [chatCollapsed]);
    useEffect(() => { chatOpenMobileRef.current = chatOpenMobile; }, [chatOpenMobile]);

    const isChatOpen = window.innerWidth < 1024 ? chatOpenMobile : !chatCollapsed;

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingRef.current || window.innerWidth < 1024) return;
            const newWidth = window.innerWidth - e.clientX;
            setChatWidth(Math.max(RESIZE_MIN, Math.min(RESIZE_MAX, newWidth)));
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
                if (window.innerWidth < 1024) {
                    setChatOpenMobile(!chatCollapsedRef.current);
                    setChatCollapsed(false);
                } else {
                    setChatCollapsed(!chatOpenMobileRef.current);
                    setChatOpenMobile(false);
                }
            }, 150);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, [isResizingRef, setChatCollapsed, setChatOpenMobile]);

    const toggleChat = useCallback((forceOpen) => {
        if (window.innerWidth < 1024) {
            setChatOpenMobile(Boolean(forceOpen ?? !chatOpenMobile));
        } else {
            setChatCollapsed(Boolean(forceOpen === undefined ? !chatCollapsed : !forceOpen));
        }
    }, [chatCollapsed, chatOpenMobile, setChatCollapsed, setChatOpenMobile]);

    const isReopenShown = !isChatOpen;

    return { chatWidth, setChatWidth, toggleChat, isReopenShown };
}
