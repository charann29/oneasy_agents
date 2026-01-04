# 🔑 Getting Your Groq API Key - Quick Guide

## Step 1: Sign In to Groq Console

1. **Open your browser** and go to: https://console.groq.com/keys

2. **Sign in** using one of these options:
   - Google account
   - GitHub account
   - Email
   - SSO

![Groq Login Page](file:///Users/charan/.gemini/antigravity/brain/6078eeab-5d1b-444b-b42e-54dc09520816/groq_login_page_1766860378314.png)

## Step 2: Create an API Key

Once signed in:

1. You'll be on the **API Keys** page
2. Click **"Create API Key"** button
3. Give it a name (e.g., "Business Planner")
4. Copy the generated key (it will look like: `gsk_...`)

⚠️ **Important:** Copy the key immediately - you won't be able to see it again!

## Step 3: Add Key to Your Project

1. Open your `.env.local` file in the project:
   ```
   /Users/charan/Desktop/hype/oneasy/complete business mode copy 2/ca-business-planner/.env.local
   ```

2. Add your Groq API key:
   ```bash
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

3. Save the file

## Step 4: Test the System

Your dev server is already running at `http://localhost:3000`

1. **Open your browser** and navigate to:
   ```
   http://localhost:3000/chat
   ```

2. **Try one of the starter prompts:**
   - "Help me create a business plan for a meal prep service"
   - "Analyze the market for a B2B SaaS product"
   - "Build financial projections for my e-commerce startup"

3. **Watch the magic happen!** You'll see:
   - The orchestrator analyzing your request
   - Multiple agents working together
   - Real business calculations
   - A comprehensive synthesized response

## What to Expect

When you send a message, the system will:

1. **Parse your intent** - Groq analyzes what you need
2. **Select agents** - Chooses the right specialists (financial_modeler, market_analyst, etc.)
3. **Execute skills** - Runs real calculations (financial projections, market sizing, etc.)
4. **Synthesize response** - Combines all outputs into a comprehensive answer

You'll be able to expand the **"View Agent Breakdown"** section to see:
- Which agents were used
- What skills they executed
- How long each agent took
- Individual agent outputs

## Troubleshooting

**If you get an error:**
- Make sure the API key is correct (starts with `gsk_`)
- Check that `.env.local` is in the correct directory
- Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

**Free Tier Limits:**
- Groq offers generous free tier
- 14,400 requests per day
- More than enough for testing!

---

**Need help?** The system is fully built and ready to go - just add your API key and start testing! 🚀
