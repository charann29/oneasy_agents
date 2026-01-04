'use client';

// Force dynamic rendering - don't try to statically generate at build time
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, CheckCircle2, Clock, Brain, Zap, User, Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { ALL_PHASES, Question, QuestionType, QuestionOption } from '@/lib/schemas/questions';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatBubble from '@/components/chat/ChatBubble';
import PhaseRoadmap from '@/components/chat/PhaseRoadmap';
// import { VoiceInput } from '@/components/questionnaire/VoiceInput';  // OLD - REMOVED
import { VoiceInput } from '@/components/questionnaire/VoiceInput';  // USING GOOGLE CLOUD
import { ChatInteraction } from '@/lib/utils/chat-interaction';
import { supabase } from '@/lib/supabase/client';
import AuthWrapper from '@/components/auth/AuthWrapper';
import { storeAgentActivity, storeConversationMessage } from '@/lib/services/agent-storage';



// Translation Type Definition

// Translation Type Definition
import { TRANSLATIONS, getTranslation } from '@/lib/i18n/translations';


interface Message {
    id: string;
    role: 'system' | 'user' | 'assistant';
    content: string;
    type?: QuestionType;
    options?: QuestionOption[];
    timestamp: Date;
}

interface QuestionnaireSessionData {
    id: string;
    user_id: string;
    answers: Record<string, any>;
    current_phase: number;
    current_question_index: number;
    completed_phases: number[];
    messages: any[];
    updated_at: string;
    completed: boolean;
    created_at: string;
}

interface QuestionnaireState {
    sessionId: string | null;
    currentPhase: number;
    currentQuestionIndex: number;
    answers: Record<string, any>;
    completedPhases: number[];
    aiSuggestions: Record<string, string[]>;
    autoPopulated: Record<string, any>;
    agentActivity: string[];
    messages: Message[];
}

