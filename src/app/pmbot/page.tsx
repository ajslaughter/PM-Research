"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, RefreshCw } from "lucide-react";
import React from "react";

/**
 * Lightweight markdown renderer for bot messages.
 * Handles: **bold**, *italic*, `code`, headings, lists, and line breaks.
 */
function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listType: "ul" | "ol" | null = null;
    let key = 0;

    const flushList = () => {
        if (listItems.length > 0 && listType) {
            const Tag = listType;
            elements.push(
                <Tag key={key++} className={listType === "ul" ? "list-disc pl-5" : "list-decimal pl-5"}>
                    {listItems}
                </Tag>
            );
            listItems = [];
            listType = null;
        }
    };

    const renderInline = (str: string): React.ReactNode => {
        // Process inline markdown: **bold**, *italic*, `code`
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(str)) !== null) {
            if (match.index > lastIndex) {
                parts.push(str.slice(lastIndex, match.index));
            }
            if (match[2]) {
                parts.push(<strong key={`b${match.index}`}>{match[2]}</strong>);
            } else if (match[3]) {
                parts.push(<em key={`i${match.index}`}>{match[3]}</em>);
            } else if (match[4]) {
                parts.push(<code key={`c${match.index}`}>{match[4]}</code>);
            }
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < str.length) {
            parts.push(str.slice(lastIndex));
        }

        return parts.length === 1 ? parts[0] : parts;
    };

    for (const line of lines) {
        const trimmed = line.trim();

        // Heading
        if (trimmed.startsWith("### ")) {
            flushList();
            elements.push(<h3 key={key++}>{renderInline(trimmed.slice(4))}</h3>);
        } else if (trimmed.startsWith("## ")) {
            flushList();
            elements.push(<h2 key={key++}>{renderInline(trimmed.slice(3))}</h2>);
        } else if (trimmed.startsWith("# ")) {
            flushList();
            elements.push(<h1 key={key++}>{renderInline(trimmed.slice(2))}</h1>);
        }
        // Unordered list item
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (listType !== "ul") {
                flushList();
                listType = "ul";
            }
            listItems.push(<li key={key++}>{renderInline(trimmed.slice(2))}</li>);
        }
        // Ordered list item
        else if (/^\d+\.\s/.test(trimmed)) {
            if (listType !== "ol") {
                flushList();
                listType = "ol";
            }
            listItems.push(<li key={key++}>{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</li>);
        }
        // Horizontal rule
        else if (trimmed === "---" || trimmed === "***") {
            flushList();
            elements.push(<hr key={key++} />);
        }
        // Empty line
        else if (trimmed === "") {
            flushList();
        }
        // Regular paragraph
        else {
            flushList();
            elements.push(<p key={key++}>{renderInline(trimmed)}</p>);
        }
    }

    flushList();
    return elements;
}

function BotMessage({ content }: { content: string }) {
    const rendered = useMemo(() => renderMarkdown(content), [content]);
    return <div className="bot-prose">{rendered}</div>;
}

interface Message {
    role: "user" | "model";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "What can I do on PM Live?",
    "What's on the Defense & Intelligence watchlist?",
    "Explain the PM Score methodology",
    "What features does PM Research offer?",
];

const MAX_MESSAGES = 20;

export default function PMbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: messageText.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        // Build history for API (exclude the current message, convert to Gemini format)
        const history = messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        try {
            const response = await fetch("/api/pmbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText.trim(),
                    history,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong. Try again.");
            }

            // Create a placeholder for the bot message
            const botMessage: Message = { role: "model", content: "" };
            setMessages((prev) => [...prev, botMessage]);

            // Stream the response
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage.role === "model") {
                        lastMessage.content += chunk;
                    }
                    return updated;
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
            // Remove the empty bot message if there was an error
            setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "model" && lastMsg.content === "") {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestedQuestion = (question: string) => {
        sendMessage(question);
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        inputRef.current?.focus();
    };

    const isAtMessageLimit = messages.length >= MAX_MESSAGES;

    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] max-md:h-[calc(100vh-11rem)]">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 flex-shrink-0"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-pm-green" />
                        <span className="text-sm font-medium text-pm-muted tracking-wide">AI Research Assistant</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-pm-green">PM</span>
                        <span className="text-pm-text">bot</span>
                    </h1>
                    <p className="text-pm-muted text-sm">
                        AI-powered research assistant
                    </p>
                </motion.div>

                {/* Chat Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col pm-card overflow-hidden"
                >
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-pm-green/20 flex items-center justify-center mb-6">
                                    <Bot className="w-8 h-8 text-pm-green" />
                                </div>
                                <p className="text-pm-muted text-center mb-6 max-w-md">
                                    Ask me about PM Research&apos;s PM watchlists, sector analysis, or research methodology.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                    {SUGGESTED_QUESTIONS.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="px-3 py-2 text-sm bg-pm-charcoal border border-pm-border rounded-lg text-pm-muted hover:text-pm-text hover:border-pm-green/50 transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <AnimatePresence>
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            {message.role === "model" && (
                                                <div className="w-8 h-8 rounded-full bg-pm-green flex items-center justify-center mr-2 flex-shrink-0">
                                                    <span className="text-xs font-bold text-pm-black">PM</span>
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                                                    message.role === "user"
                                                        ? "bg-pm-green text-pm-black rounded-br-md font-medium"
                                                        : "bg-pm-charcoal border border-pm-border text-pm-text rounded-bl-md"
                                                }`}
                                            >
                                                {message.role === "model" ? (
                                                    <BotMessage content={message.content} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Typing Indicator */}
                                {isLoading && messages[messages.length - 1]?.role === "user" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-pm-green flex items-center justify-center mr-2 flex-shrink-0">
                                            <span className="text-xs font-bold text-pm-black">PM</span>
                                        </div>
                                        <div className="bg-pm-charcoal border border-pm-border rounded-2xl rounded-bl-md px-4 py-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-pm-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 bg-pm-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 bg-pm-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center"
                                    >
                                        <div className="bg-pm-red/10 border border-pm-red/30 rounded-lg px-4 py-2 text-pm-red text-sm">
                                            {error}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Message Limit Warning */}
                                {isAtMessageLimit && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center gap-3 py-4"
                                    >
                                        <p className="text-pm-muted text-sm">Session limit reached</p>
                                        <button
                                            onClick={clearChat}
                                            className="flex items-center gap-2 px-4 py-2 bg-pm-green text-pm-black rounded-lg font-medium hover:bg-pm-green-muted transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Start a new conversation
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-pm-border p-4 flex-shrink-0">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isAtMessageLimit ? "Start a new conversation..." : "Ask about watchlists, sectors, methodology..."}
                                disabled={isLoading || isAtMessageLimit}
                                className="flex-1 bg-pm-charcoal border border-pm-border rounded-lg px-4 py-3 text-pm-text placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-green/50 focus:border-pm-green/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || isAtMessageLimit}
                                className="px-4 py-3 bg-pm-green text-pm-black rounded-lg font-medium hover:bg-pm-green-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Disclaimer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-pm-muted text-xs mt-4"
                >
                    PM Bot provides educational research discussion only. Not financial advice.
                </motion.p>
            </div>
        </div>
    );
}
