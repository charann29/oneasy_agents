import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function claudeGenerate(prompt: string, maxTokens: number = 16000) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    const firstBlock = message.content[0]
    return firstBlock.type === 'text' ? firstBlock.text : ''
  } catch (error) {
    console.error('Claude error:', error)
    throw error
  }
}
