import { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/chatService';
import { useChatStore } from '../store/chatStore';

export const RESIZE_MIN = 300;
export const RESIZE_MAX = 700;

export function useChat({ prId }) {
    const { summaryToken, loadToken, setToken } = useChatStore();
    const [messages, setMessages] = useState([
        { id: 1, who: 'ai', text: "I'm ready. Ask me anything about this PR!" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingMsgId, setStreamingMsgId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [chatError, setChatError] = useState(null);

    const chatInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const msgIdRef = useRef(2);
    const chatAbortRef = useRef(null);
    const lastFailedMessageRef = useRef('');

    useEffect(() => {
        if (prId) {
            loadToken(prId);
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
        }
        }, [prId, loadToken]);

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
        let resultingAiText = "";

        setMessages(prev => [...prev, { id: userMessageId, who: 'user', text }]);
        setInputValue('');
        if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
        setIsTyping(true);
        setChatError(null);
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
            }, summaryToken, chatAbortRef.current.signal);
            chatAbortRef.current = null;

            const sumRes = await chatService.summarize(prId, text, resultingAiText, summaryToken);
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
            scrollToEnd();
        }
    }, [inputValue, prId, summaryToken, setToken, scrollToEnd]);

    const retryLastFailed = useCallback(() => {
        const text = lastFailedMessageRef.current;
        lastFailedMessageRef.current = '';
        setChatError(null);
        setInputValue(text);
        setTimeout(() => {
            chatInputRef.current?.focus();
            handleSendMessage();
        }, 0);
    }, [handleSendMessage]);

    const autoResizeInput = useCallback((e) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }, []);

    const dismissError = useCallback(() => {
        setChatError(null);
        lastFailedMessageRef.current = '';
    }, []);

    return {
        messages,
        setMessages,
        isTyping,
        streamingMsgId,
        inputValue,
        setInputValue,
        chatError,
        setChatError,
        chatInputRef,
        messagesEndRef,
        handleSendMessage,
        autoResizeInput,
        retryLastFailed,
        dismissError,
    };
}

export function useChatResize({ chatCollapsed, setChatCollapsed, chatOpenMobile, setChatOpenMobile, isResizingRef }) {
    const [chatWidth, setChatWidth] = useState(360);

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
                if (window.innerWidth < 1024) setChatCollapsed(false);
                else setChatOpenMobile(false);
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
            clearTimeout(resizeTimer);
        };
    }, [isResizingRef, setChatCollapsed, setChatOpenMobile]);

    const toggleChat = useCallback((forceOpen) => {
        if (window.innerWidth < 1024) setChatOpenMobile(forceOpen !== undefined ? forceOpen : !chatOpenMobile);
        else setChatCollapsed(forceOpen !== undefined ? !forceOpen : !chatCollapsed);
    }, [chatCollapsed, chatOpenMobile, setChatCollapsed, setChatOpenMobile]);

    const isReopenShown = (window.innerWidth < 1024 && !chatOpenMobile) || (window.innerWidth >= 1024 && chatCollapsed);

    return { chatWidth, setChatWidth, toggleChat, isReopenShown };
}
