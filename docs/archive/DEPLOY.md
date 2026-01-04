# DEPLOYMENT GUIDE - PRODUCTION READY

## OPTION 1: Vercel (Recommended - 5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
vercel env add GROQ_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add OPENAI_API_KEY
vercel env add MONGODB_URI
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN

# Deploy to production
vercel --prod
```

## OPTION 2: Railway (For WhatsApp Bot)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

## OPTION 3: Docker (Any Cloud)

```bash
# Build
docker build -t ca-business-planner .

# Run
docker run -p 3000:3000 --env-file .env ca-business-planner
```

## WhatsApp Bot Setup

1. **Twilio Console** (twilio.com/console)
   - Get WhatsApp sandbox number
   - Configure webhook: `https://your-domain.com/api/whatsapp/webhook`
   - Test with: `join <sandbox-code>`

2. **Production WhatsApp**
   - Apply for WhatsApp Business API
   - Get approved number
   - Update TWILIO_WHATSAPP_NUMBER

## MongoDB Setup

1. **MongoDB Atlas** (mongodb.com/cloud/atlas)
   - Create free cluster
   - Get connection string
   - Add to MONGODB_URI

## Environment Variables

Create `.env.local`:
```bash
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NEXTAUTH_SECRET=generate-random-string
NEXTAUTH_URL=https://your-domain.com
```

## Post-Deployment Checklist

✅ Web app accessible
✅ WhatsApp bot responding
✅ Voice transcription working
✅ Database connected
✅ AI suggestions loading
✅ CA dashboard accessible

## Monitoring

- Vercel Analytics (built-in)
- Sentry for error tracking
- MongoDB Atlas monitoring
- Twilio logs for WhatsApp

## Cost Estimate

- Vercel: Free (Hobby) or $20/mo (Pro)
- MongoDB: Free (512MB) or $9/mo (2GB)
- Groq: $0.59 per 1M tokens
- Claude: $3 per 1M tokens
- OpenAI Whisper: $0.006/min
- Twilio WhatsApp: $0.005/message

**Estimated monthly: $50-100 for 1000 users**
