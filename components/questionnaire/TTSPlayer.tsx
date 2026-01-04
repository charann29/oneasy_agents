'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';

interface TTSPlayerProps {
    text: string;
    autoPlay?: boolean;
    language?: string;
    onComplete?: () => void;
    showControls?: boolean;
    className?: string;
}

export function TTSPlayer({
    text,
    autoPlay = false,
    language = 'en-US',
    onComplete,
    showControls = true,
    className = ''
}: TTSPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const hasPlayedRef = useRef(false);

    useEffect(() => {
        // Check if Speech Synthesis is supported
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSupported(false);
            return;
        }

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = isMuted ? 0 : 1;

        utterance.onstart = () => {
            setIsPlaying(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            hasPlayedRef.current = true;
            onComplete?.();
        };

        utterance.onerror = (error) => {
            console.error('TTS Error:', error);
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;

        // Auto-play if enabled and hasn't played yet
        if (autoPlay && !hasPlayedRef.current) {
            // Small delay to ensure browser allows auto-play
            const timer = setTimeout(() => {
                play();
            }, 300);
            return () => clearTimeout(timer);
        }

        // Cleanup
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [text, language, autoPlay, onComplete]);

    // Update volume when mute state changes
    useEffect(() => {
        if (utteranceRef.current) {
            utteranceRef.current.volume = isMuted ? 0 : 1;
        }
    }, [isMuted]);

    const play = () => {
        if (!utteranceRef.current || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Speak the utterance
        window.speechSynthesis.speak(utteranceRef.current);
    };

    const pause = () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const skip = () => {
        pause();
        onComplete?.();
    };

    if (!isSupported) {
        return null; // Hide if not supported
    }

    if (!showControls) {
        // Just play automatically, no UI
        return null;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4 text-gray-600" />
                ) : (
                    <Play className="w-4 h-4 text-gray-600" />
                )}
            </button>

            {/* Mute Toggle */}
            <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? (
                    <VolumeX className="w-4 h-4 text-gray-600" />
                ) : (
                    <Volume2 className="w-4 h-4 text-gray-600" />
                )}
            </button>

            {/* Skip Button */}
            <button
                onClick={skip}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Skip"
            >
                <SkipForward className="w-4 h-4 text-gray-600" />
            </button>

            {/* Speaking Indicator */}
            {isPlaying && (
                <div className="flex items-center gap-1 ml-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
            )}
        </div>
    );
}
