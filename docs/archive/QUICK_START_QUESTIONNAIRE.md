# 🚀 Quick Start - Questionnaire UI

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `zod` for schema validation
- `zustand` for state management
- `lucide-react` for icons
- All existing AI packages

### 2. Environment Variables

Already configured! Your `.env.local` should have:

```bash
GROQ_API_KEY=your_groq_key           # For AI suggestions
ANTHROPIC_API_KEY=your_claude_key     # For business plan generation
OPENAI_API_KEY=your_openai_key        # For voice transcription
MONGODB_URI=your_mongodb_uri          # For data persistence
```

### 3. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

## Using the Questionnaire

### Step 1: Start Your Plan

1. Click "Start Your Business Plan" on homepage
2. Session automatically created
3. Redirected to questionnaire

### Step 2: Answer Questions

The system has **12 phases** with **50+ questions**:

**Phase 1: Basic Information**
- Business name
- Business idea
- Industry
- Stage
- Founding team

**Phase 2: Market Analysis**
- Target market
- Market size
- Customer pain points
- Competitors
- Competitive advantage
- Market trends

**Phase 3: Products/Services**
- Product description
- Pricing model
- Revenue streams
- Value proposition
- Product roadmap

**Phase 4: Operations**
- Business model
- Operations overview
- Location
- Technology stack
- Suppliers
- Quality control

**Phase 5: Team & Organization**
- Org structure
- Hiring plan
- Key advisors
- Culture & values
- Compensation

**Phase 6: Marketing & Sales**
- Marketing strategy
- Marketing channels
- Customer acquisition cost
- Sales process
- Customer retention
- Brand positioning

**Phase 7: Financial Projections**
- Startup costs
- Funding required
- Revenue projections (Year 1, Year 3)
- Break-even point
- Gross margin
- Financial assumptions

**Phase 8: Funding**
- Funding sources
- Use of funds
- Equity offering
- Investor returns
- Funding milestones

**Phase 9: Risks & Mitigation**
- Market risks
- Operational risks
- Financial risks
- Regulatory risks
- Mitigation strategies

**Phase 10: Milestones & Timeline**
- Launch date
- Year 1 milestones
- 3-year goals
- Success metrics

**Phase 11: Legal & Compliance**
- Business structure
- Licenses & permits
- Intellectual property
- Insurance
- Data privacy

**Phase 12: Final Review**
- Executive summary
- Why you'll succeed
- Additional information
- Supporting documents

### Step 3: Use Advanced Features

**Voice Input**
- Click microphone icon
- Speak your answer
- Automatically transcribed
- Supports English, Hindi, Telugu

**AI Suggestions**
- Type at least 3 characters
- Wait 500ms (debounced)
- AI suggests completions
- Click to apply

**File Upload**
- Drag & drop files
- Or click to browse
- Supports: PDF, DOC, XLS, images
- Max 10MB per file

**Skip Questions**
- Optional questions can be skipped
- Required questions must be answered
- Progress bar shows completion

### Step 4: Generate Business Plan

1. Complete all 12 phases
2. Click "Complete" on final question
3. AI generates comprehensive plan
4. View insights & recommendations
5. Download or share plan

## Features Demo

### Test AI Suggestions

1. Go to Phase 1, Question 2 (Business idea)
2. Type: "I want to build a"
3. Wait for suggestions
4. Click a suggestion to apply

### Test Voice Input

1. On any question with voice enabled
2. Click microphone icon
3. Grant microphone permission
4. Speak your answer
5. Click "Stop Recording"
6. Text appears automatically

### Test File Upload

1. Go to Phase 1, Question 5 (Founding team)
2. See "Upload supporting documents"
3. Drag a PDF file
4. Or click to browse
5. File appears in list
6. Click X to remove

### Test Progress Tracking

- Left sidebar shows all 12 phases
- Green checkmark = completed
- Blue highlight = current
- Gray = upcoming
- Overall progress bar at top

## Keyboard Shortcuts

