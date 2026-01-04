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
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Avatar & Name */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Abhishek CA Avatar - smaller on mobile */}
                <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-md">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                <div className="hidden sm:block">
                    <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{t('appName')}</h1>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wide">Online</p>
                    </div>
                </div>
                {/* Mobile: Just show name */}
                <span className="sm:hidden font-bold text-slate-900 text-sm">Abhishek CA</span>

                {/* New Plan - Icon on mobile, full on desktop */}
                {onReset && (
                    <>
                        <button
                            onClick={onReset}
                            className="sm:hidden w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-lg flex items-center justify-center shadow-sm"
                            title="New Plan"
                        >+</button>
                        <button
                            onClick={onReset}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow-sm"
                            title="Start new business plan"
                        >+ New Plan</button>
                    </>
                )}
            </div>

            {/* Right: Progress only on mobile, full on desktop */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Phase name - hidden on mobile */}
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('phase')}</span>
                    <span className="text-xs font-medium text-slate-600 max-w-[100px] truncate">{phaseName}</span>
                </div>

                {/* Progress bar - compact */}
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-100">
                    <div className="w-12 sm:w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">{Math.round(progress)}%</span>
                </div>

                {/* Typing indicator - minimal on mobile */}
                {isTyping && (
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-75"></span>
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce delay-150"></span>
                        </div>
                        <span className="hidden sm:inline text-[9px] font-medium text-slate-500">Typing</span>
                    </div>
                )}
            </div>
        </div>
    );
}

