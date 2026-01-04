# 🧪 TESTING GUIDE

## Quick Start - 3 Ways to Test

### 1. 🖥️ **Browser Testing** (Easiest)
Visit: **http://localhost:3000/test-api**

Click "Run All Tests" and watch the results!

### 2. 📜 **Bash Script** (Terminal)
```bash
chmod +x test-api.sh
./test-api.sh
```

### 3. 📦 **Node.js Script**
```bash
node test-api.js
```

---

## Prerequisites

### ✅ Check These First:

1. **Server is running**
```bash
npm run dev
```

2. **GROQ_API_KEY is set**
```bash
# Check .env.local
cat .env.local | grep GROQ_API_KEY
```

3. **Port 3000 is available**
```bash
# If 3000 is taken, use different port
PORT=3001 npm run dev
```

---

## 🎯 Test Method 1: Interactive Browser UI

### Step 1: Start Server
```bash
cd ca-business-planner
npm run dev
```

### Step 2: Open Browser
```
http://localhost:3000/test-api
```

### Step 3: Click "Run All Tests"

You'll see:
- ✅ Real-time test results
- 📊 Pass/fail counts
- 🔍 Detailed responses
- ⏱️ Execution times

**Advantages:**
- Visual feedback
- No command line needed
- Copy/paste responses
- Best for debugging

---

## 🎯 Test Method 2: Bash Script

### Step 1: Make Script Executable
```bash
chmod +x test-api.sh
```

### Step 2: Run Tests
```bash
./test-api.sh
```

### Expected Output:
```
🚀 Business Planner API Testing Script
========================================

Checking if server is running...
✓ Server is running

----------------------------------------

Testing: Create Business Plan
Endpoint: POST /api/v1/business-plan/create
Status Code: 200
✓ PASSED
Response:
{
  "success": true,
  "data": {
    "planId": "uuid-here",
    "sessionId": "uuid-here",
    "synthesis": "...",
    "metrics": { ... }
  }
}

----------------------------------------
...

========================================
📊 Test Summary
========================================
Passed: 7
Failed: 0

🎉 All tests passed!
```

**Advantages:**
- Fast execution
- Automated testing
- JSON formatted output
- Good for CI/CD

---

## 🎯 Test Method 3: Node.js Script

### Step 1: Run Script
```bash
node test-api.js
```

### Expected Output:
Same as bash script but works on all platforms!

**Advantages:**
- Cross-platform (Windows, Mac, Linux)
- No bash required
- Color-coded output
- Easy to customize

---

## 🔍 Manual Testing with cURL

### Test 1: Create Business Plan
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H "Authorization: Bearer demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup",
    "targetMarket": "Small businesses",
    "location": "San Francisco, CA"
  }' | jq
```

### Test 2: List Business Plans
```bash
curl -X GET "http://localhost:3000/api/v1/business-plan/list?limit=10&offset=0" \
  -H "Authorization: Bearer demo-api-key-12345" | jq
```

### Test 3: Get Specific Plan
```bash
# Replace PLAN_ID with actual plan ID from create response
curl -X GET "http://localhost:3000/api/v1/business-plan/PLAN_ID" \
  -H "Authorization: Bearer demo-api-key-12345" | jq
```

### Test 4: Market Analysis
```bash
curl -X POST http://localhost:3000/api/v1/market-analysis \
  -H "Authorization: Bearer demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "SaaS",
    "geography": "United States",
    "targetSegment": "Small businesses"
  }' | jq
```

### Test 5: Financial Model
```bash
curl -X POST http://localhost:3000/api/v1/financial-model \
  -H "Authorization: Bearer demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "TechStartup AI",
    "industry": "SaaS",
    "stage": "startup"
  }' | jq
```

### Test 6: Unauthorized Request (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/business-plan/create \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test"}' | jq
```

Expected: `401 Unauthorized`

---

## 🧪 Testing with Postman

### Step 1: Import Collection

Create new collection with these requests:

**Base URL:** `http://localhost:3000`

**Headers (for all requests):**
```
Authorization: Bearer demo-api-key-12345
Content-Type: application/json
```

### Step 2: Add Requests

1. **Create Business Plan**
   - Method: POST
   - URL: `/api/v1/business-plan/create`
   - Body (raw JSON):
   ```json
   {
     "businessName": "TechStartup AI",
     "industry": "SaaS",
     "stage": "startup",
     "targetMarket": "Small businesses",
     "location": "San Francisco, CA"
   }
   ```

2. **List Plans**
   - Method: GET
   - URL: `/api/v1/business-plan/list?limit=10&offset=0`

3. **Get Plan**
   - Method: GET
   - URL: `/api/v1/business-plan/:id`

4. **Market Analysis**
   - Method: POST
   - URL: `/api/v1/market-analysis`
   - Body:
   ```json
   {
     "industry": "SaaS",
     "geography": "United States",
     "targetSegment": "Small businesses"
   }
   ```

