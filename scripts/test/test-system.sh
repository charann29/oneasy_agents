#!/bin/bash

# Test Document Generation End-to-End
# This script tests the complete flow

echo "🧪 Testing Document Generation System"
echo "======================================"
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules/puppeteer" ]; then
    echo "  ✓ puppeteer installed"
else
    echo "  ✗ puppeteer missing - installing..."
    npm install puppeteer
fi

if [ -d "node_modules/docx" ]; then
    echo "  ✓ docx installed"
else
    echo "  ✗ docx missing - installing..."
    npm install docx
fi

if [ -d "node_modules/pptxgenjs" ]; then
    echo "  ✓ pptxgenjs installed"
else
    echo "  ✗ pptxgenjs missing - installing..."
    npm install pptxgenjs
fi

if [ -d "node_modules/archiver" ]; then
    echo "  ✓ archiver installed"
else
    echo "  ✗ archiver missing - installing..."
    npm install archiver
fi

if [ -d "node_modules/markdown-it" ]; then
    echo "  ✓ markdown-it installed"
else
    echo "  ✗ markdown-it missing - installing..."
    npm install markdown-it
fi

if [ -d "node_modules/react-markdown" ]; then
    echo "  ✓ react-markdown installed"
else
    echo "  ✗ react-markdown missing - installing..."
    npm install react-markdown
fi

echo ""
echo "✓ All dependencies installed!"
echo ""

# Check if dev server is running
echo "📡 Checking dev server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "  ✓ Dev server is running on port 3000"
else
    echo "  ✗ Dev server not running!"
    echo "  → Please run: npm run dev"
    exit 1
fi

echo ""
echo "✅ System is ready!"
echo ""
echo "📋 Test the complete flow:"
echo "  1. Open http://localhost:3000/questionnaire-chat"
echo "  2. Complete the questionnaire (or use saved state)"
echo "  3. Navigate to /complete"
echo "  4. Click 'Generate My Business Plan'"
echo "  5. Download documents from /results"
echo ""
echo "✨ Happy testing!"
