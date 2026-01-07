'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ALL_PHASES } from '@/lib/schemas/questions';
import ReviewChat from '@/components/review/ReviewChat';
import {
    ChevronDown,
    ChevronUp,
    Edit3,
    Save,
    X,
    Plus,
    Check,
    Sparkles,
    ArrowRight,
    AlertCircle,
    MessageSquare
} from 'lucide-react';

interface AnswerData {
    [key: string]: any;
}

interface PhaseSection {
    phase: number;
    name: string;
    answers: { questionId: string; question: string; answer: any }[];
}

function ReviewPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [answers, setAnswers] = useState<AnswerData>({});
    const [loading, setLoading] = useState(true);
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0, 1, 2]));
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [additionalNotes, setAdditionalNotes] = useState<string>('');
    const [showAddNotes, setShowAddNotes] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const urlId = searchParams.get('sessionId');
        if (urlId && urlId !== 'new') {
            setSessionId(urlId);
        } else if (typeof window !== 'undefined') {
            const localId = localStorage.getItem('ca_session_id');
            setSessionId(localId || null);
        }
    }, [searchParams]);

    // Fetch session data
    useEffect(() => {
        if (!sessionId) return;

        const fetchSessionData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await (supabase
                    .from('questionnaire_sessions') as any)
                    .select('answers, accumulated_context, additional_notes')
                    .eq('id', sessionId)
                    .maybeSingle(); // Use maybeSingle to prevent 406 error when no data found

                if (fetchError) {
                    console.error('Error fetching session:', fetchError);
                    // Don't block the UI - try to load from localStorage
                    const localBackup = localStorage.getItem('questionnaire_state') || localStorage.getItem('ca_backup_state');
                    if (localBackup) {
                        const backup = JSON.parse(localBackup);
                        if (backup.answers) {
                            console.log('Loaded from localStorage backup');
                            setAnswers(backup.answers);
                            setLoading(false);
                            return;
                        }
                    }
                    setError('Failed to load your answers. Please try again.');
                    return;
                }

                if (data) {
                    setAnswers(data.answers || {});
                    setAdditionalNotes(data.additional_notes || '');
                } else {
                    // No data in Supabase, try localStorage
                    const localBackup = localStorage.getItem('questionnaire_state') || localStorage.getItem('ca_backup_state');
                    if (localBackup) {
                        const backup = JSON.parse(localBackup);
                        if (backup.answers) {
                            console.log('No Supabase data, loaded from localStorage');
                            setAnswers(backup.answers);
                        }
                    }
                }
            } catch (err) {
                console.error('Error:', err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [sessionId]);

    // Organize answers by phase
    const organizeByPhase = (): PhaseSection[] => {
        const sections: PhaseSection[] = [];

        ALL_PHASES.forEach((phase, phaseIndex) => {
            const phaseAnswers: { questionId: string; question: string; answer: any }[] = [];

            phase.questions.forEach((q) => {
                if (answers[q.id] !== undefined && answers[q.id] !== '') {
                    phaseAnswers.push({
                        questionId: q.id,
                        question: q.question,
                        answer: answers[q.id]
                    });
                }
            });

            if (phaseAnswers.length > 0) {
                sections.push({
                    phase: phaseIndex,
                    name: phase.name,
                    answers: phaseAnswers
                });
            }
        });

        return sections;
    };

    const togglePhase = (phaseIndex: number) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            if (next.has(phaseIndex)) {
                next.delete(phaseIndex);
            } else {
                next.add(phaseIndex);
            }
            return next;
        });
    };

    const startEdit = (questionId: string, currentValue: any) => {
        setEditingField(questionId);
        setEditValue(typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = async (questionId: string) => {
        setSaving(true);

        try {
            let valueToSave = editValue;

            // Try to parse as JSON if it looks like JSON
            if (typeof editValue === 'string' && (editValue.startsWith('[') || editValue.startsWith('{'))) {
                try {
                    valueToSave = JSON.parse(editValue);
                } catch {
                    // Keep as string if parsing fails
                }
            }

            const updatedAnswers = {
                ...answers,
                [questionId]: valueToSave
            };

            const { error: updateError } = await (supabase
                .from('questionnaire_sessions') as any)
                .update({
                    answers: updatedAnswers,
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId);

            if (updateError) {
                throw updateError;
            }

            setAnswers(updatedAnswers);
            setEditingField(null);
            setEditValue('');

            // Show success indicator
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);

        } catch (err) {
            console.error('Error saving edit:', err);
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const saveAdditionalNotes = async () => {
        setSaving(true);

        try {
            const { error: updateError } = await (supabase
                .from('questionnaire_sessions') as any)
                .update({
                    additional_notes: additionalNotes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId);

            if (updateError) {
                throw updateError;
            }

            setShowAddNotes(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);

        } catch (err) {
            console.error('Error saving notes:', err);
            setError('Failed to save notes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const proceedToGenerate = () => {
        router.push(`/complete?sessionId=${sessionId}`);
    };

    const formatAnswer = (answer: any): string => {
        if (answer === null || answer === undefined) return '-';
        if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
        if (Array.isArray(answer)) {
            if (answer.length === 0) return '-';
            if (typeof answer[0] === 'object') {
                return answer.map((item, i) => {
                    if (item.percent && item.source) {
                        return `${item.percent}% - ${item.source}`;
                    }
                    if (item.timeframe && item.description) {
                        return `${item.timeframe}: ${item.description}`;
                    }
                    return JSON.stringify(item);
                }).join('\n');
            }
            return answer.join(', ');
        }
        if (typeof answer === 'object') {
            return Object.entries(answer)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
        }
        return String(answer);
    };

    const sections = organizeByPhase();
    const totalAnswers = Object.keys(answers).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your answers...</p>
                </div>
            </div>
        );
    }

    if (error && totalAnswers === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
                <div className="max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/chat')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Return to Questionnaire
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Review Your Answers</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Before we generate your business plan, please review your answers.
                        You can <strong>edit</strong> any response or <strong>add additional context</strong>.
                    </p>
                </div>

                {/* Success Toast */}
                {saveSuccess && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in z-50">
                        <Check className="w-5 h-5" />
                        <span>Changes saved successfully!</span>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{totalAnswers}</div>
                            <div className="text-xs text-gray-500">Answers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
                            <div className="text-xs text-gray-500">Phases</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddNotes(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Notes
                    </button>
                </div>

                {/* Additional Notes Modal */}
                {showAddNotes && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Add Additional Context</h3>
                                <button onClick={() => setShowAddNotes(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Is there anything else you'd like to add? Any context, clarifications, or additional information
                                that might help create a better business plan?
                            </p>
                            <textarea
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="For example: 'I'm specifically interested in exploring franchise models' or 'My target customers are primarily in rural areas'..."
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowAddNotes(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveAdditionalNotes}
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Notes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Notes Display */}
                {additionalNotes && !showAddNotes && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-amber-800 mb-1">Your Additional Notes</h4>
                                <p className="text-amber-700 whitespace-pre-wrap">{additionalNotes}</p>
                            </div>
                            <button
                                onClick={() => setShowAddNotes(true)}
                                className="text-amber-600 hover:text-amber-800 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Answer Sections by Phase */}
                <div className="space-y-4 mb-8">
                    {sections.map((section) => (
                        <div
                            key={section.phase}
                            className="bg-white rounded-2xl shadow-md overflow-hidden"
                        >
                            {/* Phase Header */}
                            <button
                                onClick={() => togglePhase(section.phase)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {section.phase + 1}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {section.answers.length} answers
                                    </span>
                                </div>
                                {expandedPhases.has(section.phase) ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {/* Answers List */}
                            {expandedPhases.has(section.phase) && (
                                <div className="px-6 pb-4 space-y-3">
                                    {section.answers.map((item) => (
                                        <div
                                            key={item.questionId}
                                            className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">{item.question}</p>

                                                    {editingField === item.questionId ? (
                                                        <div className="mt-2">
                                                            <textarea
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                rows={3}
                                                                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => saveEdit(item.questionId)}
                                                                    disabled={saving}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                                                >
                                                                    {saving ? (
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <Save className="w-3.5 h-3.5" />
                                                                    )}
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium whitespace-pre-wrap">
                                                            {formatAnswer(item.answer)}
                                                        </p>
                                                    )}
                                                </div>

                                                {editingField !== item.questionId && (
                                                    <button
                                                        onClick={() => startEdit(item.questionId, item.answer)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit this answer"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push('/chat')}
                            className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit3 className="w-5 h-5" />
                            Continue Editing in Chat
                        </button>
                        <button
                            onClick={proceedToGenerate}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            I'm Happy - Generate My Plan
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        You can always come back to review and update your answers later.
                    </p>
                </div>
            </div>

            {/* AI Chat for adding more context */}
            <ReviewChat
                sessionId={sessionId}
                answers={answers}
                onAnswersUpdated={(newAnswers) => {
                    setAnswers(newAnswers);
                    // Also save to database
                    (supabase.from('questionnaire_sessions') as any)
                        .update({ answers: newAnswers, updated_at: new Date().toISOString() })
                        .eq('id', sessionId)
                        .then(() => {
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 2000);
                        });
                }}
                onNotesUpdated={(notes) => {
                    setAdditionalNotes(notes);
                }}
            />

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ReviewPageContent />
        </Suspense>
    );
}
