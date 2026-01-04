'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, Users, Gift, DollarSign, TrendingUp, Network, Briefcase, Target } from 'lucide-react';

interface BusinessModelCanvasProps {
    darkMode?: boolean;
    onGenerate?: (canvas: any) => void;
}

export default function BusinessModelCanvas({ darkMode = false, onGenerate }: BusinessModelCanvasProps) {
    const [canvas, setCanvas] = useState({
        keyPartners: '',
        keyActivities: '',
        keyResources: '',
        valuePropositions: '',
        customerRelationships: '',
        channels: '',
        customerSegments: '',
        costStructure: '',
        revenueStreams: ''
    });

    const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
    const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
    const mutedText = darkMode ? 'text-slate-400' : 'text-slate-600';
    const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';

    const sections = [
        {
            id: 'keyPartners',
            label: 'Key Partners',
            icon: Network,
            placeholder: 'Who are your key partners and suppliers?',
            color: 'blue'
        },
        {
            id: 'keyActivities',
            label: 'Key Activities',
            icon: Briefcase,
            placeholder: 'What key activities does your value proposition require?',
            color: 'purple'
        },
        {
            id: 'keyResources',
            label: 'Key Resources',
            icon: Target,
            placeholder: 'What key resources does your value proposition require?',
            color: 'indigo'
        },
        {
            id: 'valuePropositions',
            label: 'Value Propositions',
            icon: Gift,
            placeholder: 'What value do you deliver to the customer?',
            color: 'green',
            highlight: true
        },
        {
            id: 'customerRelationships',
            label: 'Customer Relationships',
            icon: Users,
            placeholder: 'What type of relationship does each customer segment expect?',
            color: 'orange'
        },
        {
            id: 'channels',
            label: 'Channels',
            icon: TrendingUp,
            placeholder: 'Through which channels do your customers want to be reached?',
            color: 'pink'
        },
        {
            id: 'customerSegments',
            label: 'Customer Segments',
            icon: Users,
            placeholder: 'For whom are you creating value?',
            color: 'red'
        },
        {
            id: 'costStructure',
            label: 'Cost Structure',
            icon: DollarSign,
            placeholder: 'What are the most important costs in your business model?',
            color: 'yellow'
        },
        {
            id: 'revenueStreams',
            label: 'Revenue Streams',
            icon: DollarSign,
            placeholder: 'For what value are your customers willing to pay?',
            color: 'green'
        }
    ];

    const handleChange = (field: string, value: string) => {
        setCanvas(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = () => {
        if (onGenerate) {
            onGenerate(canvas);
        }
    };

    const isComplete = Object.values(canvas).every(v => v.trim().length > 0);

    return (
        <div className={`${cardBg} rounded-xl border ${borderClass} p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className={`text-lg font-bold ${textClass}`}>Business Model Canvas</h3>
                </div>
                {isComplete && (
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate Plan
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.id}
                            className={`${section.highlight ? 'md:col-span-1 md:row-span-2' : ''} ${cardBg} border-2 ${borderClass} rounded-lg p-4 ${section.highlight ? `border-${section.color}-400` : ''}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className={`w-4 h-4 text-${section.color}-500`} />
                                <h4 className={`font-semibold text-sm ${textClass}`}>{section.label}</h4>
                            </div>
                            <textarea
                                value={canvas[section.id as keyof typeof canvas]}
                                onChange={(e) => handleChange(section.id, e.target.value)}
                                placeholder={section.placeholder}
                                rows={section.highlight ? 8 : 4}
                                className={`w-full px-3 py-2 text-sm border ${borderClass} rounded-lg resize-none focus:outline-none focus:border-${section.color}-400 ${darkMode ? 'bg-slate-700' : ''} ${mutedText}`}
                            />
                        </div>
                    );
                })}
            </div>

            <div className={`mt-6 p-4 bg-blue-50 ${darkMode ? 'bg-blue-900/20' : ''} rounded-lg`}>
                <p className={`text-sm ${mutedText}`}>
                    <strong>Tip:</strong> Fill out all sections to get a comprehensive business model.
                    The AI can help you refine each section - just ask!
                </p>
            </div>
        </div>
    );
}
