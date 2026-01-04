# 🚀 Launch Guide - Get Live in 30 Minutes

## Step 1: Install Dependencies (2 min)

```bash
cd ca-business-planner
npm install
```

## Step 2: Get API Keys (10 min)

### Groq (Free, Ultra-Fast AI)
1. Go to https://console.groq.com
2. Sign up → API Keys → Create
3. Copy your key

### Anthropic Claude (Quality Business Plans)
1. Go to https://console.anthropic.com
2. Sign up → Get API Key
3. Copy your key

### OpenAI (Voice Transcription)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy your key

### MongoDB (Free Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Connect → Drivers → Copy connection string
4. Replace `<password>` with your password

### Twilio WhatsApp (Optional)
1. Go to https://www.twilio.com/console
2. Get Account SID, Auth Token
3. Enable WhatsApp sandbox: https://www.twilio.com/console/sms/whatsapp/sandbox

## Step 3: Configure Environment (2 min)

Create `.env.local`:

```bash
# Required for core functionality
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ca-planner

# Optional for WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Step 4: Test Locally (5 min)

```bash
# Start dev server
npm run dev
```

Visit http://localhost:3000 - You should see the landing page.

### Test APIs:

```bash
# Test AI suggestions
curl -X POST http://localhost:3000/api/ai/suggestions \
  -H "Content-Type: application/json" \
  -d '{"questionId":"business_idea","partialAnswer":"I want to build","userContext":{}}'

# Test session creation
curl -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","channel":"web"}'

# Test WhatsApp webhook (if configured)
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -d "From=whatsapp:+1234567890&Body=Hello"
```

## Step 5: Deploy to Production (10 min)

### Option A: Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

Add environment variables in Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all keys from `.env.local`
3. Redeploy

### Option B: Railway (Good for long-running processes)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Add environment variables:
```bash
railway variables set GROQ_API_KEY=gsk_xxx
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx
railway variables set OPENAI_API_KEY=sk-xxx
railway variables set MONGODB_URI=mongodb+srv://...
```

### Option C: Docker (Most flexible)

```bash
# Build image
docker build -t ca-planner .

# Run container
docker run -p 3000:3000 \
  -e GROQ_API_KEY=gsk_xxx \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  -e OPENAI_API_KEY=sk-xxx \
  -e MONGODB_URI=mongodb+srv://... \
  ca-planner
```

## Step 6: Configure WhatsApp (Optional, 5 min)

1. Go to Twilio Console → WhatsApp → Sandbox
2. Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
3. Method: POST
4. Send test message to your sandbox number

## Post-Launch Checklist

✅ Landing page loads
✅ AI suggestions API responds
✅ Session creation works
✅ MongoDB connection established
✅ WhatsApp webhook responds (if enabled)
✅ Voice transcription works (test with audio file)

## Monitor & Iterate

### Check Logs

**Vercel:**
```bash
vercel logs --follow
```

**Railway:**
```bash
railway logs
```

**Docker:**
```bash
docker logs -f <container-id>
```

### Common Issues

**AI responses slow?**
- Groq should respond in <1s for suggestions
- Claude takes 3-5s for full business plans
- Check API key validity

**MongoDB connection fails?**
- Verify IP whitelist (allow 0.0.0.0/0 for development)
- Check connection string format
- Ensure database user has read/write permissions

**WhatsApp not responding?**
- Verify webhook URL is publicly accessible
- Check Twilio credentials
- Review Twilio logs: https://www.twilio.com/console/monitor/logs

**Voice transcription fails?**
- Ensure audio format is supported (WAV, MP3, M4A)
- Check OpenAI API quota
- Verify file size < 25MB

## Next Steps

Now that core system is live, consider building:

1. **Questionnaire UI** - Interactive form interface for web users
2. **CA Dashboard** - View all client sessions and progress
3. **PDF Generation** - Export business plans as documents
4. **Email Notifications** - Alert users when plan is ready
5. **Analytics** - Track completion rates and user behavior

## Cost Estimates (Starting Out)

- **Groq**: FREE up to 14,400 requests/day
- **Claude**: ~$0.50-2 per business plan (16K tokens)
- **OpenAI Whisper**: ~$0.006 per minute of audio
- **MongoDB**: FREE up to 512MB storage
- **Twilio WhatsApp**: ~$0.005 per message
- **Vercel/Railway**: FREE tier available

**Total cost for first 100 users: ~$50-200 depending on usage**

## Support

- Issues: Create issue in your GitHub repo
- Logs: Check platform-specific logging (Vercel/Railway/Docker)
- API status: Check provider status pages (Groq, Anthropic, OpenAI)
