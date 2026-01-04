'use client';

import { ReactNode } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TTSPlayer } from '../questionnaire/TTSPlayer';
import { getTranslation } from '@/lib/i18n/translations';

interface ChatBubbleProps {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    isFirstInGroup?: boolean;
    enableTTS?: boolean;
    ttsLanguage?: string;
    language?: string;
}

export default function ChatBubble({ role, content, timestamp, isFirstInGroup = true, enableTTS = false, ttsLanguage = 'en-US', language = 'en-US' }: ChatBubbleProps) {
    const isAssistant = role === 'assistant';
    const t = (key: any) => getTranslation(language, key);

    return (
        <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>

                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${isAssistant
                    ? 'bg-black text-white'
                    : 'bg-white border border-slate-200 text-slate-400'
                    } ${isFirstInGroup ? 'opacity-100' : 'opacity-0'}`}>
                    <User className="w-5 h-5" />
                </div>

                {/* Message Content */}
                <div className="flex flex-col">
                    {isFirstInGroup && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-1 ${isAssistant ? 'text-black' : 'text-slate-400 text-right'
                            }`}>
                            {isAssistant ? t('agentName') : t('you')}
                        </span>
                    )}

                    <div className={`relative px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isAssistant
                        ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                        : 'bg-black text-white rounded-tr-none'
                        }`}>
                        {/* Bubble Tail */}
                        {isFirstInGroup && (
                            <div className={`absolute top-0 w-3 h-3 ${isAssistant
                                ? '-left-1 bg-white border-l border-t border-slate-100 rotate-[-45deg]'
                                : '-right-1 bg-black rotate-[45deg]'
                                }`}></div>
                        )}

                        <div className="relative z-10 prose prose-sm max-w-none prose-slate">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="m-0 mb-1 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="m-0 mb-2 list-disc list-inside">{children}</ul>,
                                    ol: ({ children }) => <ol className="m-0 mb-2 list-decimal list-inside">{children}</ol>,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>

                        {/* TTS Controls for Assistant */}
                        {isAssistant && enableTTS && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                                <TTSPlayer
                                    text={content}
                                    autoPlay={isFirstInGroup}
                                    language={ttsLanguage}
                                    showControls={true}
                                />
                            </div>
                        )}

                        <div className={`mt-1.5 flex items-center gap-1 text-[9px] ${isAssistant ? 'text-slate-400' : 'text-slate-300'
                            } ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                            <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isAssistant && <CheckCircle2 className="w-2.5 h-2.5" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