function QuestionnaireContent() {
    const [state, setState] = useState<QuestionnaireState>({
        sessionId: null,
        currentPhase: 0,
        currentQuestionIndex: 0,
        answers: {},
        completedPhases: [],
        aiSuggestions: {},
        autoPopulated: {},
        agentActivity: [],
        messages: []
    });

    const [selectedLanguage, setSelectedLanguage] = useState('en-US');

    const t = (key: any) => getTranslation(selectedLanguage, key);


    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentAnswer, setCurrentAnswer] = useState<any>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBackgroundAnalyzing, setIsBackgroundAnalyzing] = useState(false);
    const [voiceModeEnabled, setVoiceModeEnabled] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [userInteracted, setUserInteracted] = useState(false); // Track user interaction for autoplay
    const [voicesLoaded, setVoicesLoaded] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showSkipButton, setShowSkipButton] = useState(false);
    const [debugHash, setDebugHash] = useState('Checking...');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialized = useRef(false);

    // Multi-conversation support
    interface ConversationListItem {
        id: string;
        created_at: string;
        updated_at: string;
        current_phase: number;
        answers: Record<string, any>;
        status: string;
    }
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [showConversationPicker, setShowConversationPicker] = useState(false);


    // Get current question
    const currentPhase = ALL_PHASES[state.currentPhase];
    const currentQuestion = currentPhase?.questions[state.currentQuestionIndex];

    // Calculate progress
    const totalQuestions = ALL_PHASES.reduce((sum, phase) => sum + phase.questions.length, 0);
    const answeredQuestions = Object.keys(state.answers).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    // Auth State Listener
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user ?? null);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Auth Handlers
    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/chat`
            }
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setState(prev => ({ ...prev, sessionId: null, answers: {}, messages: [] }));
        window.location.reload();
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages, isProcessing]);

    // Load voices and enable TTS autoplay after user interaction
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices();
            if (voices && voices.length > 0) {
                console.log('[TTS] Voices loaded:', voices.length);
                setVoicesLoaded(true);
            }
        };

        if ('speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;

            // Detect first user interaction to bypass autoplay policy
            const handleInteraction = () => {
                console.log('[TTS] User interaction detected, TTS autoplay enabled');
                setUserInteracted(true);
                // Try to initialize speech synthesis
                window.speechSynthesis.cancel();
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('keydown', handleInteraction);
            };

            document.addEventListener('click', handleInteraction, { once: true });
            document.addEventListener('keydown', handleInteraction, { once: true });

            return () => {
                document.removeEventListener('click', handleInteraction);
                document.removeEventListener('keydown', handleInteraction);
            };
        }
    }, []);

    // DISABLED: Proactive AI Analysis - Not helpful, Abhishek provides examples naturally now
    // useEffect(() => {
    //     if (currentQuestion && !state.aiSuggestions[currentQuestion.id] && !isProcessing && !isBackgroundAnalyzing) {
    //         const timer = setTimeout(() => {
    //             getAISuggestions(currentQuestion, '', true);
    //         }, 500);
    //         return () => clearTimeout(timer);
    //     }
    // }, [currentQuestion?.id, state.aiSuggestions, isProcessing, isBackgroundAnalyzing]);

    // Timeout Detection - Show skip button after 10 seconds
    useEffect(() => {
        if (isProcessing) {
            timeoutRef.current = setTimeout(() => {
                setShowSkipButton(true);
            }, 10000);
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShowSkipButton(false);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isProcessing]);

    // Sync language selection
    useEffect(() => {
        if (state.answers['language']) {
            console.log('[Language] Switching to:', state.answers['language']);
            setSelectedLanguage(state.answers['language']);
        }
    }, [state.answers]);

    // Debug re-renders
    useEffect(() => {
        console.log('Questionnaire State Update:', {
            phase: state.currentPhase,
            questionIdx: state.currentQuestionIndex,
            questionId: currentQuestion?.id,
            input: currentAnswer,
            processing: isProcessing
        });
    }, [state.currentPhase, state.currentQuestionIndex, currentAnswer, isProcessing, currentQuestion?.id]);


    // Supabase Persistence
    useEffect(() => {
        const saveToSupabase = async () => {
            if (!state.sessionId || Object.keys(state.answers).length === 0) return;

            try {
                const user = await supabase.auth.getUser();
                const userId = user.data.user?.id;

                if (userId) {
                    // Store COMPLETE conversation data - all columns now exist!
                    const { error } = await (supabase
                        .from('questionnaire_sessions') as any)
                        .upsert({
                            id: state.sessionId,
                            user_id: userId,
                            answers: state.answers as any,
                            current_phase: state.currentPhase,
                            current_question_index: state.currentQuestionIndex,
                            completed_phases: state.completedPhases,
                            // Store messages with serialized timestamps
                            messages: state.messages.map(m => ({
                                ...m,
                                timestamp: m.timestamp.toISOString()
                            })) as any,
                            language: selectedLanguage,
                            status: state.completedPhases.length === ALL_PHASES.length ? 'completed' : 'in_progress',
                            completed: state.completedPhases.length === ALL_PHASES.length,
                            updated_at: new Date().toISOString()
                        });

                    if (error) throw error;
                    console.log('[SUPABASE] Saved progress');
                }
            } catch (err) {
                console.error('[SUPABASE] Save error:', err);
            }
        };

        const timeoutId = setTimeout(saveToSupabase, 1000);
        return () => clearTimeout(timeoutId);

    }, [state.answers, state.messages, state.currentPhase, state.currentQuestionIndex, state.completedPhases, state.sessionId]);

    // Initialize session from Supabase DB ONLY
    useEffect(() => {
        if (state.sessionId || isInitialized.current) {
            return;
        }

        const initSession = async () => {
            let sessionId = null;
            let restoredState: Partial<QuestionnaireState> = {};

            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    console.log('[SUPABASE] No authenticated user, waiting for auth...');
                    return;
                }

                // Only mark as initialized AFTER we confirm user is authenticated
                // This fixes the race condition where early return prevented re-initialization
                isInitialized.current = true;

                // Try to find existing active session in DB
                const { data: existingSession, error: fetchError } = await (supabase
                    .from('questionnaire_sessions') as any)
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'in_progress')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle() as { data: QuestionnaireSessionData | null; error: any };

                if (existingSession && !fetchError) {
                    // Restore existing session from DB
                    console.log('[SUPABASE] Restoring session from DB:', existingSession.id);
                    sessionId = existingSession.id;
                    restoredState = {
                        answers: (existingSession.answers as Record<string, any>) || {},
                        currentPhase: existingSession.current_phase ?? 0,
                        currentQuestionIndex: existingSession.current_question_index ?? 0,
                        completedPhases: existingSession.completed_phases || []
                    };

                    // Restore messages with proper Date conversion
                    if (existingSession.messages && Array.isArray(existingSession.messages)) {
                        restoredState.messages = existingSession.messages.map((m: any) => ({
                            ...m,
                            timestamp: new Date(m.timestamp || Date.now())
                        }));
                    }

                    // Set language from answers if available
                    if (restoredState.answers?.language) {
                        setSelectedLanguage(restoredState.answers.language);
                    }

                    setState(prev => ({
                        ...prev,
                        sessionId: sessionId!,
                        ...restoredState
                    }));

                    // Only add welcome if no messages exist
                    if (!restoredState.messages || restoredState.messages.length === 0) {
                        await addWelcomeMessage();
                    }

                } else {
                    // Create NEW session in DB
                    console.log('[SUPABASE] Creating new session in DB for user:', user.id);

                    const { data: newSession, error: insertError } = await (supabase
                        .from('questionnaire_sessions') as any)
                        .insert({
                            user_id: user.id,
                            current_phase: 0,
                            current_question_index: 0,
                            status: 'in_progress',
                            completed: false,
                            completed_phases: [],
                            answers: {},
                            messages: [],
                            language: selectedLanguage
                        })
                        .select()
                        .single() as { data: QuestionnaireSessionData | null; error: any };


                    if (insertError || !newSession) {
                        console.error('[SUPABASE] Failed to create session:', insertError);
                        return;
                    }

                    console.log('[SUPABASE] Created new session:', newSession.id);
                    setState(prev => ({
                        ...prev,
                        sessionId: newSession.id,
                        currentPhase: 0,
                        currentQuestionIndex: 0,
                        answers: {},
                        messages: [],
                        completedPhases: []
                    }));

                    await addWelcomeMessage();
                }
            } catch (err) {
                console.error('[SUPABASE] Session init error:', err);
            }
        };

        initSession();
    }, [user]);

    // Load all conversations for the user (for multi-conversation support)
    const loadConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase
                .from('questionnaire_sessions') as any)
                .select('id, created_at, updated_at, current_phase, answers, status')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('[MULTI-CONVO] Error loading conversations:', error);
                return;
            }

            console.log('[MULTI-CONVO] Loaded conversations:', data?.length);
            setConversations(data || []);
        } catch (err) {
            console.error('[MULTI-CONVO] Error:', err);
        }
    };

    // Switch to a different conversation
    const switchConversation = async (sessionId: string) => {
        try {
            console.log('[MULTI-CONVO] Switching to conversation:', sessionId);

            const { data, error } = await (supabase
                .from('questionnaire_sessions') as any)
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error || !data) {
                console.error('[MULTI-CONVO] Error loading conversation:', error);
                return;
            }

            // Restore the conversation state
            setState(prev => ({
                ...prev,
                sessionId: data.id,
                currentPhase: data.current_phase ?? 0,
                currentQuestionIndex: data.current_question_index ?? 0,
                completedPhases: data.completed_phases || [],
                answers: data.answers || {},
                messages: (data.messages || []).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp || Date.now())
                }))
            }));

            // Set language from answers
            if (data.answers?.language) {
                setSelectedLanguage(data.answers.language);
            }

            setShowConversationPicker(false);
            console.log('[MULTI-CONVO] Switched to conversation:', sessionId);
        } catch (err) {
            console.error('[MULTI-CONVO] Switch error:', err);
        }
    };

    // Start a NEW conversation (preserving old ones)
    const startNewConversation = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            console.log('[MULTI-CONVO] Starting new conversation for user:', user.id);

            // Create new session in database
            const { data: newSession, error } = await (supabase
                .from('questionnaire_sessions') as any)
                .insert({
                    user_id: user.id,
                    current_phase: 0,
                    current_question_index: 0,
                    status: 'in_progress',
                    completed: false,
                    completed_phases: [],
                    answers: {},
                    messages: [],
                    language: 'en-US'
                })
                .select()
                .single();

            if (error || !newSession) {
                console.error('[MULTI-CONVO] Failed to create new conversation:', error);
                return;
            }

            // Reset state to fresh conversation
            setState(prev => ({
                ...prev,
                sessionId: newSession.id,
                currentPhase: 0,
                currentQuestionIndex: 0,
                completedPhases: [],
                answers: {},
                messages: [],
                aiSuggestions: {},
                agentActivity: []
            }));

            setSelectedLanguage('en-US');
            setShowConversationPicker(false);
            await addWelcomeMessage();

            // Reload conversation list
            await loadConversations();

            console.log('[MULTI-CONVO] Created new conversation:', newSession.id);
        } catch (err) {
            console.error('[MULTI-CONVO] Error creating new conversation:', err);
        }
    };

    // Delete a conversation
    const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent switching to this conversation

        const convName = conversations.find(c => c.id === sessionId)?.answers?.business_name || 'this conversation';
        if (!confirm(`Delete "${convName}"? This cannot be undone.`)) {
            return;
        }

        try {
            console.log('[MULTI-CONVO] Deleting conversation:', sessionId);

            const { error } = await (supabase
                .from('questionnaire_sessions') as any)
                .delete()
                .eq('id', sessionId);

            if (error) {
                console.error('[MULTI-CONVO] Delete error:', error);
                alert('Failed to delete conversation');
                return;
            }

            // If we deleted the current conversation, switch to another or create new
            if (state.sessionId === sessionId) {
                const remaining = conversations.filter(c => c.id !== sessionId);
                if (remaining.length > 0) {
                    await switchConversation(remaining[0].id);
                } else {
                    await startNewConversation();
                }
            }

            // Reload conversation list
            await loadConversations();
            console.log('[MULTI-CONVO] Deleted conversation:', sessionId);
        } catch (err) {
            console.error('[MULTI-CONVO] Delete error:', err);
        }
    };

    // Rename a conversation
    const renameConversation = async (sessionId: string, newName: string) => {
        try {
            console.log('[MULTI-CONVO] Renaming conversation:', sessionId, 'to:', newName);

            // Get current answers
            const conv = conversations.find(c => c.id === sessionId);
            const updatedAnswers = { ...(conv?.answers || {}), business_name: newName };

            const { error } = await (supabase
                .from('questionnaire_sessions') as any)
                .update({ answers: updatedAnswers })
                .eq('id', sessionId);

            if (error) {
                console.error('[MULTI-CONVO] Rename error:', error);
                return;
            }

            // Update current state if it's the active conversation
            if (state.sessionId === sessionId) {
                setState(prev => ({
                    ...prev,
                    answers: { ...prev.answers, business_name: newName }
                }));
            }

            // Reload conversation list
            await loadConversations();
            console.log('[MULTI-CONVO] Renamed conversation:', sessionId);
        } catch (err) {
            console.error('[MULTI-CONVO] Rename error:', err);
        }
    };

    // Load conversations when user is authenticated
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const restoreFromLocal = (backup: any) => {
        console.log('[RESTORE] Restoring from local backup...');

        let restoredMessages: Message[] = [];

        if (backup.messages && backup.messages.length > 0) {
            console.log('[RESTORE] Using backed up messages:', backup.messages.length);
            restoredMessages = backup.messages.map((msg: any) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }));
        } else {
            console.log('[RESTORE] No messages in backup, reconstructing...');
            restoredMessages.push({
                id: 'welcome',
                role: 'assistant',
                content: ChatInteraction.getPersonalizedWelcome(),
                timestamp: new Date(backup.timestamp || new Date())
            });
            reconstructMessages(backup.answers, restoredMessages);
        }

        setState(prev => ({
            ...prev,
            sessionId: backup.sessionId,
            answers: backup.answers,
            currentPhase: backup.currentPhase,
            currentQuestionIndex: backup.currentQuestionIndex,
            completedPhases: backup.completedPhases || [],
            messages: restoredMessages
        }));

        console.log('[RESTORE] Restored state:', {
            messages: restoredMessages.length,
            answers: Object.keys(backup.answers).length,
            phase: backup.currentPhase,
            question: backup.currentQuestionIndex
        });
    };

    const reconstructMessages = (answers: Record<string, any>, messagesList: Message[]) => {
        let lastQIndex = 0;
        let lastPhaseIdx = 0;

        for (let pIdx = 0; pIdx < ALL_PHASES.length; pIdx++) {
            const phase = ALL_PHASES[pIdx];
            for (let qIdx = 0; qIdx < phase.questions.length; qIdx++) {
                const q = phase.questions[qIdx];
                const answer = answers[q.id];

                if (answer !== undefined) {
                    messagesList.push({
                        id: q.id,
                        role: 'assistant',
                        content: ChatInteraction.getConversationalQuestion(q, qIdx === 0, phase.name, answers?.['user_name']),
                        type: q.type,
                        options: q.options,
                        timestamp: new Date()
                    });

                    messagesList.push({
                        id: `ans-${q.id}`,
                        role: 'user',
                        content: typeof answer === 'string' ? answer : JSON.stringify(answer),
                        timestamp: new Date()
                    });

                    lastPhaseIdx = pIdx;
                    lastQIndex = qIdx + 1;
                } else {
                    if (pIdx === lastPhaseIdx && qIdx >= lastQIndex) {
                        messagesList.push({
                            id: q.id,
                            role: 'assistant',
                            content: ChatInteraction.getConversationalQuestion(q, qIdx === 0, phase.name, answers?.['user_name']),
                            type: q.type,
                            options: q.options,
                            timestamp: new Date()
                        });
                        break;
                    }
                }
            }
            if (messagesList.length > 0 && messagesList[messagesList.length - 1].role !== 'assistant') break;
        }
    };

    const addWelcomeMessage = async () => {
        // Simple welcome - no agents needed for onboarding
        const welcomeMsg: Message = {
            id: 'welcome',
            role: 'assistant',
            content: "\ud83d\udc4b Let's build your business plan! I'll guide you through a series of questions. Answer naturally - I'll help you refine your ideas along the way.",
            timestamp: new Date()
        };

        // Manually add the first question (Language)
        const firstQ = ALL_PHASES[0].questions[0];
        const questionMsg: Message = {
            id: firstQ.id,
            role: 'assistant',
            content: "First, which language would you like to take this conversation in?",
            type: firstQ.type,
            options: firstQ.options,
            timestamp: new Date(Date.now() + 100) // Slight delay for ordering
        };

        setState(prev => ({ ...prev, messages: [welcomeMsg, questionMsg] }));
    };

    const initializeSession = async () => {
        try {
            const response = await fetch('/api/session/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Anonymous',
                    email: 'temp@example.com',
                    channel: 'questionnaire'
                })
            });

            const data = await response.json();
            if (data.success) {
                setState(prev => ({ ...prev, sessionId: data.sessionId }));
            }
        } catch (error) {
            console.error('Failed to initialize session:', error);
        }
    };

    const restoreSession = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/session/${sessionId}`);
            const data = await response.json();

            if (data.success && data.session) {
                const restoredAnswers = data.session.answers || {};
                const restoredMessages: Message[] = [];

                restoredMessages.push({
                    id: 'welcome',
                    role: 'assistant',
                    content: ChatInteraction.getPersonalizedWelcome(),
                    timestamp: new Date(data.session.created_at)
                });

                let lastQIndex = 0;
                let lastPhaseIdx = 0;

                for (let pIdx = 0; pIdx < ALL_PHASES.length; pIdx++) {
                    const phase = ALL_PHASES[pIdx];
                    for (let qIdx = 0; qIdx < phase.questions.length; qIdx++) {
                        const q = phase.questions[qIdx];
                        const answer = restoredAnswers[q.id];

                        if (answer !== undefined) {
                            const conversationalText = ChatInteraction.getConversationalQuestion(q, qIdx === 0, phase.name, restoredAnswers?.['user_name']);
                            restoredMessages.push({
                                id: q.id,
                                role: 'assistant',
                                content: conversationalText,
                                type: q.type,
                                options: q.options,
                                timestamp: new Date()
                            });

                            restoredMessages.push({
                                id: `ans-${q.id}`,
                                role: 'user',
                                content: typeof answer === 'string' ? answer : JSON.stringify(answer),
                                timestamp: new Date()
                            });

                            lastPhaseIdx = pIdx;
                            lastQIndex = qIdx + 1;
                        } else {
                            if (pIdx === lastPhaseIdx && qIdx >= lastQIndex) {
                                const conversationalText = ChatInteraction.getConversationalQuestion(q, qIdx === 0, phase.name, restoredAnswers?.['user_name']);
                                restoredMessages.push({
                                    id: q.id,
                                    role: 'assistant',
                                    content: conversationalText,
                                    type: q.type,
                                    options: q.options,
                                    timestamp: new Date()
                                });
                                break;
                            }
                        }
                    }
                    if (restoredMessages.length > 0 && restoredMessages[restoredMessages.length - 1].role !== 'assistant') break;
                }

                if (lastQIndex >= ALL_PHASES[lastPhaseIdx].questions.length) {
                    lastPhaseIdx++;
                    lastQIndex = 0;
                    if (lastPhaseIdx < ALL_PHASES.length) {
                        const nextQ = ALL_PHASES[lastPhaseIdx].questions[0];
                        const conversationalText = ChatInteraction.getConversationalQuestion(nextQ, true, ALL_PHASES[lastPhaseIdx].name, restoredAnswers?.['user_name']);
                        restoredMessages.push({
                            id: nextQ.id,
                            role: 'assistant',
                            content: conversationalText,
                            type: nextQ.type,
                            options: nextQ.options,
                            timestamp: new Date()
                        });
                    }
                }

                setState(prev => ({
                    ...prev,
                    sessionId: sessionId,
                    answers: restoredAnswers,
                    currentPhase: lastPhaseIdx,
                    currentQuestionIndex: lastQIndex,
                    messages: restoredMessages
                }));

            } else {
                initializeSession();
                addWelcomeMessage();
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            initializeSession();
            addWelcomeMessage();
        }
    };

    const handleExplainQuestion = async (question: Question) => {
        if (state.currentPhase === 0) return;

        setIsProcessing(true);
        setState(prev => ({ ...prev, agentActivity: ['Explaining question...'] }));

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Question: "${question.question}"
Context: ${question.placeholder || ''}

Please explain this question in simple layman terms. Why is it asking this? Provide 1 simple example to clarify. Keep your explanation short, conversational, and helpful (max 3 sentences).`,
                    context: {
                        questionId: question.id,
                        questionType: question.type,
                        currentPhase: state.currentPhase,
                        phaseName: ALL_PHASES[state.currentPhase]?.name,
                        allAnswers: state.answers,
                        requireAgents: true,
                        mcpTrigger: 'explain_question',
                        requestType: 'explanation'
                    }
                })
            });

            const result = await response.json();

            if (result.data) {
                // Add explanation as an assistant message
                const explanationMsg: Message = {
                    id: `explain-${Date.now()}`,
                    role: 'assistant',
                    content: result.data.synthesis || "I can't explain this right now.",
                    timestamp: new Date()
                };
                setState(prev => ({
                    ...prev,
                    messages: [...prev.messages, explanationMsg],
                    agentActivity: []
                }));
            }
        } catch (error) {
            console.error('Explanation error:', error);
            setState(prev => ({ ...prev, agentActivity: [] }));
        } finally {
            setIsProcessing(false);
        }
    };

    const getAISuggestions = async (question: Question, partialAnswer: string, isBackground: boolean = false) => {
        // Phase 1 (index 0) doesn't need AI suggestions - just basic info collection
        if (state.currentPhase === 0) {
            return; // Skip for onboarding questions
        }

        if (isBackground) {
            setIsBackgroundAnalyzing(true);
        } else {
            setIsProcessing(true);
            setState(prev => ({ ...prev, agentActivity: ['Analyzing your input...'] }));
        }

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Question: ${question.question}
User's current answer: ${partialAnswer || 'Not provided yet'}
Question Type: ${question.type}
Phase: ${ALL_PHASES[state.currentPhase]?.name || 'Unknown'}
Question Context: ${question.placeholder || ''}

Analyze this question and provide 3-4 short, specific options or ideas as bullet points. Format each idea with a bullet point (-). Keep them concise (under 5 words).`,
                    context: {
                        questionId: question.id,
                        questionType: question.type,
                        currentPhase: state.currentPhase,
                        phaseName: ALL_PHASES[state.currentPhase]?.name,
                        allAnswers: state.answers,
                        requireAgents: true,
                        mcpTrigger: question.mcp_trigger || 'comprehensive_analysis',
                        requestType: 'suggestion'
                    }
                })
            });

            const result = await response.json();

            if (result.data) {
                const suggestions = extractSuggestions(result.data.synthesis);
                setState(prev => ({
                    ...prev,
                    aiSuggestions: { ...prev.aiSuggestions, [question.id]: suggestions },
                    agentActivity: result.data.agent_outputs?.map((a: any) => a.agent_name) || []
                }));
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('AI suggestion error:', error);
        } finally {
            if (isBackground) {
                setIsBackgroundAnalyzing(false);
            } else {
                setIsProcessing(false);
                if (!state.aiSuggestions[question.id]) {
                    setState(prev => ({ ...prev, agentActivity: [] }));
                }
            }
        }
    };

    const extractSuggestions = (synthesis: string): string[] => {
        const lines = synthesis.split('\n');
        return lines
            .filter(line => line.trim().match(/^[-•*\d.]/))
            .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
            .filter(line => line.length > 0)
            .slice(0, 5);
    };

    const validateAnswer = (question: Question, answer: any): string | null => {
        if (!question.required && (!answer || answer === '')) {
            return null;
        }

        if (question.required && (!answer || (typeof answer === 'string' && answer.trim() === ''))) {
            return 'This field is required';
        }

        if (question.type === QuestionType.EMAIL && answer) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(answer)) {
                return 'Please enter a valid email address';
            }
        }

        if (question.type === QuestionType.PHONE && answer) {
            const phoneRegex = /^[+]?[\d\s-()]+$/;
            if (!phoneRegex.test(answer)) {
                return 'Please enter a valid phone number';
            }
        }

        if (question.type === QuestionType.URL && answer) {
            try {
                new URL(answer);
            } catch (_urlError) {
                return 'Please enter a valid URL';
            }
        }

        return null;
    };

    const handleSubmitAnswer = async () => {
        // Stop any active TTS when user submits
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        if (isProcessing || !currentQuestion) return;

        const error = validateAnswer(currentQuestion, currentAnswer);
        if (error) {
            setValidationError(error);
            const errorMsg: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Hmm, that doesn't look quite right. ${error}`,
                timestamp: new Date()
            };
            setState(prev => ({ ...prev, messages: [...prev.messages, errorMsg] }));
            return;
        }

        setValidationError(null);
        setIsProcessing(true);

        const userMsg: Message = {
            id: `ans-${currentQuestion.id}`,
            role: 'user',
            content: typeof currentAnswer === 'string' ? currentAnswer : JSON.stringify(currentAnswer),
            timestamp: new Date()
        };

        const newAnswers = { ...state.answers, [currentQuestion.id]: currentAnswer };
        const newMessages = [...state.messages, userMsg];

        setState(prev => ({
            ...prev,
            answers: newAnswers,
            messages: newMessages
        }));

        if (currentQuestion.mcp_trigger) {
            await getAISuggestions(currentQuestion, currentAnswer);
        }


        const skills = ChatInteraction.getAgentSkillsForPhase(currentPhase.name);

        setIsProcessing(true);
        setState(prev => ({
            ...prev,
            agentActivity: [skills[0]]
        }));

        let skillIdx = 1;
        const skillInterval = setInterval(() => {
            if (skillIdx < skills.length) {
                setState(prev => ({ ...prev, agentActivity: [skills[skillIdx]] }));
                skillIdx++;
            } else {
                skillIdx = 0;
            }
        }, 1200);

        try {
            let nextQuestionToAsk = null;
            let nextIdx = state.currentQuestionIndex + 1;
            let nextPhaseIdx = state.currentPhase;

            while (!nextQuestionToAsk) {
                if (nextIdx >= (ALL_PHASES[nextPhaseIdx]?.questions.length || 0)) {
                    nextPhaseIdx++;
                    nextIdx = 0;
                    if (nextPhaseIdx >= ALL_PHASES.length) break;
                }

                const potentialNext = ALL_PHASES[nextPhaseIdx]?.questions[nextIdx];
                if (potentialNext && evaluateCondition(potentialNext.condition, newAnswers)) {
                    nextQuestionToAsk = {
                        question: potentialNext.question,
                        type: potentialNext.type,
                        options: potentialNext.options
                    };
                    break;
                }
                nextIdx++;
            }

            // PHASE 1 (index 0) = Simple info collection - NOW routing through Orchestrator for Translation!
            // Optimization removed to support multi-language responses.

            const discussionLanguage = newAnswers.language || state.answers.language || selectedLanguage || 'en-US';

            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: typeof currentAnswer === 'string' ? currentAnswer : JSON.stringify(currentAnswer),
                    context: {
                        currentPhase: currentPhase.name,
                        currentQuestion: currentQuestion.question,
                        questionType: currentQuestion.type,
                        questionId: currentQuestion.id,
                        allAnswers: newAnswers,
                        language: discussionLanguage,
                        userName: newAnswers.user_name || state.answers.user_name,
                        phaseProgress: `${state.currentQuestionIndex + 1}/${currentPhase.questions.length}`,
                        nextQuestion: nextQuestionToAsk
                    }
                })
            });

            const data = await response.json();

            clearInterval(skillInterval);

            if (data.success && data.data) {
                const agentOutputs = data.data.agent_outputs || [];
                const synthesis = data.data.synthesis || '';

                const agentNames = agentOutputs.map((a: any) => a.agent_name);
                console.log('[Orchestrator] Agents used:', agentNames);
                console.log('[Orchestrator] Synthesis:', synthesis);

                // PERSIST AGENT WORK TO DB
                if (state.sessionId && agentOutputs.length > 0) {
                    // Store agent activity logs
                    storeAgentActivity(state.sessionId, currentAnswer, agentOutputs)
                        .then(success => {
                            if (success) console.log('[Storage] Agent activity saved');
                        })
                        .catch(err => console.error('[Storage] Failed to save agent activity:', err));

                    // Store user message with context
                    storeConversationMessage({
                        session_id: state.sessionId,
                        role: 'user',
                        content: currentAnswer,
                        question_id: currentQuestion?.id,
                        phase_name: currentPhase?.name,
                    }).catch(err => console.error('[Storage] Failed to save user message:', err));

                    // Store assistant response with agent outputs
                    storeConversationMessage({
                        session_id: state.sessionId,
                        role: 'assistant',
                        content: synthesis,
                        question_id: currentQuestion?.id,
                        phase_name: currentPhase?.name,
                        agent_outputs: agentOutputs,
                    }).catch(err => console.error('[Storage] Failed to save assistant message:', err));
                }

                setState(prev => ({
                    ...prev,
                    agentActivity: agentNames.slice(0, 3)
                }));

                const agentMessage = synthesis;

                console.log('[DEBUG] Agent message to use:', agentMessage ? agentMessage.substring(0, 100) : 'EMPTY');

                setTimeout(() => {
                    moveToNextQuestion(newAnswers, newMessages, agentMessage);
                    setCurrentAnswer('');
                    setShowSuggestions(false);
                    setIsProcessing(false);
                    setState(prev => ({ ...prev, agentActivity: [] }));
                }, 1500);

            } else {
                console.error('Orchestrator Error:', data.error);
                clearInterval(skillInterval);
                setIsProcessing(false);
                setCurrentAnswer('');
                setState(prev => ({ ...prev, agentActivity: [] }));
                moveToNextQuestion(newAnswers, newMessages);
            }

        } catch (error) {
            console.error('Orchestrator Error:', error);
            clearInterval(skillInterval);
            setIsProcessing(false);
            setCurrentAnswer('');
            setState(prev => ({ ...prev, agentActivity: [] }));
            moveToNextQuestion(newAnswers, newMessages);
        }
    };

    const evaluateCondition = (condition: string | undefined, context: any): boolean => {
        if (!condition) return true;
        try {
            const jsCondition = condition.replace(/([a-zA-Z0-9_.]+)\s+in\s+(\[[^\]]+\])/g, "$2.includes($1)");

            const func = new Function('context', `try { return ${jsCondition}; } catch(e) { return false; }`);
            return func(context);
        } catch (e) {
            console.error('Condition evaluation failed:', condition, e);
            return true;
        }
    };

    const moveToNextQuestion = (newAnswers: Record<string, any>, newMessages: Message[], agentMessage?: string) => {
        let nextIndex = state.currentQuestionIndex + 1;
        let nextPhaseIdx = state.currentPhase;

        while (true) {
            let nextQuestionIdx = nextIndex;

            if (nextIndex >= (ALL_PHASES[nextPhaseIdx]?.questions.length || 0)) {
                nextPhaseIdx++;
                nextIndex = 0;
                nextQuestionIdx = 0;

                if (nextPhaseIdx >= ALL_PHASES.length) {
                    handleComplete();
                    return;
                }
            }

            const nextQuestion = ALL_PHASES[nextPhaseIdx].questions[nextQuestionIdx];

            if (evaluateCondition(nextQuestion.condition, newAnswers)) {
                const isFirstInPhase = nextPhaseIdx > state.currentPhase && nextQuestionIdx === 0;

                const conversationalText = agentMessage || nextQuestion.question;

                console.log('[DEBUG] Using conversational text:', conversationalText ? conversationalText.substring(0, 100) : 'EMPTY');
                console.log('[DEBUG] Source:', agentMessage ? 'ORCHESTRATOR' : 'FALLBACK');

                const nextMsg: Message = {
                    id: nextQuestion.id,
                    role: 'assistant',
                    content: conversationalText,
                    type: nextQuestion.type,
                    options: nextQuestion.options,
                    timestamp: new Date()
                };

                setState(prev => ({
                    ...prev,
                    currentPhase: nextPhaseIdx,
                    currentQuestionIndex: nextQuestionIdx,
                    completedPhases: nextPhaseIdx > prev.currentPhase ? [...prev.completedPhases, prev.currentPhase] : prev.completedPhases,
                    messages: [...newMessages, nextMsg]
                }));
                return;
            }

            nextIndex++;
        }
    };

    const speak = useCallback(async (text: string, languageCode?: string) => {
        console.log('[TTS] speak() called', { textLength: text.length, languageCode, userInteracted });

        if (!ttsEnabled) {
            console.log('[TTS] TTS disabled, skipping');
            return;
        }
        if (!userInteracted) {
            console.warn('[TTS] Waiting for user interaction to enable autoplay');
            return;
        }

        try {
            const lang = languageCode || selectedLanguage || 'en-US';
            console.log('[TTS] Using Google Cloud TTS with language:', lang);

            // Call our Google Cloud TTS API
            const response = await fetch('/api/voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: lang }),
            });

            if (!response.ok) {
                console.error('[TTS] API error:', response.status);
                // Fallback to browser TTS
                fallbackBrowserTTS(text, lang);
                return;
            }

            const { audioContent } = await response.json();

            if (!audioContent) {
                console.warn('[TTS] No audio content, falling back to browser TTS');
                fallbackBrowserTTS(text, lang);
                return;
            }

            // Play the audio
            const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
            audio.playbackRate = 1.0;

            audio.onplay = () => console.log('[TTS] Playing Google Cloud TTS audio');
            audio.onerror = (e) => {
                console.error('[TTS] Audio playback error:', e);
                fallbackBrowserTTS(text, lang);
            };

            await audio.play();
            console.log('[TTS] Google Cloud TTS speech started');

        } catch (error) {
            console.error('[TTS] Google TTS error, falling back to browser:', error);
            fallbackBrowserTTS(text, languageCode || selectedLanguage || 'en-US');
        }
    }, [ttsEnabled, selectedLanguage, userInteracted]);

    // Fallback to browser TTS if Google Cloud fails
    const fallbackBrowserTTS = (text: string, lang: string) => {
        if (!('speechSynthesis' in window)) {
            console.error('[TTS] Browser speechSynthesis not supported');
            return;
        }

        console.log('[TTS] Using browser fallback for:', lang);
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    const handleVoiceTranscription = (text: string, isFinal: boolean) => {
        const currentText = typeof currentAnswer === 'string' ? currentAnswer : '';

        if (isFinal) {
            const newText = currentText ? `${currentText} ${text} ` : text;
            setCurrentAnswer(newText);
        }
    };

    // Auto-speak AI responses only (not static questions)
    // The AI response already includes the question in a conversational way
    useEffect(() => {
        console.log('[TTS] Effect triggered', {
            ttsEnabled,
            messagesLength: state.messages.length,
            selectedLanguage
        });

        if (ttsEnabled && state.messages.length > 0) {
            const lastMsg = state.messages[state.messages.length - 1];
            console.log('[TTS] Last message:', {
                role: lastMsg.role,
                contentPreview: lastMsg.content.substring(0, 50)
            });

            if (lastMsg.role === 'assistant') {
                console.log('[TTS] Triggering speak for assistant message');
                // Small delay to ensure content is ready
                const timer = setTimeout(() => {
                    speak(lastMsg.content, selectedLanguage);
                }, 500);
                return () => clearTimeout(timer);
            }
        } else {
            console.log('[TTS] Not triggering:', { ttsEnabled, messagesLength: state.messages.length });
        }
    }, [state.messages.length, ttsEnabled, selectedLanguage, speak]);

    const handleReset = async () => {
        if (confirm('Are you sure you want to start over? This will clear all your answers.')) {
            try {
                // Mark current session as abandoned in Supabase so initSession creates a new one
                if (state.sessionId) {
                    await (supabase
                        .from('questionnaire_sessions') as any)
                        .update({ status: 'abandoned' })
                        .eq('id', state.sessionId);
                }

                setState({
                    sessionId: null,
                    currentPhase: 0,
                    currentQuestionIndex: 0,
                    answers: {},
                    completedPhases: [],
                    aiSuggestions: {},
                    autoPopulated: {},
                    agentActivity: [],
                    messages: []
                });

                isInitialized.current = false;

                window.location.reload();
            } catch (error) {
                console.error('Reset error:', error);
                window.location.reload();
            }
        }
    };

    const moveToPreviousQuestion = () => {

        if (state.currentQuestionIndex > 0) {
            setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }));
        } else if (state.currentPhase > 0) {
            const prevPhase = state.currentPhase - 1;
            const prevPhaseLength = ALL_PHASES[prevPhase].questions.length;
            setState(prev => ({
                ...prev,
                currentPhase: prevPhase,
                currentQuestionIndex: prevPhaseLength - 1
            }));
        }
    };

    const handleComplete = () => {
        const completionMsg: Message = {
            id: 'complete',
            role: 'assistant',
            content: "🎉 Excellent! You've completed all 147 questions across 11 phases. Now let's generate your professional business planning documents!",
            timestamp: new Date()
        };
        setState(prev => ({ ...prev, messages: [...prev.messages, completionMsg] }));

        setTimeout(() => {
            window.location.href = '/complete';
        }, 2000);
    };

    const renderInput = () => {
        if (!currentQuestion) return null;

        const commonClasses = "flex-1 px-5 py-3 border-2 border-transparent rounded-[1.5rem] focus:outline-none focus:border-blue-500/30 transition-all bg-slate-50/50 text-slate-900 placeholder:text-slate-400 font-medium";


        switch (currentQuestion.type) {
            case QuestionType.PERCENTAGE_BREAKDOWN: {
                // Ensure currentAnswer is array
                const items = Array.isArray(currentAnswer) ? currentAnswer : [{ percent: '', source: '' }];

                const updateItem = (index: number, field: string, value: string) => {
                    const newItems = [...items];
                    newItems[index] = { ...newItems[index], [field]: value };
                    setCurrentAnswer(newItems);
                };

                const addItem = () => {
                    setCurrentAnswer([...items, { percent: '', source: '' }]);
                };

                const removeItem = (index: number) => {
                    if (items.length > 1) {
                        const newItems = items.filter((_: any, i: number) => i !== index);
                        setCurrentAnswer(newItems);
                    }
                };

                return (
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                            {items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="relative w-24 sm:w-32 shrink-0">
                                        <input
                                            type="number"
                                            value={item.percent}
                                            onChange={(e) => updateItem(idx, 'percent', e.target.value)}
                                            placeholder="%"
                                            className={`${commonClasses} !pr-2 !py-2 text-center`}
                                            autoFocus={idx === items.length - 1} // Autofocus new item
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={item.source}
                                        onChange={(e) => updateItem(idx, 'source', e.target.value)}
                                        placeholder="Source (e.g. SaaS)"
                                        className={`${commonClasses} !py-2 flex-1 min-w-0`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (idx === items.length - 1 && item.percent && item.source) addItem();
                                                else if (idx === items.length - 1) handleSubmitAnswer();
                                            }
                                        }}
                                    />
                                    {items.length > 1 && (
                                        <button
                                            onClick={() => removeItem(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={addItem}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Item
                            </button>
                            <div className="flex-1"></div>
                            <button
                                onClick={handleSubmitAnswer}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span className="hidden sm:inline font-bold text-sm">{t('submit')}</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            }

            case QuestionType.TEXT:
            case QuestionType.EMAIL:
            case QuestionType.PHONE:
            case QuestionType.URL:
                return (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }} className="flex flex-col gap-2 w-full">
                        <div className="flex gap-1.5 sm:gap-2 w-full items-center">
                            <input
                                type={currentQuestion.type === QuestionType.EMAIL ? 'email' : 'text'}
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); } }}
                                placeholder={currentQuestion.placeholder || "Type your answer..."}
                                className={`${commonClasses} flex-1 min-w-0`}
                                autoFocus
                            />

                            <VoiceInput
                                onTranscription={handleVoiceTranscription}
                                language={selectedLanguage}
                                onLanguageChange={setSelectedLanguage}
                                isProcessing={isProcessing}
                            />

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span className="hidden sm:inline font-bold text-sm">{t('submit')}</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hidden on mobile, shown on larger screens */}
                        <div className="hidden sm:flex justify-end">
                            <div className="text-xs px-2 py-1 text-slate-500 font-medium">
                                {/* Map language code to native name */}
                                {(() => {
                                    const labels: Record<string, string> = {
                                        'en-US': '🇺🇸 English',
                                        'en-IN': '🇮🇳 English',
                                        'hi-IN': '🇮🇳 हिंदी',
                                        'te-IN': '🇮🇳 తెలుగు',
                                        'ta-IN': '🇮🇳 தமிழ்',
                                        'kn-IN': '🇮🇳 ಕನ್ನಡ',
                                        'ml-IN': '🇮🇳 മലയാളം',
                                        'mr-IN': '🇮🇳 मराठी',
                                        'bn-IN': '🇮🇳 বাংলা',
                                        'gu-IN': '🇮🇳 ગુજરાતી'
                                    };
                                    return labels[selectedLanguage] || selectedLanguage;
                                })()}
                            </div>
                        </div>
                    </form>
                );

            case QuestionType.TEXTAREA:
                return (
                    <div className="w-full relative">
                        {isBackgroundAnalyzing && (
                            <div className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-slate-500 animate-pulse bg-white/80 px-2 py-1 rounded-full border border-slate-200">
                                <Sparkles className="w-3 h-3 text-violet-500" />
                                <span>AI Agents Analyzing...</span>
                            </div>
                        )}

                        <textarea
                            value={currentAnswer as string}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder={currentQuestion.placeholder || "Type your response..."}
                            rows={3}
                            className={`w-full ${commonClasses} resize-y min-h-[120px] py-3 pr-24 leading-normal`}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault();
                                    handleSubmitAnswer();
                                }
                            }}
                        />

                        <div className="absolute bottom-2 right-2 flex gap-1.5 sm:gap-2">
                            {/* Hidden on mobile to save space inside textarea */}
                            <div className="hidden sm:flex items-center px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white/50 text-slate-500 shadow-sm">
                                {(() => {
                                    const labels: Record<string, string> = {
                                        'en-US': '🇺🇸 English',
                                        'en-IN': '🇮🇳 English',
                                        'hi-IN': '🇮🇳 हिंदी',
                                        'te-IN': '🇮🇳 తెలుగు',
                                        'ta-IN': '🇮🇳 தமிழ்',
                                        'kn-IN': '🇮🇳 ಕನ್ನಡ',
                                        'ml-IN': '🇮🇳 മലയാളം',
                                        'mr-IN': '🇮🇳 मराठी',
                                        'bn-IN': '🇮🇳 বাংলা',
                                        'gu-IN': '🇮🇳 ગુજરાતી'
                                    };
                                    return labels[selectedLanguage] || selectedLanguage;
                                })()}
                            </div>

                            <VoiceInput
                                onTranscription={handleVoiceTranscription}
                                language={selectedLanguage}
                                onLanguageChange={setSelectedLanguage}
                                isProcessing={isProcessing}
                                className="!px-2.5 !py-1.5 !rounded-lg min-w-[36px]"
                                showLanguageSelector={false}
                            />

                            <button
                                onClick={handleSubmitAnswer}
                                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px]"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="hidden sm:inline font-bold text-xs">{t('submit')}</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case QuestionType.PERCENTAGE:
            case QuestionType.NUMBER:
            case QuestionType.AMOUNT:
                return (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }} className="flex flex-col gap-2 w-full">
                        <div className="flex gap-1.5 sm:gap-2 w-full items-center">
                            <input
                                type="number"
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); } }}
                                placeholder={currentQuestion.placeholder || "Enter value..."}
                                className={`${commonClasses} flex-1 min-w-0`}
                                autoFocus
                            />

                            <VoiceInput
                                onTranscription={handleVoiceTranscription}
                                language={selectedLanguage}
                                onLanguageChange={setSelectedLanguage}
                                isProcessing={isProcessing}
                            />

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span className="hidden sm:inline font-bold text-sm">{t('submit')}</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hidden on mobile, shown on larger screens */}
                        <div className="hidden sm:flex justify-end">
                            <div className="text-xs px-2 py-1 text-slate-500 font-medium">
                                {/* Map language code to native name */}
                                {(() => {
                                    const labels: Record<string, string> = {
                                        'en-US': '🇺🇸 English',
                                        'en-IN': '🇮🇳 English',
                                        'hi-IN': '🇮🇳 हिंदी',
                                        'te-IN': '🇮🇳 తెలుగు',
                                        'ta-IN': '🇮🇳 தமிழ்',
                                        'kn-IN': '🇮🇳 ಕನ್ನಡ',
                                        'ml-IN': '🇮🇳 മലയാളം',
                                        'mr-IN': '🇮🇳 मराठी',
                                        'bn-IN': '🇮🇳 বাংলা',
                                        'gu-IN': '🇮🇳 ગુજરાતી'
                                    };
                                    return labels[selectedLanguage] || selectedLanguage;
                                })()}
                            </div>
                        </div>
                    </form>
                );

            case QuestionType.CHOICE:
                return (
                    <div className="flex flex-col gap-3 w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                            {currentQuestion.options?.map((option: QuestionOption) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setCurrentAnswer(option.value);
                                    }}
                                    className={`text - left p - 2 rounded - lg border - 2 transition - all text - xs font - medium ${currentAnswer === option.value
                                        ? 'border-black bg-black text-white'
                                        : 'border-slate-200 bg-white hover:border-black hover:bg-slate-50 text-slate-800'
                                        } `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentQuestion.options?.find(o => o.value === currentAnswer) ? '' : currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                placeholder="Or type your own answer..."
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); } }}
                            />
                            <button
                                onClick={handleSubmitAnswer}
                                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-slate-800 text-xs font-bold uppercase tracking-wider"
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                );

            case QuestionType.MULTI_SELECT:
                const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : [];
                return (
                    <div className="flex flex-col gap-3 w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                            {currentQuestion.options?.map((option: QuestionOption) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        if (selectedValues.includes(option.value)) {
                                            setCurrentAnswer(selectedValues.filter((v: string) => v !== option.value));
                                        } else {
                                            setCurrentAnswer([...selectedValues, option.value]);
                                        }
                                    }}
                                    className={`text - left p - 2 rounded - lg border - 2 transition - all text - xs font - medium ${selectedValues.includes(option.value)
                                        ? 'border-black bg-black text-white'
                                        : 'border-slate-200 bg-white hover:border-black hover:bg-slate-50 text-slate-800'
                                        } `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t('custom')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val && !selectedValues.includes(val)) {
                                            setCurrentAnswer([...selectedValues, val]);
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black transition-all"
                            />
                        </div>

                        <button
                            onClick={handleSubmitAnswer}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 w-full md:w-auto"
                        >
                            <span className="font-bold text-sm">{t('confirm')} ({selectedValues.length})</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </div>
                );

            case QuestionType.SLIDER:
                return (
                    <div className="flex flex-col gap-4 w-full p-4 bg-white rounded-xl border-2 border-slate-200">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentAnswer || 5}
                            onChange={(e) => setCurrentAnswer(Number(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">1 (Low)</span>
                            <span className="text-xl font-bold text-blue-600">{currentAnswer || 5}</span>
                            <span className="text-xs text-slate-500">10 (High)</span>
                        </div>
                        <button
                            onClick={handleSubmitAnswer}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-slate-800"
                        >
                            Confirm Value
                        </button>
                    </div>
                );

            case QuestionType.DATE:
                return (
                    <div className="flex gap-2 w-full">
                        <input
                            type="date"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitAnswer(); } }}
                            className={commonClasses}
                        />
                        <button
                            onClick={handleSubmitAnswer}
                            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <span className="font-bold text-sm">{t('submit')}</span>
                            <Send className="w-4 h-4" />
                        </button>

                    </div>
                );

            case QuestionType.CHECKPOINT:
                return (
                    <div className="flex flex-col gap-3 w-full">
                        <div className="grid grid-cols-2 gap-2">
                            {currentQuestion.options?.map((option: QuestionOption) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionSubmit(option.value)}
                                    className="p-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const handleOptionSubmit = (val: any) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setCurrentAnswer(val);
        handleSubmitAnswer();
    };

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <ChatHeader
                progress={progressPercentage}
                phaseName={currentPhase?.name}
                isTyping={state.agentActivity.length > 0}
                onReset={startNewConversation}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                language={selectedLanguage}
            />

            {/* Compact floating conversation sidebar */}
            <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${showConversationPicker ? 'w-64' : 'w-12'}`}>
                {/* Collapsed state - just an icon */}
                {!showConversationPicker && (
                    <button
                        onClick={() => setShowConversationPicker(true)}
                        className="w-10 h-10 ml-1 bg-white border border-slate-200 rounded-r-lg shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors group"
                        title="Previous Plans"
                    >
                        <span className="text-lg">📋</span>
                        {conversations.length > 1 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                {conversations.length}
                            </span>
                        )}
                    </button>
                )}

                {/* Expanded sidebar */}
                {showConversationPicker && (
                    <div className="bg-white border border-slate-200 rounded-r-xl shadow-xl h-80 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Previous Chats</span>
                            <button
                                onClick={() => setShowConversationPicker(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >×</button>
                        </div>

                        {/* Conversation list */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-400 text-center">No previous plans</div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={`group relative w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer ${state.sessionId === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                                            }`}
                                        onClick={() => switchConversation(conv.id)}
                                    >
                                        <div className="text-xs font-medium text-slate-700 truncate pr-10">
                                            {conv.answers?.business_name || conv.answers?.user_name || 'Untitled'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span>P{(conv.current_phase || 0) + 1}</span>
                                            <span>•</span>
                                            <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        {/* Action buttons - show on hover */}
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newName = prompt('Rename conversation:', conv.answers?.business_name || '');
                                                    if (newName !== null) {
                                                        renameConversation(conv.id, newName);
                                                    }
                                                }}
                                                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-slate-200 rounded"
                                                title="Rename"
                                            >✏️</button>
                                            <button
                                                onClick={(e) => deleteConversation(conv.id, e)}
                                                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-red-100 rounded"
                                                title="Delete"
                                            >🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-8 relative">
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `radial - gradient(#1e293b 0.5px, transparent 0.5px)`,
                        backgroundSize: '24px 24px'
                    }}></div>

                    <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                        {state.messages.map((msg, idx) => (
                            <ChatBubble
                                key={msg.id + idx}
                                role={msg.role === 'user' ? 'user' : 'assistant'}
                                content={msg.content}
                                timestamp={msg.timestamp}
                                isFirstInGroup={idx === 0 || state.messages[idx - 1].role !== msg.role}
                                enableTTS={false}
                                ttsLanguage={state.answers.language || selectedLanguage || 'en-US'}
                                language={selectedLanguage}
                            />
                        ))}

                        {state.agentActivity.length > 0 && (
                            <div className="flex justify-center my-6">
                                <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                                    <div className="relative">
                                        <Brain className="w-4 h-4 text-black" />
                                        <div className="absolute inset-0 bg-slate-400 rounded-full animate-ping opacity-25"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Intelligence</span>
                                        <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                                            {state.agentActivity.join(' • ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showSkipButton && (
                            <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm text-center max-w-sm">
                                    <p className="text-xs text-amber-700 font-medium mb-3 flex items-center justify-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('takingLong')}
                                    </p>
                                    <button
                                        onClick={() => handleOptionSubmit('Skipped via Timeout')}
                                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {t('skip')}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {answeredQuestions === totalQuestions && (
                            <div className="mt-12 p-8 bg-black rounded-[2.5rem] shadow-xl text-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{t('complete')}</h2>
                                    <p className="text-slate-300 text-sm">{t('ready')}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => window.open(`/ api /export /html/${state.sessionId || 'current'} `, '_blank')}
                                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group active:scale-95"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">HTML Doc</span>
                                    </button>
                                    <button
                                        onClick={() => window.open(`/ api /export /pdf/${state.sessionId || 'current'} `, '_blank')}
                                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group active:scale-95"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">PDF Package</span>
                                    </button>
                                    <button
                                        onClick={() => window.open(`/ api /export /docx/${state.sessionId || 'current'} `, '_blank')}
                                        className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group active:scale-95"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Word Doc</span>
                                    </button>
                                </div>
                            </div>
                        )}



                        <div ref={chatEndRef} />
                    </div>
                </div>


                <div className="hidden lg:block w-80 border-l border-gray-200 overflow-y-auto p-4 bg-gray-50">
                    <PhaseRoadmap
                        currentPhase={state.currentPhase}
                        completedPhases={state.completedPhases}
                        language={selectedLanguage}
                    />
                </div>
            </div>
            <div className="relative shrink-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                <div className="max-w-3xl mx-auto">
                    <div className="text-[10px] text-slate-300 px-4 text-center">
                        User: {user ? user.email : 'None'} |
                        Hash: {debugHash}
                    </div>

                    <div className="flex items-center justify-between mb-3 px-2">
                        {validationError ? (

                            <div className="flex items-center gap-2 text-red-500 animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{validationError}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{currentPhase.name}</span>
                            </div>
                        )}

                    </div>

                    {/* AI Suggestions / Idea Starters */}
                    <div className="mb-3 min-h-[28px]">
                        {state.aiSuggestions[currentQuestion?.id || ''] && state.aiSuggestions[currentQuestion?.id || ''].length > 0 ? (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full mr-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{t('help')}</span>
                                </div>
                                {state.aiSuggestions[currentQuestion?.id || ''].slice(0, 3).map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentAnswer(suggestion)}
                                        className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 px-3 py-1.5 rounded-full text-xs transition-all text-left max-w-[200px] truncate shadow-sm"
                                        title={suggestion}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        if (currentQuestion) getAISuggestions(currentQuestion, '', true);
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-600 p-1.5"
                                    title="Refresh ideas"
                                >
                                    🔄
                                </button>
                            </div>
                        ) : (
                            currentQuestion && state.currentPhase > 0 && !isProcessing && (
                                <button
                                    onClick={() => getAISuggestions(currentQuestion, '', true)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 transition-all shadow-sm group"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600" />
                                    <span>{t('ideas')}</span>
                                </button>
                            )
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="bg-white p-3 rounded-[2.5rem] border-2 border-slate-200 shadow-sm flex items-end gap-3 transition-all focus-within:border-black focus-within:shadow-md">
                            {renderInput()}
                        </div>

                        <div className="flex items-center gap-3 px-6 mt-1 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => handleExplainQuestion(currentQuestion)}
                                className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-black flex items-center gap-1.5 transition-colors whitespace-nowrap"
                            >
                                <Brain className="w-3 h-3" />
                                Help me understand
                            </button>
                            {!currentQuestion.required && (
                                <button
                                    onClick={() => handleOptionSubmit('Skipped')}
                                    className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-black flex items-center gap-1.5 transition-colors whitespace-nowrap"
                                >
                                    <ArrowRight className="w-3 h-3" />
                                    Skip question
                                </button>
                            )}
                        </div>
                    </div>


                    <p className="mt-4 text-[9px] text-center text-slate-400 font-medium uppercase tracking-[0.2em]">
                        Oneasy Secure Conversational System • End-to-End Encrypted
                    </p>
                </div>
            </div>


            <style jsx global>{`
                .no - scrollbar:: -webkit - scrollbar {
                display: none;
            }
                .no - scrollbar {
        -ms - overflow - style: none;
        scrollbar - width: none;
    }
    `}</style>
        </div>
    );
}

export default function InteractiveQuestionnairePage() {
    return (
        <AuthWrapper requireAuth={true} redirectTo="/">
            <QuestionnaireContent />
        </AuthWrapper>
    );
}
