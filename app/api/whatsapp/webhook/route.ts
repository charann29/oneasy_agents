import { NextRequest, NextResponse } from 'next/server'
import { AI } from '@/lib/ai/unified'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    let response = ''

    if (body.toLowerCase() === 'help') {
      response = `📚 Commands:
- Type your answer
- "status" - check progress
- Send voice messages
- Upload documents`
    } else if (body.toLowerCase() === 'status') {
      response = `📊 Progress: 0% complete\nStart your business plan!`
    } else {
      const aiResponse = await AI.chat([
        { role: 'system', content: 'You are a business planning assistant.' },
        { role: 'user', content: body }
      ])
      response = aiResponse
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: response
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
