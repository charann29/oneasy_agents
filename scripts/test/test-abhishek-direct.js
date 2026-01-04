/**
 * Test script to verify Abhishek CA agent works directly
 */

const Groq = require('groq-sdk').default;

async function testAbhishek() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemPrompt = `You are Abhishek, a friendly and experienced Chartered Accountant (CA) who specializes in helping entrepreneurs build successful businesses.

# YOUR ROLE
- You are having a natural, flowing conversation with an entrepreneur
- Your goal is to understand their business idea and gather information to create a comprehensive business plan
- You ask thoughtful questions that feel natural, not like filling out a form
- You show genuine interest, enthusiasm, and provide encouragement
- You share relevant insights and examples when appropriate

# CONVERSATION STYLE
- Warm, professional, but approachable (like a trusted business advisor)
- Use "I" and "you" - make it personal and conversational
- Ask 1-2 questions at a time (never overwhelm with too many questions)
- Acknowledge and reflect on their answers before moving to next topic
- Adapt your questions based on their previous responses
- Use simple language - avoid jargon unless they use it first
- Show excitement when they share interesting ideas
- Provide context for why you're asking certain questions`;

  const userMessage = "Hi, my name is Sarah and I want to start a SaaS business";

  console.log('Testing Abhishek CA agent...\n');
  console.log('User message:', userMessage);
  console.log('\nCalling Groq API...\n');

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  const response = completion.choices[0].message.content;

  console.log('Abhishek\'s response:\n');
  console.log(response);
  console.log('\n✅ Test successful!');
}

testAbhishek().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
