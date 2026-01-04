'use client'

import { Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ThinkingIndicatorProps {
    isThinking: boolean
    thinkingLog: string[]
    agentsUsed?: string[]
}

export default function ThinkingIndicator({
    isThinking,
    thinkingLog,
    agentsUsed = []
}: ThinkingIndicatorProps) {
    if (!isThinking && thinkingLog.length === 0) {
        return null
    }

    return (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                    <Brain className={`w-6 h-6 text-blue-600 ${isThinking ? 'animate-pulse' : ''}`} />
                    {isThinking && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-blue-900">
                        {isThinking ? 'AI is analyzing your answer...' : 'Analysis Complete'}
                    </h3>
                    {agentsUsed.length > 0 && (
                        <p className="text-sm text-blue-700">
                            Agents: {agentsUsed.map(formatAgentName).join(', ')}
                        </p>
                    )}
                </div>
            </div>

            {/* Thinking Log */}
            <div className="space-y-2">
                {thinkingLog.map((log, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 text-sm animate-fade-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        {isThinking && i === thinkingLog.length - 1 ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-blue-800">{log}</span>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            {isThinking && (
                <div className="mt-4 h-1 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-progress" />
                </div>
            )}
        </div>
    )
}

function formatAgentName(agentId: string): string {
    return agentId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
