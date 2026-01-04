import { create } from 'zustand'

interface QuestionnaireState {
  // Session info
  sessionId: string | null
  userId: string | null

  // Progress tracking
  currentPhase: number
  completedPhases: number[]
  answers: Record<string, any>

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  setSession: (sessionId: string, userId: string) => void
  setCurrentPhase: (phase: number) => void
  markPhaseComplete: (phase: number) => void
  setAnswer: (questionId: string, value: any) => void
  setAnswers: (answers: Record<string, any>) => void
  clearAnswer: (questionId: string) => void
  nextPhase: () => void
  previousPhase: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  getProgress: () => number
}

const initialState = {
  sessionId: null,
  userId: null,
  currentPhase: 1,
  completedPhases: [],
  answers: {},
  isLoading: false,
  error: null,
}

export const useQuestionnaireStore = create<QuestionnaireState>()((set, get) => ({
  ...initialState,

  setSession: (sessionId, userId) => {
    set({ sessionId, userId })
  },

  setCurrentPhase: (phase) => {
    set({ currentPhase: phase })
  },

  markPhaseComplete: (phase) => {
    set((state) => ({
      completedPhases: state.completedPhases.includes(phase)
        ? state.completedPhases
        : [...state.completedPhases, phase].sort((a, b) => a - b)
    }))
  },

  setAnswer: (questionId, value) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: value
      }
    }))
  },

  setAnswers: (answers) => {
    set({ answers })
  },

  clearAnswer: (questionId) => {
    set((state) => {
      const newAnswers = { ...state.answers }
      delete newAnswers[questionId]
      return { answers: newAnswers }
    })
  },

  nextPhase: () => {
    const { currentPhase, completedPhases } = get()
    const newPhase = Math.min(currentPhase + 1, 12)

    set({
      currentPhase: newPhase,
      completedPhases: completedPhases.includes(currentPhase)
        ? completedPhases
        : [...completedPhases, currentPhase].sort((a, b) => a - b)
    })
  },

  previousPhase: () => {
    set((state) => ({
      currentPhase: Math.max(state.currentPhase - 1, 1)
    }))
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },

  reset: () => {
    set(initialState)
  },

  getProgress: () => {
    const { completedPhases } = get()
    return (completedPhases.length / 12) * 100
  }
}))
