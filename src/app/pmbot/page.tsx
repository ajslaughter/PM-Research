"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, RefreshCw } from "lucide-react";

interface Message {
    role: "user" | "model";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "What's in the Robotics portfolio?",
    "Explain the PM Score methodology",
    "What's the thesis behind RKLB?",
    "How are the model portfolios structured?",
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
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 flex-shrink-0"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-pm-green" />
                        <span className="text-sm font-mono text-pm-muted">AI Research Assistant</span>
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
                                    Ask me about PM Research&apos;s model portfolios, sector analysis, or research methodology.
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
                                                        ? "bg-pm-green text-pm-black rounded-br-md"
                                                        : "bg-pm-charcoal border border-pm-border text-pm-text rounded-bl-md font-mono text-sm"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
                                placeholder={isAtMessageLimit ? "Start a new conversation..." : "Ask about portfolios, sectors, methodology..."}
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
