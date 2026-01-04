import { CheckCircle2, Clock, FileText, TrendingUp, Users, Zap, Target, DollarSign, Package, Rocket, Award } from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

interface PhaseRoadmapProps {
    currentPhase: number;
    completedPhases: number[];
    language: string;
}

export default function PhaseRoadmap({ currentPhase, completedPhases, language }: PhaseRoadmapProps) {
    const t = (key: any) => getTranslation(language, key);

    const phases = [
        {
            number: 1,
            name: t('phase1'),
            duration: '2-3 min',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            questions: 5
        },
        {
            number: 2,
            name: t('phase2'),
            duration: '5-7 min',
            icon: Target,
            color: 'from-cyan-500 to-teal-500',
            questions: 8
        },
        {
            number: 3,
            name: t('phase3'),
            duration: '8-10 min',
            icon: TrendingUp,
            color: 'from-teal-500 to-green-500',
            questions: 12
        },
        {
            number: 4,
            name: t('phase4'),
            duration: '10-12 min',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
            questions: 15
        },
        {
            number: 5,
            name: t('phase5'),
            duration: '8-10 min',
            icon: Zap,
            color: 'from-emerald-500 to-lime-500',
            questions: 10
        },
        {
            number: 6,
            name: t('phase6'),
            duration: '12-15 min',
            icon: Package,
            color: 'from-lime-500 to-yellow-500',
            questions: 18
        }
    ];

    const currentPhaseIndex = currentPhase;

    const deliverables = [
        { icon: FileText, text: t('delivPlan') },
        { icon: TrendingUp, text: t('delivFin') },
        { icon: Award, text: t('delivPitch') },
        { icon: Rocket, text: t('delivGTM') }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-lg text-gray-900">{t('yourJourney')}</h3>
                </div>
                <p className="text-sm text-gray-600">{t('totalTime')}: 45-57 min</p>
                <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Phases */}
            <div className="space-y-3 mb-6">
                {phases.map((phase) => {
                    const Icon = phase.icon;
                    const isCompleted = completedPhases.includes(phase.number - 1);
                    const isCurrent = phase.number - 1 === currentPhase;
                    const isUpcoming = phase.number - 1 > currentPhase;

                    return (
                        <div
                            key={phase.number}
                            className={`
                relative p-3 rounded-xl border-2 transition-all duration-300
                ${isCurrent ? 'border-purple-500 bg-purple-50 shadow-md' : ''}
                ${isCompleted ? 'border-green-500 bg-green-50' : ''}
                ${isUpcoming ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
              `}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${isCurrent ? 'bg-gradient-to-br ' + phase.color : ''}
                  ${isCompleted ? 'bg-green-500' : ''}
                  ${isUpcoming ? 'bg-gray-300' : ''}
                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    ) : (
                                        <Icon className={`w-5 h-5 ${isCurrent || isCompleted ? 'text-white' : 'text-gray-500'}`} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-semibold text-sm ${isCurrent ? 'text-purple-900' : isCompleted ? 'text-green-900' : 'text-gray-700'}`}>
                                            {t('phase')} {phase.number}: {phase.name}
                                        </h4>
                                        {isCurrent && (
                                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                                {t('now')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {phase.duration}
                                        </span>
                                        <span>{phase.questions} {t('questions')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Deliverables */}
            <div className="pt-4 border-t border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    {t('whatYouGet')}
                </h4>
                <div className="space-y-2">
                    {deliverables.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                                <Icon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <span>{item.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivation */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <p className="text-xs text-purple-900 font-medium text-center">
                    {t('worthValue')}
                </p>
            </div>
        </div>
    );
}
