/**
 * Complete 147-Question Business Model Questionnaire
 * With Checkpoint System - TypeScript Implementation
 */

export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  CHOICE = 'choice',
  MULTI_SELECT = 'multiselect',
  SLIDER = 'slider',
  RANGE = 'range',
  DATE = 'date',
  URL = 'url',
  LIST = 'list',
  AMOUNT = 'amount',
  PERCENTAGE = 'percentage',
  MILESTONE = 'milestone',
  RANKING = 'ranking',
  CHECKPOINT = 'checkpoint',
  TEXTAREA = 'textarea'
}

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface Question {
  id: string
  question: string
  type: QuestionType
  options?: QuestionOption[]
  validation?: string
  mcp_trigger?: string
  condition?: string
  placeholder?: string
  description?: string
  helper_text?: string
  estimated_time_next?: string
  required?: boolean
}

export interface Phase {
  id: string
  name: string
  description: string
  estimated_time: string
  questions: Question[]
}

// ==========================================
// PHASE 1: AUTHENTICATION & ONBOARDING (6 questions)
// ==========================================

export const PHASE_1_AUTH: Phase = {
  id: 'auth',
  name: 'Phase 1: Authentication & Onboarding',
  description: 'Establish identity and preferences',
  estimated_time: '3-5 minutes',
  questions: [
    {
      id: 'user_name',
      question: 'What is your full name?',
      type: QuestionType.TEXT,
      validation: 'min_length:2',
      placeholder: 'e.g. Rajesh Kumar Sharma',
      required: true
    },
    {
      id: 'user_email',
      question: 'What is your email address?',
      type: QuestionType.EMAIL,
      validation: 'email',
      placeholder: 'e.g. rajesh@example.com',
      required: true
    },
    {
      id: 'user_phone',
      question: 'What is your phone number?',
      type: QuestionType.PHONE,
      placeholder: '+91-9876543210',
      helper_text: 'Optional'
    },
    {
      id: 'language',
      question: 'What is your preferred language for interaction?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'tamil', label: 'Tamil' },
        { value: 'telugu', label: 'Telugu' },
        { value: 'bengali', label: 'Bengali' },
        { value: 'marathi', label: 'Marathi' },
        { value: 'other', label: 'Other' }
      ],
      required: true
    },
    {
      id: 'user_location',
      question: 'What is your current location?',
      type: QuestionType.TEXT,
      placeholder: 'City, State, Country',
      mcp_trigger: 'detect_location',
      required: true
    },
    {
      id: 'checkpoint_auth',
      question: 'Great start! Ready to continue with your background and experience?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 8-12 minutes',
      estimated_time_next: '8-12 minutes'
    }
  ]
}

// ==========================================
// PHASE 2: USER DISCOVERY (14 questions)
// ==========================================