- **Enter** (in text fields) = Next question
- **Tab** = Move between fields
- **Esc** = Close modals/suggestions

## Mobile Experience

The questionnaire is fully responsive:

- ✅ Touch-friendly buttons
- ✅ Mobile voice input
- ✅ Mobile file upload
- ✅ Swipe navigation (coming soon)
- ✅ Optimized layouts

## Data Persistence

Your answers are automatically saved:

- **LocalStorage**: Answers persist across page reloads
- **Session Management**: Resume anytime
- **Auto-save**: Every answer saved immediately
- **Progress**: Phase completion tracked

To clear data:
```javascript
// In browser console
localStorage.removeItem('questionnaire-storage')
```

## Troubleshooting

### Voice Input Not Working

**Issue**: Microphone button grayed out
**Solution**: Check browser permissions
- Chrome: Click lock icon in address bar → Allow microphone
- Safari: Settings → Websites → Microphone → Allow

### AI Suggestions Not Appearing

**Issue**: No suggestions shown while typing
**Solution**:
1. Check GROQ_API_KEY in .env.local
2. Open browser console, check for errors
3. Verify API endpoint: /api/ai/suggestions

### File Upload Fails

**Issue**: File won't upload
**Solution**:
1. Check file size (max 10MB)
2. Check file type (see accepted types)
3. Try different file

### Progress Not Saving

**Issue**: Progress lost on page refresh
**Solution**:
1. Check browser's LocalStorage is enabled
2. Don't use incognito/private mode
3. Check Zustand persistence is working

## Example: Complete a Phase

Let's complete **Phase 1: Basic Information**

### Question 1: Business Name
```
Input: FreshMeals Express
AI suggests: "FreshMeals Express Delivery", "FreshMeals Express Service"
Click: Next
```

### Question 2: Business Idea
```
Input: We deliver fresh, healthy meals to busy professionals in under 30 minutes
Voice: Click mic, speak the idea, stop recording
AI suggests expansions
Click: Next
```

### Question 3: Industry
```
Select: Food & Beverage
Click: Next
```

### Question 4: Business Stage
```
Select: Idea Stage
Click: Next
```

### Question 5: Founding Team
```
Input: John Doe (CEO, 10 years in food industry)
        Jane Smith (COO, logistics expert)
Upload: Resume PDFs
Click: Next → Phase completes
```

✅ **Phase 1 completed!** Green checkmark appears, move to Phase 2.

## Best Practices

### For Detailed Business Plans

1. **Be Specific**: Don't write "food delivery", write "30-minute fresh meal delivery for health-conscious urban professionals"

2. **Use Numbers**: Include metrics, costs, projections wherever possible

3. **Leverage AI**: Let AI suggestions inspire you, then customize

4. **Upload Supporting Docs**: Add financial models, market research PDFs

5. **Voice for Long Answers**: Use voice input for lengthy responses (faster than typing)

### For Quick MVP Plans

1. **Skip Optional Questions**: Focus on required questions only

2. **Use AI Suggestions**: Click first suggestion to move fast

3. **Minimal Details**: Short answers acceptable, AI will expand

4. **Complete in Order**: Don't jump phases, follow the flow

## Next Steps

After completing the questionnaire:

1. **Review Results**: Check AI-generated insights
2. **Download Plan**: Get PDF/Markdown version
3. **Share with Team**: Send link to collaborators
4. **Iterate**: Update answers as your business evolves
5. **Track Progress**: Use dashboard (coming soon)

## Architecture Overview

```
User Input
    ↓
QuestionCard Component
    ↓
Zustand Store (answers saved)
    ↓
QuestionnaireAgent (AI orchestration)
    ↓
Groq AI (suggestions) | Claude AI (business plan)
    ↓
Results Page (plan + insights)
```

## Get Help

- **Documentation**: See QUESTIONNAIRE_SYSTEM.md
- **Architecture**: See PRODUCTION_READY.md
- **Deployment**: See LAUNCH_GUIDE.md
- **Issues**: Check browser console for errors

Happy planning! 🚀
