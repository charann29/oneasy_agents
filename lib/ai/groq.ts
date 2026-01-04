import Groq from 'groq-sdk'

// Lazy initialization to avoid build-time errors when env vars are missing
let _groq: Groq | null = null
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  }
  return _groq
}


// Groq message type
interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function groqChat(messages: GroqMessage[], options: { temperature?: number; maxTokens?: number } = {}) {
  try {
    const groq = getGroq()
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-405b-reasoning',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    })
    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Groq error:', error)
    throw error
  }
}

export async function groqJSON<T>(prompt: string): Promise<T> {
  try {
    const groq = getGroq()
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: 'Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
    return JSON.parse(response.choices[0]?.message?.content || '{}')
  } catch (error) {
    console.error('Groq JSON error:', error)
    return {} as T
  }
}
