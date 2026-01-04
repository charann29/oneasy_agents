'use client';

import { Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';

interface AgentOutput {
    task_id: string;
    agent_id: string;
    agent_name: string;
    output: string;
    skills_used: string[];
    tool_calls: any[];
    execution_time_ms: number;
    success: boolean;
    error?: string;
}

interface AgentBreakdownProps {
    agentOutputs: AgentOutput[];
    intent?: {
        goal: string;
        execution_type: string;
        reasoning: string;
    };
}

export default function AgentBreakdown({ agentOutputs, intent }: AgentBreakdownProps) {
    return (
        <div className="mt-4 space-y-4">
            {/* Intent Summary */}
            {intent && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Orchestration Strategy</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><span className="font-medium">Goal:</span> {intent.goal}</p>
                        <p>
                            <span className="font-medium">Execution:</span>{' '}
                            <span className="inline-flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded">
                                {intent.execution_type === 'parallel' ? '⚡ Parallel' : '→ Sequential'}
                            </span>
                        </p>
                        <p><span className="font-medium">Reasoning:</span> {intent.reasoning}</p>
                    </div>
                </div>
            )}

            {/* Agent Outputs */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">Agent Execution Details</h4>

                {agentOutputs.map((output, index) => (
                    <div
                        key={output.task_id}
                        className={`border rounded-lg p-4 ${output.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                    >
                        {/* Agent Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded ${output.success ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {output.success ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-sm font-semibold text-slate-900">
                                        {index + 1}. {output.agent_name}
                                    </h5>
                                    <p className="text-xs text-slate-600">{output.agent_id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                {output.skills_used.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        <span>{output.skills_used.length} skill{output.skills_used.length > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{(output.execution_time_ms / 1000).toFixed(2)}s</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills Used */}
                        {output.skills_used.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-medium text-slate-700 mb-1">Skills Used:</p>
                                <div className="flex flex-wrap gap-1">
                                    {output.skills_used.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium"
                                        >
                                            <Zap className="w-3 h-3" />
                                            {skill.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Output */}
                        {output.success ? (
                            <div className="bg-white border border-slate-200 rounded p-3">
                                <p className="text-xs font-medium text-slate-700 mb-2">Output:</p>
                                <div className="text-sm text-slate-800 whitespace-pre-wrap">
                                    {output.output.length > 500
                                        ? output.output.substring(0, 500) + '...'
                                        : output.output}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-100 border border-red-300 rounded p-3">
                                <p className="text-xs font-medium text-red-900 mb-1">Error:</p>
                                <p className="text-sm text-red-800">{output.error || 'Unknown error'}</p>
                            </div>
                        )}

                        {/* Tool Calls */}
                        {output.tool_calls.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs font-medium text-slate-700 mb-2">
                                    Function Calls ({output.tool_calls.length}):
                                </p>
                                <div className="space-y-1">
                                    {output.tool_calls.map((call, idx) => (
                                        <div
                                            key={call.id}
                                            className="bg-slate-100 rounded px-2 py-1 text-xs font-mono text-slate-700"
                                        >
                                            {call.function.name}()
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {agentOutputs.length}
                        </p>
                        <p className="text-xs text-slate-600">Agents</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {agentOutputs.reduce((sum, o) => sum + o.skills_used.length, 0)}
                        </p>
                        <p className="text-xs text-slate-600">Skills Used</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {(agentOutputs.reduce((sum, o) => sum + o.execution_time_ms, 0) / 1000).toFixed(1)}s
                        </p>
                        <p className="text-xs text-slate-600">Total Time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
