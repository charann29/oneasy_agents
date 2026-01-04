'use client'

import { TrendingUp, Users, DollarSign, Target, CheckCircle2, Clock } from 'lucide-react'

interface PreviewPanelProps {
    data: any
    answers: Record<string, any>
}

export default function PreviewPanel({ data, answers }: PreviewPanelProps) {
    const sections = [
        {
            id: 'profile',
            title: 'Your Profile',
            icon: Users,
            progress: calculateProgress(['user_name', 'email', 'location'], answers),
            items: [
                { label: 'Name', value: answers.user_name },
                { label: 'Location', value: answers.location }
            ]
        },
        {
            id: 'business',
            title: 'Business Context',
            icon: Target,
            progress: calculateProgress(['business_status', 'industry', 'business_description'], answers),
            items: [
                { label: 'Type', value: answers.business_status === 'new' ? 'New Business' : 'Existing Business' },
                { label: 'Industry', value: answers.industry }
            ]
        },
        {
            id: 'market',
            title: 'Market Analysis',
            icon: TrendingUp,
            progress: calculateProgress(['operating_markets', 'tam_sam_som'], answers),
            items: answers.tam_sam_som ? [
                { label: 'TAM', value: answers.tam_sam_som.tam },
                { label: 'SAM', value: answers.tam_sam_som.sam },
                { label: 'SOM', value: answers.tam_sam_som.som }
            ] : []
        },
        {
            id: 'financial',
            title: 'Financial Model',
            icon: DollarSign,
            progress: calculateProgress(['year_1_revenue_target', 'revenue_streams'], answers),
            items: [
                { label: 'Year 1 Target', value: answers.year_1_revenue_target },
                { label: 'Revenue Streams', value: answers.revenue_streams?.length || 0 }
            ]
        }
    ]

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Your Business Plan
                </h2>
                <p className="text-sm text-gray-600">
                    Building in real-time as you answer
                </p>
            </div>

            {/* Overall Progress */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-600">
                        {calculateOverallProgress(answers)}%
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${calculateOverallProgress(answers)}%` }}
                    />
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon
                    const isComplete = section.progress === 100
                    const hasData = section.progress > 0

                    return (
                        <div
                            key={section.id}
                            className={`p-4 rounded-xl border-2 transition-all ${isComplete
                                    ? 'bg-green-50 border-green-200'
                                    : hasData
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-5 h-5 ${isComplete ? 'text-green-600' : hasData ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                                </div>
                                {isComplete ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : hasData ? (
                                    <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                                ) : (
                                    <span className="text-xs text-gray-500">Pending</span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${section.progress}%` }}
                                />
                            </div>

                            {/* Section Items */}
                            {section.items.length > 0 ? (
                                <div className="space-y-2">
                                    {section.items.map((item, i) => (
                                        item.value && (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.label}:</span>
                                                <span className="font-medium text-gray-900 text-right">
                                                    {typeof item.value === 'object'
                                                        ? JSON.stringify(item.value).substring(0, 30) + '...'
                                                        : String(item.value).substring(0, 30)
                                                    }
                                                </span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    Waiting for data...
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Your complete business plan will be generated at the end
                </p>
            </div>
        </div>
    )
}

function calculateProgress(fields: string[], answers: Record<string, any>): number {
    const completed = fields.filter(field => {
        const value = answers[field]
        return value !== undefined && value !== null && value !== ''
    }).length

    return Math.round((completed / fields.length) * 100)
}

function calculateOverallProgress(answers: Record<string, any>): number {
    const allFields = [
        'user_name', 'email', 'location',
        'business_status', 'industry', 'business_description',
        'operating_markets', 'tam_sam_som',
        'year_1_revenue_target', 'revenue_streams'
    ]

    return calculateProgress(allFields, answers)
}
