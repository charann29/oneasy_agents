import { groqChat, groqJSON } from './groq'
import { claudeGenerate } from './claude'

export class AI {
  static async getSuggestions(questionId: string, partial: string, context: any): Promise<string[]> {
    const prompt = `Question: ${questionId}\nPartial: "${partial}"\nGenerate 3 suggestions as JSON array.`
    try {
      return await groqJSON<string[]>(prompt)
    } catch (error) {
      console.error('[AI.getSuggestions] Failed to get suggestions:', error)
      return []
    }
  }

  static async validate(answer: string): Promise<{ valid: boolean; issues: string[]; suggestions: string[] }> {
    const prompt = `Validate: "${answer}"\nReturn JSON: {"valid": true/false, "issues": [], "suggestions": []}`
    try {
      return await groqJSON(prompt)
    } catch (error) {
      console.error('[AI.validate] Validation failed:', error)
      return { valid: true, issues: [], suggestions: [] }
    }
  }

  static async chat(messages: any[]): Promise<string> {
    try {
      return await groqChat(messages)
    } catch (error) {
      console.error('[AI.chat] Chat request failed:', error)
      return "Error processing request."
    }
  }

  static async generatePlan(data: any): Promise<string> {
    const prompt = `Generate business plan from this data (be detailed): ${JSON.stringify(data)}`
    return await claudeGenerate(prompt)
  }
}
