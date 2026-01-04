'use client'

import { Check } from 'lucide-react'

interface Phase {
  number: number
  name: string
  description: string
}

interface ProgressTrackerProps {
  currentPhase: number
  completedPhases: number[]
  totalPhases?: number
  overallProgress: number // 0-100
  className?: string
}

const PHASE_NAMES: Phase[] = [
  { number: 1, name: 'Basic Info', description: 'Business name and idea' },
  { number: 2, name: 'Market Analysis', description: 'Target market and competitors' },
  { number: 3, name: 'Products', description: 'Products and pricing' },
  { number: 4, name: 'Operations', description: 'Business operations' },
  { number: 5, name: 'Team', description: 'Organization and hiring' },
  { number: 6, name: 'Marketing', description: 'Marketing and sales' },
  { number: 7, name: 'Financials', description: 'Financial projections' },
  { number: 8, name: 'Funding', description: 'Capital and investors' },
  { number: 9, name: 'Risks', description: 'Risks and mitigation' },
  { number: 10, name: 'Milestones', description: 'Timeline and goals' },
  { number: 11, name: 'Legal', description: 'Legal and compliance' },
  { number: 12, name: 'Final Review', description: 'Summary and submission' },
]

export function ProgressTracker({
  currentPhase,
  completedPhases,
  totalPhases = 12,
  overallProgress,
  className = ''
}: ProgressTrackerProps) {
  const getPhaseStatus = (phaseNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (completedPhases.includes(phaseNumber)) return 'completed'
    if (phaseNumber === currentPhase) return 'current'
    return 'upcoming'
  }

  const getPhaseColor = (status: 'completed' | 'current' | 'upcoming'): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500'
      case 'current':
        return 'bg-blue-500 border-blue-500'
      case 'upcoming':
        return 'bg-gray-200 border-gray-300'
    }
  }

  const getTextColor = (status: 'completed' | 'current' | 'upcoming'): string => {
    switch (status) {
      case 'completed':
        return 'text-green-700'
      case 'current':
        return 'text-blue-700'
      case 'upcoming':
        return 'text-gray-500'
    }
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Overall Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="font-bold text-blue-600">{Math.round(overallProgress)}%</span>
        </div>

        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <p className="text-xs text-gray-600">
          Phase {currentPhase} of {totalPhases} • {completedPhases.length} completed
        </p>
      </div>

      {/* Phase List */}
      <div className="flex flex-col gap-3">
        {PHASE_NAMES.map((phase) => {
          const status = getPhaseStatus(phase.number)
          const isAccessible = phase.number <= currentPhase

          return (
            <div
              key={phase.number}
              className={`
                flex items-start gap-3 p-3 rounded-lg border
                transition-all duration-200
                ${status === 'current' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                ${!isAccessible ? 'opacity-50' : ''}
              `}
            >
              {/* Phase Number/Icon */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  flex-shrink-0 font-bold text-sm transition-all duration-200
                  ${getPhaseColor(status)}
                `}
              >
                {status === 'completed' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={status === 'current' ? 'text-white' : 'text-gray-600'}>
                    {phase.number}
                  </span>
                )}
              </div>

              {/* Phase Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${getTextColor(status)}`}>
                  {phase.name}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {phase.description}
                </p>

                {/* Current phase indicator */}
                {status === 'current' && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-600 font-medium">In progress</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Motivational message */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          {overallProgress < 25 && "Great start! You're building something amazing."}
          {overallProgress >= 25 && overallProgress < 50 && "You're making excellent progress! Keep going."}
          {overallProgress >= 50 && overallProgress < 75 && "Over halfway there! Your plan is taking shape."}
          {overallProgress >= 75 && overallProgress < 100 && "Almost done! Just a few more questions."}
          {overallProgress >= 100 && "🎉 Congratulations! Your business plan is complete!"}
        </p>
      </div>
    </div>
  )
}