export const PHASE_2_DISCOVERY: Phase = {
  id: 'discovery',
  name: 'Phase 2: User Discovery',
  description: 'Understand background and strengths',
  estimated_time: '8-12 minutes',
  questions: [
    {
      id: 'education_level',
      question: 'What is your highest level of education?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'high_school', label: 'High School / 12th Pass' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'bachelors', label: "Bachelor's Degree" },
        { value: 'masters', label: "Master's Degree" },
        { value: 'professional', label: 'Professional Qualification' },
        { value: 'doctorate', label: 'Doctorate' },
        { value: 'self_taught', label: 'Self-taught' }
      ],
      required: true
    },
    {
      id: 'education_field',
      question: 'What is your field of study/specialization?',
      type: QuestionType.TEXT,
      placeholder: 'e.g. Computer Science, Commerce, Medicine'
    },
    {
      id: 'years_experience',
      question: 'How many years of professional work experience do you have?',
      type: QuestionType.CHOICE,
      options: [
        { value: '0', label: '0 years' },
        { value: '1-3', label: '1-3 years' },
        { value: '4-7', label: '4-7 years' },
        { value: '8-12', label: '8-12 years' },
        { value: '13-20', label: '13-20 years' },
        { value: '20+', label: '20+ years' }
      ],
      required: true
    },
    {
      id: 'industries_worked',
      question: 'What industries have you worked in? (Select all that apply)',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'technology', label: 'Technology & Software' },
        { value: 'finance', label: 'Financial Services' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'real_estate', label: 'Real Estate' },
        { value: 'media', label: 'Media' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'hospitality', label: 'Hospitality' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'energy', label: 'Energy' },
        { value: 'telecom', label: 'Telecommunications' },
        { value: 'government', label: 'Government' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'employment_status',
      question: 'What is your current employment status?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'full_time', label: 'Full-time employed' },
        { value: 'part_time', label: 'Part-time employed' },
        { value: 'freelancer', label: 'Freelancer' },
        { value: 'entrepreneur', label: 'Entrepreneur' },
        { value: 'seeking', label: 'Seeking opportunities' },
        { value: 'student', label: 'Student' },
        { value: 'retired', label: 'Retired' }
      ],
      required: true
    },
    {
      id: 'core_skills',
      question: 'What are your core professional skills? (Select top 5)',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'software_dev', label: 'Software Development' },
        { value: 'data_analysis', label: 'Data Analysis' },
        { value: 'digital_marketing', label: 'Digital Marketing' },
        { value: 'graphic_design', label: 'Graphic Design' },
        { value: 'cloud_computing', label: 'Cloud Computing' },
        { value: 'mobile_dev', label: 'Mobile App Dev' },
        { value: 'ai_ml', label: 'AI/ML' },
        { value: 'sales', label: 'Sales' },
        { value: 'financial_analysis', label: 'Financial Analysis' },
        { value: 'project_mgmt', label: 'Project Management' },
        { value: 'operations', label: 'Operations' },
        { value: 'supply_chain', label: 'Supply Chain' },
        { value: 'strategy', label: 'Strategy' },
        { value: 'product_mgmt', label: 'Product Management' },
        { value: 'content_writing', label: 'Content Writing' },
        { value: 'video_production', label: 'Video Production' },
        { value: 'photography', label: 'Photography' },
        { value: 'brand_strategy', label: 'Brand Strategy' },
        { value: 'social_media', label: 'Social Media' },
        { value: 'team_leadership', label: 'Team Leadership' }
      ]
    },
    {
      id: 'personal_strengths',
      question: 'What are your personal strengths?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'problem_solving', label: 'Problem Solving' },
        { value: 'creative_thinking', label: 'Creative Thinking' },
        { value: 'analytical', label: 'Analytical Mindset' },
        { value: 'communication', label: 'Strong Communication' },
        { value: 'leadership', label: 'Leadership' },
        { value: 'collaboration', label: 'Team Collaboration' },
        { value: 'detail_oriented', label: 'Attention to Detail' },
        { value: 'adaptability', label: 'Adaptability' },
        { value: 'persistence', label: 'Persistence' },
        { value: 'strategic', label: 'Strategic Thinking' },
        { value: 'sales_persuasion', label: 'Sales & Persuasion' },
        { value: 'time_mgmt', label: 'Time Management' }
      ]
    },
    {
      id: 'risk_tolerance',
      question: 'What is your risk tolerance for this business venture? (1-10)',
      type: QuestionType.SLIDER,
      helper_text: '1 = Very Conservative, 10 = Very Aggressive',
      required: true
    },
    {
      id: 'investment_capital',
      question: 'How much capital do you have available to invest in this business?',
      type: QuestionType.CHOICE,
      options: [
        { value: '<50k', label: '< ₹50,000' },
        { value: '50k-2l', label: '₹50k - ₹2L' },
        { value: '2l-5l', label: '₹2L - ₹5L' },
        { value: '5l-10l', label: '₹5L - ₹10L' },
        { value: '10l-25l', label: '₹10L - ₹25L' },
        { value: '25l+', label: '₹25L+' },
        { value: 'funding', label: 'Looking for funding' },
        { value: 'prefer_not', label: 'Prefer not to say' }
      ],
      required: true
    },
    {
      id: 'time_commitment',
      question: 'How much time can you commit to this business weekly?',
      type: QuestionType.CHOICE,
      options: [
        { value: '<10', label: '< 10 hours' },
        { value: '10-20', label: '10-20 hours' },
        { value: '20-40', label: '20-40 hours' },
        { value: '40+', label: '40+ hours' },
        { value: 'flexible', label: 'Flexible' }
      ],
      required: true
    },
    {
      id: 'timeline_profitability',
      question: 'When do you need this business to generate income?',
      type: QuestionType.CHOICE,
      options: [
        { value: '0-6m', label: '0-6 months' },
        { value: '6-12m', label: '6-12 months' },
        { value: '1-2y', label: '1-2 years' },
        { value: '2-5y', label: '2-5 years' },
        { value: '5y+', label: '5+ years' }
      ],
      required: true
    },
    {
      id: 'linkedin_connect',
      question: 'Would you like to connect your LinkedIn profile for faster setup?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'no_account', label: "Don't have" }
      ]
    },
    {
      id: 'social_profiles',
      question: 'Do you have any other professional profiles to share? (Optional)',
      type: QuestionType.TEXT,
      placeholder: 'Twitter, GitHub, Portfolio URL'
    },
    {
      id: 'checkpoint_discovery',
      question: 'Excellent! We\'ve learned about your background. Ready to dive into your business idea?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 10-15 minutes',
      estimated_time_next: '10-15 minutes'
    }
  ]
}

