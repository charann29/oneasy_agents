'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, X } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    extractedData?: Record<string, any>;
}

interface ReviewChatProps {
    sessionId: string | null;
    answers: Record<string, any>;
    onAnswersUpdated: (newAnswers: Record<string, any>) => void;
    onNotesUpdated: (notes: string) => void;
}

export default function ReviewChat({ sessionId, answers, onAnswersUpdated, onNotesUpdated }: ReviewChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! 👋 I'm here to help you refine your business plan. You can:\n\n• **Ask questions** about your current answers\n• **Add more details** to any section\n• **Clarify or expand** on specific topics\n• **Get suggestions** for improvements\n\nWhat would you like to discuss?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    context: {
                        mode: 'review_refinement',
                        currentAnswers: answers,
                        sessionId,
                        instruction: `The user is reviewing their business plan answers and wants to add/modify information. 
                        Analyze their message and:
                        1. Provide helpful insights or suggestions
                        2. If they're adding new information, acknowledge it and suggest how it could enhance their plan
                        3. If they're asking a question, answer based on their existing answers
                        4. Be conversational and helpful
                        
                        After your response, if the user provided new information that should be saved, 
                        include a JSON block at the end like: ###EXTRACT###{"field_name": "value"}###END###`
                    }
                })
            });

            const data = await response.json();

            let aiContent = data.data?.synthesis || data.data?.response ||
                "I understand. Let me help you with that. Could you provide more details?";

            // Check for extracted data
            let extractedData: Record<string, any> | undefined;
            const extractMatch = aiContent.match(/###EXTRACT###([\s\S]+?)###END###/);
            if (extractMatch) {
                try {
                    extractedData = JSON.parse(extractMatch[1]);
                    aiContent = aiContent.replace(/###EXTRACT###[\s\S]+?###END###/, '').trim();

                    // Update answers with extracted data
                    if (extractedData && Object.keys(extractedData).length > 0) {
                        const updatedAnswers = { ...answers, ...extractedData };
                        onAnswersUpdated(updatedAnswers);
                    }
                } catch (e) {
                    console.error('Failed to parse extracted data:', e);
                }
            }

            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: aiContent,
                timestamp: new Date(),
                extractedData
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I apologize, but I encountered an error. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const quickPrompts = [
        "What areas need more detail?",
        "Suggest improvements for my business model",
        "Help me clarify my target market",
        "What's missing from my plan?"
    ];

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-violet-500/25 hover:scale-105 transition-all flex items-center gap-3 z-40"
            >
                <Bot className="w-6 h-6" />
                <span className="font-semibold">Chat to Add More</span>
                <Sparkles className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold">AI Assistant</span>
                </div>
                <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            {msg.extractedData && (
                                <div className="mt-2 pt-2 border-t border-green-300 text-xs text-green-700 bg-green-50 rounded-lg p-2 -mx-2 -mb-1">
                                    ✅ Information saved to your profile
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                    {quickPrompts.slice(0, 2).map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => setInput(prompt)}
                            className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full hover:bg-violet-100 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Add more details or ask a question..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
