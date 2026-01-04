'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  isProcessing?: boolean;
  className?: string;
  autoStart?: boolean;
  onStop?: () => void;
  showLanguageSelector?: boolean;
}

export function VoiceInput({
  onTranscription,
  language = 'en-US',
  onLanguageChange,
  isProcessing = false,
  className = '',
  autoStart = false,
  onStop,
  showLanguageSelector = false
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const ignoreStopRef = useRef(false);
  const userInitiatedStopRef = useRef(false);
  const onStopRef = useRef(onStop);

  // Keep onStopRef current
  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
      setError(null);
      ignoreStopRef.current = false;
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Prioritize final, then interim
      if (finalTranscript) {
        onTranscription(finalTranscript, true);
      } else if (interimTranscript) {
        onTranscription(interimTranscript, false);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');

      // CRITICAL: Always auto-restart unless user explicitly stopped
      // This makes it truly continuous - it will never stop on its own
      if (!userInitiatedStopRef.current && ignoreStopRef.current) {
        console.log('🔄 Auto-restarting recognition (continuous mode)...');
        setTimeout(() => {
          if (recognitionRef.current && ignoreStopRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true); // Ensure UI stays in "listening" state
            } catch (e) {
              console.warn('Could not restart recognition:', e);
            }
          }
        }, 50); // Very short delay for seamless restart
      } else {
        setIsListening(false);
        console.log('🛑 Voice recognition stopped by user');

        // User stopped manually - trigger callback
        if (userInitiatedStopRef.current && onStopRef.current) {
          console.log('✋ Calling onStop callback');
          onStopRef.current();
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.log('🎤 Voice event:', event.error);

      // CRITICAL: Ignore ALL errors that would stop the mic
      // We want it to keep running no matter what
      if (event.error === 'no-speech') {
        console.log('⏸️ No speech - but keeping mic active (continuous mode)');
        // Don't set error, don't stop, just keep going
        return;
      }

      if (event.error === 'aborted') {
        console.log('⏹️ Recognition aborted (user stopped)');
        // User stopped, don't show error
        return;
      }

      if (event.error === 'audio-capture') {
        setError('Microphone error - please check permissions');
        setIsListening(false);
        ignoreStopRef.current = false;
        return;
      }

      // For any other errors, log but don't stop the mic
      console.warn('Voice error (ignoring):', event.error);
      // Keep going - mic will auto-restart via onend handler
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscription, isProcessing]);

  // Update language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Auto-start support
  useEffect(() => {
    if (autoStart && !isListening && !isProcessing && recognitionRef.current) {
      startListening();
    }
  }, [autoStart]);

  const startListening = () => {
    setError(null);
    ignoreStopRef.current = true; // Enable continuous auto-restart
    userInitiatedStopRef.current = false;
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already started or busy
      console.warn('Could not start recognition:', e);
    }
  };

  const stopListening = () => {
    ignoreStopRef.current = false; // Don't restart
    userInitiatedStopRef.current = true; // Mark as user-initiated
    recognitionRef.current?.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'not-allowed':
      case 'permission-denied':
        return 'Microphone access denied';
      case 'network':
        return 'Network error';
      default:
        return 'Voice input error';
    }
  };

  if (error && !isListening) {
    return (
      <button
        type="button"
        onClick={startListening}
        className={`flex items-center gap-2 px-3 py-2 text-red-500 bg-red-50 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors ${className}`}
        title={error}
      >
        <AlertCircle className="w-4 h-4" />
        <span>Retry Voice</span>
      </button>
    );
  }

  const languages = [
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'te-IN', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta-IN', label: 'தமிழ்', flag: '🇮🇳' },
  ];

  return (
    <div className="flex items-center gap-2">
      {showLanguageSelector && onLanguageChange && (
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isListening || isProcessing}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={isProcessing}
        className={`
                flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px]
                ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
          }
                ${className}
            `}
        title={isListening ? "Click to stop recording" : "Click to speak your answer"}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Stop</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Speak</span>
          </>
        )}
      </button>
    </div>
  );
}