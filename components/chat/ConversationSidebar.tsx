'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { chatStorageService, type ChatConversation } from '@/lib/services/chat-storage';
import { format } from 'date-fns';

interface ConversationSidebarProps {
    userId: string | null;
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
}

export default function ConversationSidebar({
    userId,
    activeConversationId,
    onSelectConversation,
    onNewConversation
}: ConversationSidebarProps) {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadConversations();
        }
    }, [userId]);

    const loadConversations = async () => {
        if (!userId) return;

        setLoading(true);
        const data = await chatStorageService.getConversations(userId);
        setConversations(data);
        setLoading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this conversation?')) return;

        await chatStorageService.deleteConversation(id);
        setConversations(prev => prev.filter(c => c.id !== id));

        if (id === activeConversationId) {
            onNewConversation();
        }
    };

    if (!userId) return null;

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <button
                    onClick={onNewConversation}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-slate-400">
                        Loading...
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No conversations yet
                    </div>
                ) : (
                    <div className="p-2">
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`
                  group p-3 rounded-lg cursor-pointer transition-all mb-1
                  ${conv.id === activeConversationId
                                        ? 'bg-slate-100 border-l-2 border-black'
                                        : 'hover:bg-slate-50'
                                    }
                `}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-slate-900 truncate">
                                            {conv.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(conv.updated_at), 'MMM d')}
                                            </span>
                                            {conv.progress > 0 && (
                                                <span className="text-xs text-slate-400">
                                                    • {conv.progress}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(conv.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
