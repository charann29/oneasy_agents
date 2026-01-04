'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_PHASES, Phase, Question, QuestionType, getQuestionsByPhase } from '@/lib/schemas/questions'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import ThinkingIndicator from '@/components/questionnaire/ThinkingIndicator'
import AutoPopulatedFields from '@/components/questionnaire/AutoPopulatedFields'
import PreviewPanel from '@/components/questionnaire/PreviewPanel'

export default function QuestionnairePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [phaseQuestions, setPhaseQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}`)

  // MCP Integration State
  const [thinking, setThinking] = useState(false)
  const [thinkingLog, setThinkingLog] = useState<string[]>([])
  const [autoPopulated, setAutoPopulated] = useState<Record<string, any>>({})
  const [agentsUsed, setAgentsUsed] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<any>(null)

  // Handle hydration and initialize
  useEffect(() => {
    setMounted(true)
    const questions = getQuestionsByPhase(1)
    setPhaseQuestions(questions)
  }, [])

  // Update questions when phase changes
  useEffect(() => {
    if (mounted) {
      const questions = getQuestionsByPhase(currentPhase)
      setPhaseQuestions(questions)
      setCurrentQuestionIndex(0)
    }
  }, [currentPhase, mounted])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    setError(null)
  }

  const handleNext = async () => {
    const currentQuestion = phaseQuestions[currentQuestionIndex]

    // Validate current answer
    if (currentQuestion?.required && !answers[currentQuestion.id]) {
      setError('Please answer this question before continuing')
      return
    }

    setError(null)
    setThinking(true)
    setThinkingLog([])
    setAutoPopulated({})
    setAgentsUsed([])

    try {
      // Call MCP-powered API to process answer
      const response = await fetch('/api/questionnaire/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          answer: answers[currentQuestion.id],
          all_answers: answers,
          session_id: sessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update thinking log
        if (data.thinking_log) {
          setThinkingLog(data.thinking_log)
        }

        // Show auto-populated fields
        if (data.auto_populated && Object.keys(data.auto_populated).length > 0) {
          setAutoPopulated(data.auto_populated)
          setAnswers(prev => ({ ...prev, ...data.auto_populated }))
        }

        // Show agents used
        if (data.agent_analysis?.agents_used) {
          setAgentsUsed(data.agent_analysis.agents_used)
        }

        // Update preview
        if (data.preview_data) {
          setPreviewData(data.preview_data)
        }

        // Wait a moment to show the results
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Move to next question
        if (currentQuestionIndex < phaseQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          // Move to next phase (max 6 phases for now)
          if (currentPhase < 6) {
            setCurrentPhase(currentPhase + 1)
          } else {
            // All done!
            alert('Questionnaire complete! Generating your business plan...')
          }
        }
      } else {
        setError(data.error || 'Failed to process answer')
      }
    } catch (error) {
      console.error('Error processing answer:', error)
      setError('Failed to process answer. Please try again.')
    } finally {
      setThinking(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1)
    }
    setAutoPopulated({})
    setThinkingLog([])
  }

  if (!mounted || phaseQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = phaseQuestions[currentQuestionIndex]
  const progress = ((currentPhase - 1) * 100 / 6) + ((currentQuestionIndex + 1) / phaseQuestions.length * (100 / 6))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Business Planner</h1>
          <p className="text-gray-600">Phase {currentPhase} of 6 - {getPhaseTitle(currentPhase)}</p>

          {/* Progress Bar */}
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% Complete</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Questionnaire - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Question {currentQuestionIndex + 1} of {phaseQuestions.length}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentQuestion.question}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 text-sm">{currentQuestion.description}</p>
                )}
              </div>

              {/* Input Field */}
              <div className="mb-6">
                {renderInputField(currentQuestion, answers, handleAnswerChange)}
              </div>
            </div>

            {/* Thinking Indicator */}
            <ThinkingIndicator
              isThinking={thinking}
              thinkingLog={thinkingLog}
              agentsUsed={agentsUsed}
            />

            {/* Auto-populated Fields */}
            <AutoPopulatedFields
              fields={autoPopulated}
              onDismiss={() => setAutoPopulated({})}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentPhase === 1 && currentQuestionIndex === 0}
                className="
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  bg-gray-100 hover:bg-gray-200 text-gray-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={thinking}
                className="
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  bg-blue-500 hover:bg-blue-600 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {currentPhase === 6 && currentQuestionIndex === phaseQuestions.length - 1 ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PreviewPanel data={previewData} answers={answers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderInputField(
  question: Question,
  answers: Record<string, any>,
  onChange: (id: string, value: any) => void
) {
  const value = answers[question.id] || ''

  switch (question.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )

    case QuestionType.CHOICE:
      return (
        <select
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select an option...</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )

    case 'multiselect':
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={(value || []).includes(option.value)}
                onChange={(e) => {
                  const current = value || []
                  const updated = e.target.checked
                    ? [...current, option.value]
                    : current.filter((v: string) => v !== option.value)
                  onChange(question.id, updated)
                }}
                className="w-5 h-5 text-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-600">{option.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      )

    default:
      return null
  }
}

function getPhaseTitle(phase: number): string {
  const titles = {
    1: 'User Profile & Authentication',
    2: 'Business Context',
    3: 'Data Integration',
    4: 'Market Analysis',
    5: 'Competitor Analysis',
    6: 'Revenue Architecture'
  }
  return titles[phase as keyof typeof titles] || 'Business Planning'
}
