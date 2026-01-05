# 🧪 Claude Agent Executor - Prototype Test Guide

## Overview
This prototype tests if Claude API can successfully execute your agents and skills for document generation.

**What's Being Tested:**
1. ✅ Claude API integration works
2. ✅ Agent YAML definitions load properly
3. ✅ Agent executes through Claude (not Groq)
4. ✅ Skills get invoked via function calling
5. ✅ Results are meaningful and structured

---

## Prerequisites

### 1. Install Anthropic SDK
```bash
cd ca-business-planner
npm install @anthropic-ai/sdk
```

### 2. Set API Key
Add to your `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxx  # Your Claude API key
```

**Get API Key:**
- Go to: https://console.anthropic.com/
- Create account / Login
- Go to "API Keys"
- Create a new key

### 3. Start Development Server
```bash
npm run dev
```

---

## Running the Prototype Test

### Test Endpoint
```
GET http://localhost:3000/api/test-claude-agent
```

### Run the Test

**Option A: Browser**
```
Open: http://localhost:3000/api/test-claude-agent
```

**Option B: cURL**
```bash
curl http://localhost:3000/api/test-claude-agent
```

**Option C: Using fetch (Node.js)**
```bash
node -e "fetch('http://localhost:3000/api/test-claude-agent').then(r=>r.json()).then(console.log)"
```

---

## Expected Results

### ✅ SUCCESS Response
```json
{
  "success": true,
  "message": "✅ PROTOTYPE TEST PASSED",
  "agent": {
    "id": "financial_modeler",
    "name": "Financial Modeler",
    "outputLength": 3500,  // Should be > 1000 characters
    "executionTimeMs": 12500  // Should be < 30 seconds
  },
  "skills": {
    "count": 1,  // Should be > 0 (financial_modeling skill called)
    "called": [
      {
        "skill": "financial_modeling",
        "paramsSize": 450,
        "resultSize": 2500
      }
    ]
  },
  "tokens": {
    "input": 1250,
    "output": 950
  },
  "outputPreview": "# Financial Model for CloudCRM Pro\n\n## Executive Summary...",
  "verification": {
    "agentLoaded": true,
    "skillsCalled": true,
    "meaningfulOutput": true,
    "executionFast": true
  }
}
```

### Key Success Indicators:
- ✅ `success: true`
- ✅ `skills.count > 0` - Skill was invoked
- ✅ `agent.outputLength > 1000` - Meaningful output generated
- ✅ `verification.skillsCalled: true` - Function calling worked
- ✅ Output contains financial projections, numbers, analysis

---

## What's Happening Behind the Scenes

```
1. Test API calls getClaudeAgentExecutor()
   ↓
2. Executor loads 'financial_modeler' agent from YAML
   ↓
3. Builds context from sample questionnaire data
   ↓
4. Calls Claude API with:
   - System Prompt: Agent's persona (from YAML)
   - User Message: Sample business data
   - Tools: financial_modeling skill definition
   ↓
5. Claude analyzes and decides to call financial_modeling skill
   ↓
6. Skill Registry executes the skill (real calculations)
   ↓
7. Results sent back to Claude
   ↓
8. Claude synthesizes final response
   ↓
9. Returns complete financial analysis
```

---

## Troubleshooting

### ❌ Error: "ANTHROPIC_API_KEY is required"
**Solution:** Add API key to `.env` file and restart dev server

### ❌ Error: "Agent not found: financial_modeler"
**Solution:**
```bash
# Check if agent files exist
ls backend/agents/financial_modeler.yaml
```

### ❌ Error: "Skill not found: financial_modeling"
**Solution:**
```bash
# Check if skill implementation exists
ls backend/skills/implementations/financial_modeling.ts
```

### ❌ Skills not being called (count: 0)
**Possible causes:**
- Claude decided not to use tools (check output - it might still be good)
- Tool definitions not properly converted
- Check console logs for details

### ❌ Timeout / Slow execution
**Expected:** 10-25 seconds for first run
**If > 30 seconds:** Check Claude API status or network

---

## Console Output

You should see detailed logs in terminal:
```
🧪 PROTOTYPE TEST: Starting Claude Agent Test...

📋 Sample Data: { business_name: 'CloudCRM Pro', ... }

🤖 Executing financial_modeler agent...

✅ AGENT EXECUTION COMPLETE

📊 Results Summary:
- Agent: Financial Modeler
- Output Length: 3524 characters
- Skills Called: 1
- Execution Time: 12456ms
- Tokens Used: 1234 input, 987 output

🔧 Skills Executed:
  1. financial_modeling
     Params: { revenue_target: 1340000, ... }
     Result: { monthly_revenue: [...], break_even_month: 26, ... }

📄 Agent Output Preview:
# Financial Model for CloudCRM Pro

Based on the provided business data...
```

---

## Next Steps After Successful Test

Once this prototype works (returns `success: true`):

### Phase 2: Build Full Document Generator
1. **Create Document Workflow** (`lib/workflows/document-generation-workflow.ts`)
   - Orchestrate multiple agents (market_analyst, financial_modeler, gtm_strategist)
   - Synthesize outputs into complete documents

2. **Create Document Generators** (one per document type)
   - `lib/generators/business-plan-generator.ts`
   - `lib/generators/financial-model-generator.ts`
   - `lib/generators/pitch-deck-generator.ts`
   - `lib/generators/company-profile-generator.ts`

3. **Replace `/api/generate-documents/route.ts`**
   - Use ClaudeAgentExecutor instead of simple prompts
   - Properly invoke all agents and skills

4. **Test End-to-End**
   - Complete questionnaire
   - Go to `/complete`
   - Generate documents
   - Verify they use agents/skills properly

---

## Verification Checklist

After running test, verify:

- [ ] HTTP 200 response
- [ ] `success: true` in JSON
- [ ] `skills.count > 0` (skill was called)
- [ ] `agent.outputLength > 1000` (meaningful content)
- [ ] Output contains financial terms (revenue, EBITDA, projections)
- [ ] Execution time reasonable (< 30 seconds)
- [ ] No errors in console

---

## Cost Estimate

**Per Test Run:**
- Input tokens: ~1,200 (~$0.015)
- Output tokens: ~1,000 (~$0.075)
- **Total: ~$0.09 per test**

Claude Opus 4.5 pricing:
- Input: $15 per 1M tokens
- Output: $75 per 1M tokens

---

## Questions?

If test fails or you see unexpected behavior:

1. Check console logs (terminal)
2. Check browser console (Network tab)
3. Verify `.env` has `ANTHROPIC_API_KEY`
4. Check agent YAML exists: `backend/agents/financial_modeler.yaml`
5. Check skill exists: `backend/skills/implementations/financial_modeling.ts`

---

## Success Criteria

**✅ Prototype is SUCCESSFUL if:**
1. Test returns HTTP 200
2. JSON has `success: true`
3. At least 1 skill was called
4. Output length > 1000 characters
5. Output contains business/financial terminology
6. Execution completes in < 30 seconds

**If all criteria met → Ready to build full document generation system!**