5. **Financial Model**
   - Method: POST
   - URL: `/api/v1/financial-model`
   - Body:
   ```json
   {
     "businessName": "TechStartup AI",
     "industry": "SaaS",
     "stage": "startup"
   }
   ```

---

## 📋 What Each Test Does

### Test 1: Create Business Plan ⏱️ ~10-30 seconds
- Validates input data
- Checks rate limits
- Calls orchestrator with 5+ agents
- Executes financial modeling skills
- Stores in database
- Returns comprehensive business plan

### Test 2: List Business Plans ⏱️ <1 second
- Queries database for user's plans
- Paginates results
- Returns metadata

### Test 3: Get Business Plan ⏱️ <1 second
- Fetches specific plan by ID
- Checks authorization
- Returns full plan details

### Test 4: Market Analysis ⏱️ ~5-15 seconds
- Runs market sizing calculations
- Executes market analyst agent
- Returns TAM/SAM/SOM

### Test 5: Financial Model ⏱️ ~8-20 seconds
- Generates 7-year projections
- Calculates SaaS metrics
- Returns financial model

### Test 6: Unauthorized Request ⏱️ <1 second
- Tests authentication
- Should return 401 error

### Test 7: Rate Limiting ⏱️ ~2 seconds
- Makes rapid requests
- Should trigger 429 error

---

## ✅ Expected Results

### Success Response Format:
```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "sessionId": "uuid",
    "synthesis": "Full AI-generated business plan...",
    "metrics": {
      "executionTime": 15234,
      "agentsUsed": 5,
      "skillsExecuted": ["financial_modeling", "market_sizing"]
    }
  },
  "metadata": {
    "executionTimeMs": 15234,
    "agentsUsed": 5,
    "skillsExecuted": ["financial_modeling"]
  }
}
```

### Error Response Format:
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Missing required field: businessName"
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Server not running"
```bash
# Start server
npm run dev

# Check if running
curl http://localhost:3000
```

### Issue 2: "GROQ_API_KEY not configured"
```bash
# Add to .env.local
echo "GROQ_API_KEY=your_key_here" >> .env.local

# Restart server
# Ctrl+C then npm run dev
```

### Issue 3: "401 Unauthorized"
**Cause:** Missing or invalid API key

**Fix:** Add header:
```bash
-H "Authorization: Bearer demo-api-key-12345"
```

### Issue 4: "429 Too Many Requests"
**Cause:** Rate limit exceeded

**Fix:** Wait 1 minute or increase rate limits in:
`lib/middleware/rate-limit.ts`

### Issue 5: "Agent not found"
**Cause:** Agent YAML files not loaded

**Fix:**
```bash
# Check agent files exist
ls backend/agents/*.yaml

# Should show 13 files
```

### Issue 6: Tests are slow
**Normal:** First request takes 10-30 seconds
- Agent initialization
- LLM API calls
- Skill execution

**Speed up:**
- Use parallel execution (already enabled)
- Reduce number of agents in YAML

### Issue 7: "fetch is not defined" (Node.js)
**Cause:** Node.js < 18

**Fix:**
```bash
# Check version
node --version

# Should be v18+
# If not, upgrade Node.js
```

---

## 📊 Performance Benchmarks

Expected execution times:

| Endpoint | Time | Agents | Skills |
|----------|------|--------|--------|
| Create Business Plan | 10-30s | 5+ | 2-3 |
| List Plans | <1s | 0 | 0 |
| Get Plan | <1s | 0 | 0 |
| Market Analysis | 5-15s | 2-3 | 1 |
| Financial Model | 8-20s | 2-3 | 1 |

---

## 🎯 Advanced Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create artillery.yml
cat > artillery.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Create Business Plan"
    flow:
      - post:
          url: "/api/v1/business-plan/create"
          headers:
            Authorization: "Bearer demo-api-key-12345"
            Content-Type: "application/json"
          json:
            businessName: "Test"
            industry: "SaaS"
            stage: "startup"
            targetMarket: "SMBs"
            location: "SF"
EOF

# Run load test
artillery run artillery.yml
```

### Integration Testing
```bash
# Install jest
npm install --save-dev jest @types/jest

# Create test file
# See tests/api.test.ts (create this)
```

---

## ✨ Next Steps

After testing successfully:

1. **Customize Agents**: Edit YAML files in `/backend/agents/`
2. **Add Authentication**: Replace demo auth with real auth
3. **Setup Database**: Configure MongoDB or Supabase
4. **Deploy**: Use Vercel, Railway, or AWS
5. **Monitor**: Add logging and error tracking

---

## 📞 Support

If tests fail:
1. Check server logs in terminal
2. Verify `.env.local` configuration
3. Ensure all dependencies installed: `npm install`
4. Check agent YAML files exist
5. Verify Groq API key is valid

---

**Happy Testing! 🚀**
