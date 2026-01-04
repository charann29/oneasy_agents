#!/bin/bash

echo "🚀 CA BUSINESS PLANNER - COMPLETE DEPLOYMENT SETUP"
echo "=================================================="
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create .env.local if doesn't exist
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local - PLEASE UPDATE WITH YOUR API KEYS"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "NEXT STEPS:"
echo "==========="
echo "1. Update .env.local with your API keys:"
echo "   - GROQ_API_KEY (get from console.groq.com)"
echo "   - ANTHROPIC_API_KEY (get from console.anthropic.com)"
echo "   - OPENAI_API_KEY (get from platform.openai.com)"
echo "   - MONGODB_URI (get from mongodb.com/atlas)"
echo "   - TWILIO credentials (get from twilio.com)"
echo ""
echo "2. Run development server:"
echo "   npm run dev"
echo ""
echo "3. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "📚 See DEPLOY.md for detailed deployment instructions"
echo ""
