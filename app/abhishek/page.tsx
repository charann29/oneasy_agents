/**
 * Abhishek CA Chat Interface
 * Natural conversational business planning experience
 * Visit: http://localhost:3000/abhishek
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatWithAbhishek } from '@/lib/hooks/use-chat';

export default function AbhishekChatPage() {
  const {
    messages,
    phase,
    progress,
    extractedData,
    isComplete,
    suggestedActions,
    loading,
    error,
    sendMessage,
    startNewConversation,
    clearError
  } = useChatWithAbhishek();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPhaseLabel = (phaseValue: string): string => {
    const phaseLabels: Record<string, string> = {
      getting_to_know: 'Getting to Know You',
      business_idea: 'Understanding Your Business Idea',
      market_customers: 'Market & Customers',
      business_model: 'Business Model & Revenue',
      operations_team: 'Operations & Team',
      gtm_growth: 'Go-to-Market Strategy',
      funding_resources: 'Funding & Resources',
      risks_strategy: 'Risks & Strategy',
      final_review: 'Final Review',
      completed: 'Completed'
    };

    return phaseLabels[phaseValue] || phaseValue;
  };

  const getPhaseEmoji = (phaseValue: string): string => {
    const phaseEmojis: Record<string, string> = {
      getting_to_know: '👋',
      business_idea: '💡',
      market_customers: '🎯',
      business_model: '💰',
      operations_team: '👥',
      gtm_growth: '🚀',
      funding_resources: '💵',
      risks_strategy: '⚠️',
      final_review: '✅',
      completed: '🎉'
    };

    return phaseEmojis[phaseValue] || '📝';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chat with Abhishek CA
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your personal Chartered Accountant for business planning
              </p>
            </div>
            <button
              onClick={startNewConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Conversation
            </button>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {getPhaseEmoji(phase)} {getPhaseLabel(phase)}
                </span>
                <span className="text-sm text-gray-600">{progress}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome! Let's build your business plan together
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      I'm Abhishek, your CA guide. I'll ask you questions about your business idea,
                      and together we'll create a comprehensive business plan with financial projections.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      This will take about 30-40 minutes. Ready to start?
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            CA
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            Abhishek CA
                          </span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>

                      <div className="mt-2 text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>

                      {message.metadata?.dataExtracted && Object.keys(message.metadata.dataExtracted).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="text-xs font-semibold mb-1">Data extracted:</div>
                          <div className="text-xs">
                            {Object.keys(message.metadata.dataExtracted).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                      <button
                        onClick={clearError}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                {isComplete && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="font-semibold text-green-900">
                      Conversation Complete!
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Your business plan is being generated. Check your business plans list.
                    </div>
                  </div>
                )}

                {suggestedActions.length > 0 && !isComplete && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {suggestedActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(action)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isComplete ? 'Conversation complete' : 'Type your message...'}
                    disabled={loading || isComplete}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading || isComplete}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversation Progress</h3>

              {/* Phase Checklist */}
              <div className="space-y-3">
                {[
                  { key: 'getting_to_know', label: 'Personal Background' },
                  { key: 'business_idea', label: 'Business Idea' },
                  { key: 'market_customers', label: 'Market & Customers' },
                  { key: 'business_model', label: 'Business Model' },
                  { key: 'operations_team', label: 'Operations & Team' },
                  { key: 'gtm_growth', label: 'Go-to-Market' },
                  { key: 'funding_resources', label: 'Funding' },
                  { key: 'risks_strategy', label: 'Risks & Strategy' }
                ].map((phaseItem, index) => {
                  const phaseIndex = ['getting_to_know', 'business_idea', 'market_customers', 'business_model', 'operations_team', 'gtm_growth', 'funding_resources', 'risks_strategy'].indexOf(phase);
                  const currentIndex = ['getting_to_know', 'business_idea', 'market_customers', 'business_model', 'operations_team', 'gtm_growth', 'funding_resources', 'risks_strategy'].indexOf(phaseItem.key);
                  const isCurrentPhase = phase === phaseItem.key;
                  const isCompleted = currentIndex < phaseIndex;

                  return (
                    <div key={phaseItem.key} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrentPhase ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className={`text-sm ${
                        isCurrentPhase ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {phaseItem.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Extracted Data Summary */}
              {Object.keys(extractedData).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Data Collected</h4>
                  <div className="space-y-2">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-medium text-gray-700">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-gray-600 ml-1">
                          {typeof value === 'string' && value.length > 50
                            ? value.substring(0, 50) + '...'
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {Object.keys(extractedData).length} fields captured
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Tips</h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• Be specific and honest in your answers</li>
                  <li>• Take your time - there's no rush</li>
                  <li>• You can pause and resume anytime</li>
                  <li>• Ask Abhishek if you need clarification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
