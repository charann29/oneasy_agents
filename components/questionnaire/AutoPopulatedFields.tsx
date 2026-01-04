'use client'

import { Sparkles, CheckCircle, Info } from 'lucide-react'

interface AutoPopulatedFieldsProps {
    fields: Record<string, any>
    onDismiss?: () => void
}

export default function AutoPopulatedFields({
    fields,
    onDismiss
}: AutoPopulatedFieldsProps) {
    if (Object.keys(fields).length === 0) {
        return null
    }

    return (
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">
                            Auto-populated Fields
                        </h3>
                        <p className="text-sm text-green-700">
                            {Object.keys(fields).length} field{Object.keys(fields).length > 1 ? 's' : ''} automatically filled
                        </p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                        Dismiss
                    </button>
                )}
            </div>

            {/* Fields List */}
            <div className="space-y-3">
                {Object.entries(fields).map(([key, value]) => (
                    <div
                        key={key}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100"
                    >
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                    {formatFieldName(key)}
                                </span>
                                {getFieldExplanation(key) && (
                                    <div className="group relative">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                            {getFieldExplanation(key)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-gray-700">
                                {formatValue(value)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function formatFieldName(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
}

function formatValue(value: any): string {
    if (value === null || value === undefined) {
        return 'N/A'
    }

    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.join(', ')
        }
        return JSON.stringify(value, null, 2)
    }

    return String(value)
}

function getFieldExplanation(key: string): string | null {
    const explanations: Record<string, string> = {
        'timezone': 'Automatically detected from your location',
        'currency': 'Default currency based on your operating market',
        'gross_margin_benchmark': 'Industry standard gross margin for comparison',
        'revenue_stream_templates': 'Common revenue streams for your industry',
        'calculated_cac': 'Customer Acquisition Cost = Marketing Budget / Total Customers',
        'tam_sam_som': 'Market size calculated using industry data and your geography'
    }

    return explanations[key] || null
}
