'use client';

import { User as UserIcon, Shield, Circle, Smartphone } from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

interface ChatHeaderProps {
    progress: number;
    phaseName: string;
    isTyping?: boolean;
    onReset?: () => void;
    user?: any;
    onLogin?: () => void;
    onLogout?: () => void;
    language: string;
}

export default function ChatHeader({ progress, phaseName, isTyping, onReset, user, onLogin, onLogout, language }: ChatHeaderProps) {
    const t = (key: any) => getTranslation(language, key);

    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-6">
                {/* Abhishek CA Avatar */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg ring-2 ring-white">
                            <UserIcon className="w-7 h-7" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-lg leading-tight">{t('appName')}</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Live Interaction</p>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                {onReset && (
                    <button
                        onClick={onReset}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 hover:border-red-100"
                        title="Start a new conversation"
                    >
                        🔄 New
                    </button>
                )}


                {/* Connection Link */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="h-px w-8 bg-slate-200"></div>
                    <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-2">
                        <Shield className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Secure</span>
                    </div>
                    <div className="h-px w-8 bg-slate-200"></div>
                </div>
            </div>

            {/* Progress & Metadata */}
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('phase')}</span>
                        <span className="text-xs font-bold text-slate-700">{phaseName}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black transition-all duration-700 ease-out shadow-sm"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-black min-w-[30px]">{Math.round(progress)}%</span>
                    </div>
                </div>
                {isTyping && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-75"></span>
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-150"></span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Abhishek is typing</span>
                    </div>
                )}
            </div>
        </div>
    );
}

