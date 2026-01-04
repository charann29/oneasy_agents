import { AI } from '../ai/unified'
import { Question, getQuestionsByPhase, getQuestionById, ALL_PHASES } from '../schemas/questions'

/**
 * QuestionnaireAgent - Intelligent orchestration of the questionnaire flow
 *
 * This agent handles:
 * - Smart question sequencing
 * - Context-aware validation
 * - Intelligent suggestions
 * - Progress tracking
 * - Business plan generation
 */
export class QuestionnaireAgent {

  /**
   * Determines the next question to ask based on current context
   */
  static async getNextQuestion(
    currentPhase: number,
    answers: Record<string, any>
  ): Promise<Question | null> {
    const phaseQuestions = getQuestionsByPhase(currentPhase)

    // Find first unanswered required question
    for (const question of phaseQuestions) {
      // Skip if already answered
      if (answers[question.id]) {
        continue
      }

      // Return first unanswered required question
      if (question.required) {
        return question
      }
    }

    // All required questions answered
    return null
  }

  /**
   * Validates if a phase is complete
   */
  static async validatePhase(
    phase: number,
    answers: Record<string, any>
  ): Promise<{ valid: boolean; missing: string[]; errors: string[] }> {
    const phaseQuestions = getQuestionsByPhase(phase)
    const missing: string[] = []
    const errors: string[] = []

    for (const question of phaseQuestions) {
      // Check required questions
      if (question.required && !answers[question.id]) {
        missing.push(question.id)
      }
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      errors
    }
  }

  /**
   * Gets AI-powered suggestions for a question
   */
  static async getSuggestions(
    questionId: string,
    partialAnswer: string,
    context: Record<string, any>
  ): Promise<string[]> {
    try {
      return await AI.getSuggestions(questionId, partialAnswer, context)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      return []
    }
  }

  /**
   * Validates an answer using AI
   */
  static async validateAnswer(
    questionId: string,
    answer: any,
    context: Record<string, any>
  ): Promise<{ valid: boolean; issues: string[]; suggestions: string[] }> {
    const question = getQuestionById(questionId)

    if (!question) {
      return { valid: false, issues: ['Question not found'], suggestions: [] }
    }

    // Basic validation
    if (question.required && !answer) {
      return {
        valid: false,
        issues: ['This field is required'],
        suggestions: []
      }
    }

    // AI validation for quality
    try {
      const aiValidation = await AI.validate(JSON.stringify(answer))
      return aiValidation
    } catch (error) {
      console.error('AI validation failed:', error)
      return { valid: true, issues: [], suggestions: [] }
    }
  }

  /**
   * Generates insights from collected answers
   */
  static async generateInsights(
    answers: Record<string, any>
  ): Promise<{
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    recommendations: string[]
  }> {
    try {
      const prompt = `Analyze this business plan data and provide insights:
${JSON.stringify(answers, null, 2)}

Return JSON with:
- strengths: Array of key strengths
- weaknesses: Array of potential weaknesses
- opportunities: Array of opportunities
- recommendations: Array of actionable recommendations`

      const result = await AI.chat([
        { role: 'system', content: 'You are a business planning expert. Provide actionable insights.' },
        { role: 'user', content: prompt }
      ])

      return JSON.parse(result)
    } catch (error) {
      console.error('Failed to generate insights:', error)
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        recommendations: []
      }
    }
  }

  /**
   * Generates the final business plan
   */
  static async generateBusinessPlan(
    answers: Record<string, any>
  ): Promise<string> {
    try {
      return await AI.generatePlan(answers)
    } catch (error) {
      console.error('Failed to generate business plan:', error)
      throw new Error('Business plan generation failed')
    }
  }

  /**
   * Calculates overall progress
   */
  static calculateProgress(
    answers: Record<string, any>,
    completedPhases: number[]
  ): number {
    const allQuestions = ALL_PHASES.flatMap(phase => phase.questions)
    const requiredQuestions = allQuestions.filter((q: Question) => q.required)
    const answeredRequired = requiredQuestions.filter((q: Question) => answers[q.id]).length

    return (answeredRequired / requiredQuestions.length) * 100
  }

  /**
   * Gets a summary of answers for a specific phase
   */
  static getPhaseSummary(
    phase: number,
    answers: Record<string, any>
  ): Record<string, any> {
    const phaseQuestions = getQuestionsByPhase(phase)
    const summary: Record<string, any> = {}

    phaseQuestions.forEach(question => {
      if (answers[question.id]) {
        summary[question.id] = {
          question: question.question,
          answer: answers[question.id]
        }
      }
    })

    return summary
  }

  /**
   * Suggests which phase to work on next based on completeness
   */
  static suggestNextPhase(answers: Record<string, any>): number {
    for (let phase = 1; phase <= 12; phase++) {
      const phaseQuestions = getQuestionsByPhase(phase)
      const requiredQuestions = phaseQuestions.filter(q => q.required)
      const unanswered = requiredQuestions.filter(q => !answers[q.id])

      if (unanswered.length > 0) {
        return phase
      }
    }

    return 12 // All phases complete
  }

  /**
   * Exports answers in a structured format
   */
  static exportAnswers(answers: Record<string, any>): {
    phases: Record<number, { title: string; questions: any[] }>
    metadata: { totalQuestions: number; answeredQuestions: number; completeness: number }
  } {
    const allQuestions = ALL_PHASES.flatMap(phase => phase.questions)
    const phases: Record<number, { title: string; questions: any[] }> = {}

    // Group by phase
    for (let i = 1; i <= 11; i++) {
      const phaseQuestions = getQuestionsByPhase(i)
      phases[i] = {
        title: `Phase ${i}`,
        questions: phaseQuestions.map((q: Question) => ({
          id: q.id,
          question: q.question,
          answer: answers[q.id] || null,
          required: q.required
        }))
      }
    }

    const totalQuestions = allQuestions.filter((q: Question) => q.required).length
    const answeredQuestions = allQuestions.filter((q: Question) => q.required && answers[q.id]).length

    return {
      phases,
      metadata: {
        totalQuestions,
        answeredQuestions,
        completeness: (answeredQuestions / totalQuestions) * 100
      }
    }
  }
}
