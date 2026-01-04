# 🚀 QUICK START GUIDE

## Get Your Business Planner API Running in 5 Minutes!

---

## ✅ Prerequisites

- Node.js 18+ installed
- Groq API key (get free at [groq.com](https://groq.com))
- Terminal/command line access

---

## 📝 Step-by-Step Setup

### 1. Navigate to Project Directory
```bash
cd ca-business-planner
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- Next.js 14
- TypeScript
- Groq SDK
- All other dependencies

### 3. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your favorite editor
nano .env.local  # or code .env.local or vim .env.local
```

**Required Configuration**:
```bash
# REQUIRED: Your Groq API key
GROQ_API_KEY=gsk_your_actual_api_key_here

# Optional: Database (leave empty to use in-memory storage)
# MONGODB_URI=mongodb://localhost:27017/business_planner

# Optional: Frontend API key (can use demo key for development)
# NEXT_PUBLIC_API_KEY=demo-api-key-12345
```

### 4. Start Development Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## 🧪 Test Your Setup

### Test 1: Health Check
Open your browser:
```
http://localhost:3000
```

You should see your application home page.

### Test 2: API Test with cURL
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H "Authorization: Bearer demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup",
    "targetMarket": "Small businesses in North America",
    "location": "San Francisco, CA",
    "description": "AI-powered business automation platform"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "planId": "uuid-here",
    "sessionId": "uuid-here",
    "synthesis": "Based on comprehensive analysis...",
    "metrics": {
      "executionTime": 15234,
      "agentsUsed": 5,
      "skillsExecuted": ["financial_modeling", "market_sizing"]
    }
  }
}
```

### Test 3: Use Example UI
Visit:
```
http://localhost:3000/examples/business-planner
```

Try creating a business plan through the UI!

---

## 📱 Frontend Integration Examples

### Example 1: Simple React Component

Create a new file: `app/my-test/page.tsx`

```typescript
'use client';

import { useCreateBusinessPlan } from '@/lib/hooks/use-business-planner';

export default function TestPage() {
  const { createPlan, loading, error, data } = useCreateBusinessPlan();

  const handleCreate = async () => {
    await createPlan({
      businessName: 'My Test Business',
      industry: 'SaaS',
      stage: 'startup',
      targetMarket: 'Small businesses',
      location: 'New York, NY'
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Business Plan API</h1>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Creating...' : 'Create Business Plan'}
      </button>

      {error && <p className="text-red-600 mt-4">Error: {error}</p>}

      {data && (
        <div className="mt-4 p-4 bg-green-50 border rounded">
          <p className="font-semibold">Success!</p>
          <p className="text-sm">Plan ID: {data.planId}</p>
          <p className="text-sm mt-2">{data.synthesis.substring(0, 200)}...</p>
        </div>
      )}
    </div>
  );
}
```

Visit: `http://localhost:3000/my-test`

### Example 2: Direct API Call (No Hooks)

```typescript
import { BusinessPlannerAPI } from '@/lib/hooks/use-business-planner';

async function myFunction() {
  try {
    const result = await BusinessPlannerAPI.createBusinessPlan({
      businessName: 'My Business',
      industry: 'SaaS',
      stage: 'startup',
      targetMarket: 'SMBs',
      location: 'San Francisco'
    });

    console.log('Plan created:', result.planId);
    console.log('Summary:', result.synthesis);
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

---

## 🔑 API Endpoints Reference

Base URL: `http://localhost:3000/api/v1`

### Create Business Plan
```
POST /business-plan/create
Headers: Authorization: Bearer demo-api-key-12345
Body: { businessName, industry, stage, targetMarket, location }
```

### Get Business Plan
```
GET /business-plan/:id
Headers: Authorization: Bearer demo-api-key-12345
```

### List Business Plans
```
GET /business-plan/list?limit=10&offset=0
Headers: Authorization: Bearer demo-api-key-12345
```

### Market Analysis
```
POST /market-analysis
Headers: Authorization: Bearer demo-api-key-12345
Body: { industry, geography, targetSegment }
```

### Financial Model
```
POST /financial-model
Headers: Authorization: Bearer demo-api-key-12345
Body: { businessName, industry, stage }
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "GROQ_API_KEY not configured"
**Solution**: Make sure you've added your Groq API key to `.env.local`:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

Then restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue 2: "Port 3000 already in use"
**Solution**: Kill the process using port 3000 or use a different port:
```bash
# Use different port
PORT=3001 npm run dev
```

### Issue 3: "Module not found" errors
**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Rate limit errors
**Solution**: Rate limits are per API key. For development:
1. Use the demo key (rate limits reset every minute/hour)
2. Or create additional API keys in `/lib/middleware/auth.ts`

### Issue 5: "Agent not found" errors
**Solution**: Make sure all agent YAML files are in `/backend/agents/`:
```bash
ls backend/agents/*.yaml
# Should show 13 agent files
```

---

## 📊 Understanding the Response

When you create a business plan, you get:

```json
{
  "success": true,
  "data": {
    "planId": "uuid",           // Unique plan identifier
    "sessionId": "uuid",         // Processing session ID
    "synthesis": "...",          // AI-generated business plan
    "metrics": {
      "executionTime": 15234,    // Milliseconds
      "agentsUsed": 5,           // Number of agents involved
      "skillsExecuted": [...]    // Computational skills used
    }
  },
  "metadata": {
    "executionTimeMs": 15234,
    "agentsUsed": 5,
    "skillsExecuted": ["financial_modeling", "market_sizing"]
  }
}
```

---

## 🎯 Next Steps After Setup

### For Development
1. **Explore the Example UI**: `http://localhost:3000/examples/business-planner`
2. **Read the Architecture**: See `ARCHITECTURE.md`
3. **Customize Agents**: Edit YAML files in `/backend/agents/`
4. **Add Custom Skills**: Create new skills in `/backend/skills/implementations/`

### For Production
1. **Setup Database**: Configure MongoDB or Supabase in `.env.local`
2. **Replace Demo Auth**: Implement real authentication (NextAuth.js)
3. **Deploy**: Use Vercel, Railway, or AWS
4. **Monitor**: Add logging and error tracking

---

## 📚 Additional Resources

- **Architecture Guide**: `ARCHITECTURE.md` - Detailed system design
- **API Documentation**: Check `/app/api/v1/*/route.ts` files
- **Agent Definitions**: See `/backend/agents/*.yaml`
- **Skills Implementation**: Check `/backend/skills/implementations/`

---

## 🆘 Need Help?

### Check Logs
The application logs everything to console:
```bash
# Watch logs in terminal where you ran npm run dev
```

### Debug Mode
Enable verbose logging in `backend/utils/logger.ts`

### Common Questions

**Q: How do I add a new agent?**
A: Create a new YAML file in `/backend/agents/` following the existing format.

**Q: How do I customize the business plan output?**
A: Edit agent system prompts in the YAML files.

**Q: How do I add authentication?**
A: Replace the demo auth in `/lib/middleware/auth.ts` with NextAuth.js or your preferred solution.

**Q: How do I use a different LLM?**
A: Modify the orchestrator to use Claude or OpenAI instead of Groq in `/backend/orchestrator/index.ts`.

**Q: How much does it cost per business plan?**
A: Depends on LLM used. With Groq (Llama 3.3 70B): ~$0.10-0.20 per plan.

---

## 🎉 You're Ready!

Your business planner API is now running. Start building amazing business planning applications!

**Happy Coding! 🚀**
