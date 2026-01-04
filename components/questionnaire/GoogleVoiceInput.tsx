'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface GoogleVoiceInputProps {
    onTranscription: (text: string, isFinal: boolean) => void;
    language?: string;
    onStop?: () => void;
    isProcessing?: boolean;
}

/**
 * Google Cloud Speech-to-Text Voice Input Component
 * IMPROVED VERSION with better audio handling and error recovery
 */
export function GoogleVoiceInput({
    onTranscription,
    language = 'en-US',
    onStop,
    isProcessing = false
}: GoogleVoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const accumulatedTranscriptRef = useRef<string>('');
    const audioChunksRef = useRef<Blob[]>([]);
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stopListening();
        };
    }, []);

    const getMimeType = useCallback(() => {
        // Try different mime types in order of preference
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
        ];

        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                console.log('[Voice] Using mime type:', mimeType);
                return mimeType;
            }
        }
        console.warn('[Voice] No supported mime types found, using default');
        return '';
    }, []);

    const startListening = useCallback(async () => {
        try {
            setError(null);
            accumulatedTranscriptRef.current = '';
            audioChunksRef.current = [];
            setCurrentTranscript('');

            // Request microphone access with optimized settings
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            if (!isMountedRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = stream;

            // Create MediaRecorder with supported mime type
            const mimeType = getMimeType();
            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = async (event) => {
                if (!isMountedRef.current) return;

                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);

                    // Create combined blob for better transcription
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });

                    // Only transcribe if we have enough audio data (at least 5KB)
                    if (audioBlob.size > 5000) {
                        await transcribeAudio(audioBlob);
                    }
                }
            };

            mediaRecorder.onerror = (event: any) => {
                console.error('[Voice] MediaRecorder error:', event.error);
                if (isMountedRef.current) {
                    setError('Recording error. Please try again.');
                    stopListening();
                }
            };

            mediaRecorder.onstop = () => {
                console.log('[Voice] MediaRecorder stopped');
            };

            // Start recording with 3-second chunks
            mediaRecorder.start(3000);
            setIsListening(true);

            console.log('[Voice] Recording started - language:', language);

        } catch (err: any) {
            console.error('[Voice] Error starting recording:', err);
            if (isMountedRef.current) {
                if (err.name === 'NotAllowedError') {
                    setError('Microphone access denied. Please allow microphone access.');
                } else if (err.name === 'NotFoundError') {
                    setError('No microphone found. Please connect a microphone.');
                } else {
                    setError(err.message || 'Failed to access microphone');
                }
            }
        }
    }, [language, getMimeType]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
                mediaRecorderRef.current.stop();
            } catch (e) {
                console.warn('[Voice] Error stopping MediaRecorder:', e);
            }
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.warn('[Voice] Error stopping track:', e);
                }
            });
            streamRef.current = null;
        }

        mediaRecorderRef.current = null;

        if (isMountedRef.current) {
            setIsListening(false);

            // Send final accumulated transcript
            if (accumulatedTranscriptRef.current) {
                onTranscription(accumulatedTranscriptRef.current, true);
            }
        }

        if (onStop) {
            onStop();
        }

        console.log('[Voice] Stopped. Final transcript:', accumulatedTranscriptRef.current);
    }, [onTranscription, onStop]);

    const transcribeAudio = async (audioBlob: Blob) => {
        if (!isMountedRef.current) return;

        try {
            setIsTranscribing(true);

            // Convert 'auto' to default language
            const effectiveLanguage = language === 'auto' ? 'en-US' : language;

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', effectiveLanguage);

            console.log('[Voice] Sending for transcription...', audioBlob.size, 'bytes');

            const response = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!isMountedRef.current) return;

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                console.error('[Voice] Transcription API error:', response.status, errorData);
                return;
            }

            const data = await response.json();

            if (data.transcription && data.transcription.trim()) {
                const newText = data.transcription.trim();

                // Replace accumulated transcript with new full transcription
                accumulatedTranscriptRef.current = newText;

                if (isMountedRef.current) {
                    setCurrentTranscript(newText);
                    onTranscription(newText, false);
                }

                console.log('[Voice] Transcribed:', newText.substring(0, 50) + '...');
            } else {
                console.log('[Voice] Empty transcription response');
            }

        } catch (err: any) {
            console.error('[Voice] Transcription error:', err);
            // Don't stop recording on transcription errors
        } finally {
            if (isMountedRef.current) {
                setIsTranscribing(false);
            }
        }
    };

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    if (error) {
        return (
            <button
                type="button"
                onClick={() => {
                    setError(null);
                    startListening();
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                title={error}
            >
                <AlertCircle className="w-4 h-4" />
                <span>Retry Voice Input</span>
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={toggleListening}
                disabled={isProcessing}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-200 shadow-md hover:shadow-lg 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                    }
                `}
                title={isListening ? "Click to stop recording" : "Click to start voice input"}
            >
                {isListening ? (
                    <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Recording</span>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </>
                ) : (
                    <>
                        <Mic className="w-4 h-4" />
                        <span>Voice Input</span>
                    </>
                )}
            </button>

            {isListening && (
                <div className="text-xs text-gray-600 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 animate-in fade-in duration-300">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Recording...</span>
                        {isTranscribing && (
                            <span className="flex items-center gap-1 text-blue-600">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Transcribing</span>
                            </span>
                        )}
                    </div>
                    <div className="italic min-h-[24px] text-gray-700">
                        {currentTranscript || <span className="text-gray-400">Speak now... (click Stop when done)</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