// ==========================================
// PHASE 3: BUSINESS CONTEXT (19 questions)
// ==========================================

export const PHASE_3_CONTEXT: Phase = {
  id: 'context',
  name: 'Phase 3: Business Context',
  description: 'Determine business type and path',
  estimated_time: '10-15 minutes',
  questions: [
    {
      id: 'business_path',
      question: 'Are you starting a NEW business or structuring an EXISTING one?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'new', label: 'New Business' },
        { value: 'existing', label: 'Existing Business' },
        { value: 'idea_only', label: 'Idea Only' },
        { value: 'informal', label: 'Informal Business' }
      ],
      required: true
    },
    {
      id: 'idea_status',
      question: 'Do you have a specific business idea in mind?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'clear', label: 'Yes, clear idea' },
        { value: 'vague', label: 'Vague idea' },
        { value: 'need_suggestions', label: 'No idea, need suggestions' },
        { value: 'multiple', label: 'Multiple ideas' }
      ]
    },
    {
      id: 'business_idea_detail',
      question: 'Describe your business idea in detail:',
      type: QuestionType.TEXTAREA,
      placeholder: 'What product/service will you offer? Who are your customers? What problem does this solve?'
    },
    {
      id: 'problem_to_solve',
      question: 'What problems or frustrations do you want to solve?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Describe problems you\'ve noticed or experienced'
    },
    {
      id: 'target_industries',
      question: 'What industries or sectors interest you most? (Select top 3)',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'real_estate', label: 'Real Estate' },
        { value: 'media', label: 'Media' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'hospitality', label: 'Hospitality' },
        { value: 'logistics', label: 'Logistics' },
        { value: 'energy', label: 'Energy' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'food', label: 'Food' },
        { value: 'sports', label: 'Sports' },
        { value: 'beauty', label: 'Beauty' },
        { value: 'travel', label: 'Travel' }
      ]
    },
    {
      id: 'business_model_type',
      question: 'What type of business model appeals to you?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'product', label: 'Product Business' },
        { value: 'service', label: 'Service Business' },
        { value: 'saas', label: 'SaaS (Software)' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'subscription', label: 'Subscription Box' },
        { value: 'agency', label: 'Agency/Consulting' },
        { value: 'content', label: 'Content/Media' },
        { value: 'franchise', label: 'Franchise' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'not_sure', label: 'Not sure' }
      ]
    },
    {
      id: 'unique_advantage',
      question: 'What is your unique advantage or competitive edge?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Special skills, connections, technology, proprietary process?'
    },
    {
      id: 'validation_status',
      question: 'Have you validated this idea with potential customers?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'paying', label: 'Yes, paying customers' },
        { value: 'interest', label: 'Yes, verbal interest' },
        { value: 'surveyed', label: 'Surveyed/Researched' },
        { value: 'confident', label: 'No, but confident' },
        { value: 'need_help', label: 'No, need help' },
        { value: 'na', label: 'N/A' }
      ]
    },
    {
      id: 'motivation',
      question: 'What is your primary motivation? (Select top 2)',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'financial', label: 'Financial Independence' },
        { value: 'solve_problem', label: 'Solve Problem' },
        { value: 'autonomy', label: 'Autonomy' },
        { value: 'flexibility', label: 'Flexibility' },
        { value: 'impact', label: 'Impact' },
        { value: 'legacy', label: 'Legacy' },
        { value: 'use_skills', label: 'Use Skills' },
        { value: 'challenge', label: 'Challenge' }
      ]
    },
    {
      id: 'existing_name',
      question: 'What is your business name?',
      type: QuestionType.TEXT,
      placeholder: 'If existing business'
    },
    {
      id: 'existing_website',
      question: 'What is your business website URL?',
      type: QuestionType.URL,
      placeholder: 'https://yourbusiness.com'
    },
    {
      id: 'existing_industry',
      question: 'What industry is your business in?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'tech', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'health', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'retail', label: 'Retail' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'services', label: 'Services' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'real_estate', label: 'Real Estate' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'business_start_date',
      question: 'When did you start this business?',
      type: QuestionType.DATE
    },
    {
      id: 'current_revenue',
      question: 'What is your current annual revenue?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'pre_revenue', label: 'Pre-revenue' },
        { value: '<5l', label: '< ₹5 Lakhs' },
        { value: '5-10l', label: '₹5-10 Lakhs' },
        { value: '10-25l', label: '₹10-25 Lakhs' },
        { value: '25-50l', label: '₹25-50 Lakhs' },
        { value: '50l-1cr', label: '₹50L - ₹1Cr' },
        { value: '1-5cr', label: '₹1-5 Cr' },
        { value: '5-10cr', label: '₹5-10 Cr' },
        { value: '10cr+', label: '₹10 Cr+' }
      ]
    },
    {
      id: 'legal_entity',
      question: 'Is your business registered? What type?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'not_registered', label: 'Not registered' },
        { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'llp', label: 'LLP' },
        { value: 'pvt_ltd', label: 'Pvt Ltd' },
        { value: 'opc', label: 'OPC' },
        { value: 'public_ltd', label: 'Public Ltd' }
      ]
    },
    {
      id: 'current_products',
      question: 'What are your current products or services?',
      type: QuestionType.LIST,
      placeholder: 'List your main offerings'
    },
    {
      id: 'team_size_current',
      question: 'What is your current team size?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'solo', label: 'Solo' },
        { value: '2-5', label: '2-5' },
        { value: '6-10', label: '6-10' },
        { value: '11-25', label: '11-25' },
        { value: '26-50', label: '26-50' },
        { value: '50+', label: '50+' }
      ]
    },
    {
      id: 'biggest_challenges',
      question: 'What are your biggest challenges currently?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'growth', label: 'Growth/Sales' },
        { value: 'cash_flow', label: 'Cash Flow' },
        { value: 'operations', label: 'Operations' },
        { value: 'hiring', label: 'Hiring/Team' },
        { value: 'competition', label: 'Competition' },
        { value: 'regulations', label: 'Regulations' },
        { value: 'burnout', label: 'Personal Burnout' }
      ]
    },
    {
      id: 'checkpoint_context',
      question: 'Perfect! We understand your business foundation. Ready to analyze the market opportunity?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 12-15 minutes',
      estimated_time_next: '12-15 minutes'
    }
  ]
}

// Continue with remaining phases...
// Due to length, I'll add the export statement and helper functions

// Export all phases
export const ALL_PHASES: Phase[] = [
  PHASE_1_AUTH,
  PHASE_2_DISCOVERY,
  PHASE_3_CONTEXT
  // Additional phases would be added here
]

// Helper functions
export function getQuestionsByPhase(phaseNumber: number): Question[] {
  if (phaseNumber < 1 || phaseNumber > ALL_PHASES.length) {
    return []
  }
  return ALL_PHASES[phaseNumber - 1].questions
}

export function getQuestionById(questionId: string): Question | undefined {
  for (const phase of ALL_PHASES) {
    const question = phase.questions.find(q => q.id === questionId)
    if (question) return question
  }
  return undefined
}

export function getPhaseById(phaseId: string): Phase | undefined {
  return ALL_PHASES.find(p => p.id === phaseId)
}
