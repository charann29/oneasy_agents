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
  TEXTAREA = 'textarea',
  PERCENTAGE_BREAKDOWN = 'percentage_breakdown'
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
      id: 'language',
      question: 'Which language would you like to take this conversation in?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'en-US', label: 'English' },
        { value: 'hi-IN', label: 'Hindi' },
        { value: 'te-IN', label: 'Telugu' },
        { value: 'ta-IN', label: 'Tamil' },
        { value: 'kn-IN', label: 'Kannada' },
        { value: 'ml-IN', label: 'Malayalam' },
        { value: 'mr-IN', label: 'Marathi' },
        { value: 'bn-IN', label: 'Bengali' },
        { value: 'gu-IN', label: 'Gujarati' },
        { value: 'other', label: 'Other' }
      ],
      required: true
    },
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
      ],
      condition: "context.business_path != 'existing'"
    },
    {
      id: 'business_idea_detail',
      question: 'Describe your business idea in detail:',
      type: QuestionType.TEXTAREA,
      placeholder: 'What product/service will you offer? Who are your customers? What problem does this solve?',
      condition: "context.business_path != 'existing'"
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
      ],
      condition: "context.business_path != 'existing'"
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
      placeholder: 'If existing business',
      condition: "context.business_path == 'existing'"
    },
    {
      id: 'existing_website',
      question: 'What is your business website URL?',
      type: QuestionType.URL,
      placeholder: 'https://yourbusiness.com',
      condition: "context.business_path == 'existing'"
    },
    {
      id: 'existing_industry',
      question: 'What industry is your business in?',
      type: QuestionType.CHOICE,
      condition: "context.business_path == 'existing'",
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
      type: QuestionType.DATE,
      condition: "context.business_path == 'existing'"
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
      ],
      condition: "context.business_path == 'existing'"
    },
    {
      id: 'legal_entity',
      question: 'Is your business registered? What type?',
      type: QuestionType.CHOICE,
      condition: "context.business_path == 'existing'",
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
      placeholder: 'List your main offerings',
      condition: "context.business_path == 'existing'"
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

// ==========================================
// PHASE 4: MARKET & INDUSTRY ANALYSIS (20 questions)
// ==========================================

export const PHASE_4_MARKET: Phase = {
  id: 'market',
  name: 'Phase 4: Market & Industry Analysis',
  description: 'Analyze market size, customers, and opportunities',
  estimated_time: '12-15 minutes',
  questions: [
    {
      id: 'primary_market',
      question: 'Where will you primarily operate your business?',
      type: QuestionType.TEXT,
      placeholder: 'City, State, Country or \'Global\'',
      required: true
    },
    {
      id: 'expansion_plan',
      question: 'Do you plan to expand to a national market?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'maybe_later', label: 'Maybe later' }
      ],
      required: true
    },
    {
      id: 'expansion_timeline',
      question: 'If yes to national expansion, what\'s your timeline?',
      type: QuestionType.CHOICE,
      options: [
        { value: '0-6m', label: '0-6 months' },
        { value: '6-12m', label: '6-12 months' },
        { value: '1-2y', label: '1-2 years' },
        { value: '2-5y', label: '2-5 years' }
      ],
      condition: 'context.expansion_plan == \'yes\''
    },
    {
      id: 'international_plan',
      question: 'Do you have plans for international expansion?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'maybe_later', label: 'Maybe later' }
      ],
      required: true
    },
    {
      id: 'target_regions',
      question: 'If yes to international, which regions/countries?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'north_america', label: 'North America' },
        { value: 'europe', label: 'Europe' },
        { value: 'asia_pacific', label: 'Asia-Pacific' },
        { value: 'middle_east', label: 'Middle East' },
        { value: 'africa', label: 'Africa' },
        { value: 'latin_america', label: 'Latin America' }
      ],
      condition: 'context.international_plan in [\'yes\', \'maybe_later\']'
    },
    {
      id: 'customer_type',
      question: 'Is your target customer B2B (businesses) or B2C (individual consumers)?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'b2c', label: 'B2C' },
        { value: 'b2b', label: 'B2B' },
        { value: 'b2b2c', label: 'B2B2C' },
        { value: 'b2g', label: 'B2G' },
        { value: 'hybrid', label: 'Hybrid' }
      ],
      required: true
    },
    {
      id: 'target_age',
      question: 'What age group is your primary target customer?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'children', label: 'Children' },
        { value: 'teenagers', label: 'Teenagers' },
        { value: 'young_adults', label: 'Young Adults' },
        { value: 'adults', label: 'Adults' },
        { value: 'middle_age', label: 'Middle Age' },
        { value: 'seniors', label: 'Seniors' },
        { value: 'all_ages', label: 'All ages' }
      ],
      condition: 'context.customer_type in [\'b2c\', \'b2b2c\', \'hybrid\']'
    },
    {
      id: 'target_gender',
      question: 'What is the gender focus of your target market?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'male', label: 'Primarily Male' },
        { value: 'female', label: 'Primarily Female' },
        { value: 'gender_neutral', label: 'Gender-neutral' },
        { value: 'lgbtq', label: 'Non-binary/LGBTQ+ focused' }
      ],
      condition: 'context.customer_type in [\'b2c\', \'b2b2c\', \'hybrid\']'
    },
    {
      id: 'target_income',
      question: 'What income level are you targeting?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'lower', label: 'Lower Income' },
        { value: 'lower_middle', label: 'Lower Middle' },
        { value: 'middle_class', label: 'Middle Class' },
        { value: 'upper_middle', label: 'Upper Middle' },
        { value: 'affluent', label: 'Affluent' },
        { value: 'hnw', label: 'High Net Worth' },
        { value: 'all', label: 'All' }
      ],
      condition: 'context.customer_type in [\'b2c\', \'b2b2c\', \'hybrid\']'
    },
    {
      id: 'target_location',
      question: 'What is your target customer\'s location type?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'urban_metro', label: 'Urban Metro' },
        { value: 'urban', label: 'Urban' },
        { value: 'semi_urban', label: 'Semi-Urban' },
        { value: 'rural', label: 'Rural' },
        { value: 'all', label: 'All' },
        { value: 'online_only', label: 'Online-only' }
      ],
      required: true
    },
    {
      id: 'target_education',
      question: 'What is your target customer\'s education level?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'high_school', label: 'High school or below' },
        { value: 'some_college', label: 'Some college' },
        { value: 'college', label: 'College graduate' },
        { value: 'postgraduate', label: 'Postgraduate' },
        { value: 'not_relevant', label: 'Not relevant' }
      ],
      condition: 'context.customer_type in [\'b2c\', \'b2b2c\', \'hybrid\']'
    },
    {
      id: 'customer_interests',
      question: 'What are your target customer\'s primary interests/lifestyle?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'health_fitness', label: 'Health & Fitness' },
        { value: 'technology', label: 'Technology' },
        { value: 'fashion_beauty', label: 'Fashion & Beauty' },
        { value: 'travel', label: 'Travel' },
        { value: 'food_cooking', label: 'Food & Cooking' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'sports', label: 'Sports' },
        { value: 'arts_culture', label: 'Arts & Culture' },
        { value: 'family', label: 'Family' },
        { value: 'career', label: 'Career' },
        { value: 'home_design', label: 'Home Design' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'sustainability', label: 'Sustainability' }
      ],
      condition: 'context.customer_type in [\'b2c\', \'b2b2c\', \'hybrid\']'
    },
    {
      id: 'customer_problem',
      question: 'What problem or need does your target customer have?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Describe the pain point you\'re solving',
      required: true
    },
    {
      id: 'company_size_target',
      question: 'What company size are you targeting? (For B2B)',
      type: QuestionType.CHOICE,
      options: [
        { value: 'micro', label: 'Micro Business' },
        { value: 'small', label: 'Small Business' },
        { value: 'mid_market', label: 'Mid-Market' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'large_enterprise', label: 'Large Enterprise' },
        { value: 'all_sizes', label: 'All sizes' }
      ],
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'target_industries_b2b',
      question: 'What industries will you serve? (For B2B)',
      type: QuestionType.MULTI_SELECT,
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
      ],
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'company_revenue_target',
      question: 'What is your target company\'s annual revenue range?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'startups', label: 'Startups' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'all', label: 'All' }
      ],
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'decision_maker',
      question: 'Who is the primary decision-maker or buyer?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'c_suite', label: 'C-Suite' },
        { value: 'vp_director', label: 'VP/Director' },
        { value: 'manager', label: 'Manager' },
        { value: 'individual', label: 'Individual' },
        { value: 'procurement', label: 'Procurement' },
        { value: 'multiple', label: 'Multiple' }
      ],
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'business_problem',
      question: 'What is the primary business problem you solve for them?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Describe the business problem or need',
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'current_solution',
      question: 'How do businesses currently solve this problem?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'manual', label: 'Manual process' },
        { value: 'in_house', label: 'In-house solution' },
        { value: 'legacy', label: 'Legacy software' },
        { value: 'competitor', label: 'Competitor product' },
        { value: 'outsourced', label: 'Outsourced' },
        { value: 'excel', label: 'Excel' },
        { value: 'multiple_tools', label: 'Multiple tools' }
      ],
      condition: 'context.customer_type in [\'b2b\', \'b2b2c\', \'b2g\', \'hybrid\']'
    },
    {
      id: 'checkpoint_market',
      question: 'Great market analysis! Ready to design your revenue model?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 10-12 minutes',
      estimated_time_next: '10-12 minutes'
    }
  ]
}

// ==========================================
// PHASE 5: REVENUE MODEL & FINANCIAL PROJECTIONS (20 questions)
// ==========================================

export const PHASE_5_REVENUE: Phase = {
  id: 'revenue',
  name: 'Phase 5: Revenue Model & Financial Projections',
  description: 'Design revenue streams and financial projections',
  estimated_time: '10-12 minutes',
  questions: [
    {
      id: 'revenue_model',
      question: 'What is your primary revenue model?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'one_time', label: 'One-Time Sale' },
        { value: 'recurring', label: 'Recurring Revenue' },
        { value: 'usage', label: 'Usage-Based' },
        { value: 'freemium', label: 'Freemium' },
        { value: 'commission', label: 'Commission/Marketplace' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'licensing', label: 'Licensing' },
        { value: 'hybrid', label: 'Hybrid Model' }
      ],
      required: true
    },
    {
      id: 'billing_frequency',
      question: 'What is your billing frequency?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'semi_annual', label: 'Semi-Annual' },
        { value: 'annual', label: 'Annual' },
        { value: 'multi_year', label: 'Multi-year' },
        { value: 'custom', label: 'Custom' }
      ],
      required: true
    },
    {
      id: 'target_price',
      question: 'What is your target price point for your primary offering?',
      type: QuestionType.TEXT,
      placeholder: 'e.g., ₹999/month or ₹9,999 one-time',
      required: true
    },
    {
      id: 'tiered_pricing',
      question: 'Will you offer tiered pricing or packages?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'single', label: 'No, single price' },
        { value: '2_tiers', label: 'Yes, 2 tiers' },
        { value: '3_tiers', label: 'Yes, 3 tiers' },
        { value: '4+_tiers', label: 'Yes, 4+ tiers' },
        { value: 'custom_pricing', label: 'Custom pricing' },
        { value: 'not_decided', label: 'Not decided' }
      ]
    },
    {
      id: 'gross_margin',
      question: 'What is your expected gross margin? (Break down by stream if needed)',
      type: QuestionType.PERCENTAGE_BREAKDOWN,
      placeholder: 'e.g., 70% for SaaS',
      required: true
    },
    {
      id: 'secondary_revenue',
      question: 'Do you have secondary revenue streams?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'upsells', label: 'Upsells' },
        { value: 'cross_sells', label: 'Cross-sells' },
        { value: 'services', label: 'Professional services' },
        { value: 'affiliate', label: 'Affiliate commissions' },
        { value: 'data', label: 'Data monetization' },
        { value: 'white_label', label: 'White-labeling' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'events', label: 'Event fees' },
        { value: 'merchandise', label: 'Merchandise' },
        { value: 'none', label: 'None' }
      ]
    },
    {
      id: 'revenue_target_year1',
      question: 'What is your realistic revenue target for Year 1?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹10,00,000',
      required: true
    },
    {
      id: 'growth_rate',
      question: 'What year-over-year growth rate do you expect?',
      type: QuestionType.CHOICE,
      options: [
        { value: '20-40', label: '20-40%' },
        { value: '50-100', label: '50-100%' },
        { value: '100-200', label: '100-200%' },
        { value: '200+', label: '200%+' },
        { value: 'custom', label: 'Custom rates' }
      ],
      required: true
    },
    {
      id: 'monthly_customers',
      question: 'How many customers do you expect to acquire monthly?',
      type: QuestionType.NUMBER,
      placeholder: 'Expected customers per month'
    },
    {
      id: 'churn_rate',
      question: 'What is your expected monthly churn rate?',
      type: QuestionType.PERCENTAGE,
      placeholder: 'e.g., 5% per month'
    },
    {
      id: 'arpu',
      question: 'What is your Average Revenue Per User (ARPU)?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹2,999/month'
    },
    {
      id: 'expansion_revenue',
      question: 'Do you expect expansion revenue from existing customers?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'upsells', label: 'Yes, through upsells' },
        { value: 'addons', label: 'Yes, through add-ons' },
        { value: 'usage', label: 'Yes, through increased usage' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'nrr',
      question: 'What is your expected Net Revenue Retention (NRR)?',
      type: QuestionType.PERCENTAGE,
      placeholder: 'e.g., 110%'
    },
    {
      id: 'target_cac',
      question: 'What is your target Customer Acquisition Cost (CAC)?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹50,000'
    },
    {
      id: 'ltv',
      question: 'What is your expected Customer Lifetime Value (LTV)?',
      type: QuestionType.AMOUNT,
      placeholder: 'Auto-calculated or manual'
    },
    {
      id: 'sales_cycle',
      question: 'How long is your sales cycle?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'same_day', label: 'Same Day' },
        { value: '1-7_days', label: '1-7 days' },
        { value: '1-4_weeks', label: '1-4 weeks' },
        { value: '1-3_months', label: '1-3 months' },
        { value: '3-6_months', label: '3-6 months' },
        { value: '6-12_months', label: '6-12 months' },
        { value: '12+_months', label: '12+ months' }
      ]
    },
    {
      id: 'pricing_comparison',
      question: 'How does your pricing compare to competitors?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'significantly_lower', label: 'Significantly lower' },
        { value: 'slightly_lower', label: 'Slightly lower' },
        { value: 'similar', label: 'Similar' },
        { value: 'slightly_higher', label: 'Slightly higher' },
        { value: 'significantly_higher', label: 'Significantly higher' },
        { value: 'no_competitors', label: 'No competitors' }
      ]
    },
    {
      id: 'pricing_strategy',
      question: 'What is your primary pricing strategy rationale?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'cost_plus', label: 'Cost-plus pricing' },
        { value: 'value_based', label: 'Value-based' },
        { value: 'competitive', label: 'Competitive pricing' },
        { value: 'penetration', label: 'Penetration pricing' },
        { value: 'skimming', label: 'Skimming' },
        { value: 'psychological', label: 'Psychological pricing' },
        { value: 'bundle', label: 'Bundle pricing' },
        { value: 'dynamic', label: 'Dynamic pricing' }
      ]
    },
    {
      id: 'discounts',
      question: 'Will you offer any discounts or promotions?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'annual', label: 'Annual payment discount' },
        { value: 'volume', label: 'Volume discounts' },
        { value: 'early_bird', label: 'Early-bird discounts' },
        { value: 'student', label: 'Student discounts' },
        { value: 'referral', label: 'Referral discounts' },
        { value: 'seasonal', label: 'Seasonal promotions' },
        { value: 'enterprise', label: 'Enterprise pricing' },
        { value: 'no_discounts', label: 'No discounts' }
      ]
    },
    {
      id: 'checkpoint_revenue',
      question: 'Excellent financial planning! Ready to analyze competitors?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 5-7 minutes',
      estimated_time_next: '5-7 minutes'
    }
  ]
}

// ==========================================
// PHASE 6: COMPETITIVE ANALYSIS (7 questions)
// ==========================================

export const PHASE_6_COMPETITION: Phase = {
  id: 'competition',
  name: 'Phase 6: Competitive Analysis',
  description: 'Analyze competitors and market positioning',
  estimated_time: '5-7 minutes',
  questions: [
    {
      id: 'top_competitors',
      question: 'Who are your top 3-5 direct competitors?',
      type: QuestionType.LIST,
      placeholder: 'List competitor names and URLs'
    },
    {
      id: 'indirect_competitors',
      question: 'Are there indirect competitors or substitute solutions?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Describe alternative solutions'
    },
    {
      id: 'competitive_advantage',
      question: 'What is your primary competitive advantage?',
      type: QuestionType.TEXTAREA,
      placeholder: 'What makes you different and better?',
      required: true
    },
    {
      id: 'competitor_weaknesses',
      question: 'What are key weaknesses of your competitors that you can exploit?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'poor_service', label: 'Poor customer service' },
        { value: 'outdated_tech', label: 'Outdated technology' },
        { value: 'high_pricing', label: 'High pricing' },
        { value: 'complicated_ux', label: 'Complicated UX' },
        { value: 'limited_features', label: 'Limited features' },
        { value: 'slow_innovation', label: 'Slow innovation' },
        { value: 'weak_presence', label: 'Weak market presence' },
        { value: 'bad_reviews', label: 'Bad reviews' },
        { value: 'no_mobile', label: 'No mobile app' },
        { value: 'poor_integration', label: 'Poor integration' },
        { value: 'limited_language', label: 'Limited language support' }
      ]
    },
    {
      id: 'barriers_to_entry',
      question: 'What barriers to entry exist in your market?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'capital', label: 'High capital requirements' },
        { value: 'regulatory', label: 'Regulatory requirements' },
        { value: 'technical', label: 'Technical complexity' },
        { value: 'network', label: 'Network effects' },
        { value: 'brand', label: 'Brand loyalty' },
        { value: 'proprietary', label: 'Proprietary technology' },
        { value: 'scale', label: 'Economies of scale' },
        { value: 'distribution', label: 'Distribution access' },
        { value: 'switching', label: 'Switching costs' },
        { value: 'few_barriers', label: 'Few barriers' }
      ]
    },
    {
      id: 'competition_strategy',
      question: 'What is your strategy to compete and win?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'cost_leadership', label: 'Cost Leadership' },
        { value: 'differentiation', label: 'Differentiation' },
        { value: 'focus_niche', label: 'Focus/Niche' },
        { value: 'innovation', label: 'Innovation' },
        { value: 'customer_intimacy', label: 'Customer Intimacy' },
        { value: 'speed', label: 'Speed to Market' },
        { value: 'hybrid', label: 'Hybrid' }
      ]
    },
    {
      id: 'checkpoint_competition',
      question: 'Great competitive analysis! Ready to plan operations and team?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 8-10 minutes',
      estimated_time_next: '8-10 minutes'
    }
  ]
}

// ==========================================
// PHASE 7: OPERATIONS & TEAM (19 questions)
// ==========================================

export const PHASE_7_OPERATIONS: Phase = {
  id: 'operations',
  name: 'Phase 7: Operations & Team',
  description: 'Plan team structure, vendors, and operations',
  estimated_time: '8-10 minutes',
  questions: [
    {
      id: 'need_cofounder',
      question: 'Do you need a co-founder for this business?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'solo', label: 'No, solo' },
        { value: 'maybe', label: 'Maybe' },
        { value: 'looking', label: 'Yes, looking' },
        { value: 'have_one', label: 'Yes, have one' },
        { value: 'have_team', label: 'Have team' }
      ],
      required: true
    },
    {
      id: 'cofounder_skills',
      question: 'What skills are you looking for in a co-founder?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'technical', label: 'Technical' },
        { value: 'sales', label: 'Sales' },
        { value: 'finance', label: 'Finance' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'operations', label: 'Operations' },
        { value: 'product', label: 'Product' },
        { value: 'industry', label: 'Industry' },
        { value: 'network', label: 'Network' }
      ]
    },
    {
      id: 'missing_skills',
      question: 'What key skills or roles are you personally missing?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'technical', label: 'Technical' },
        { value: 'business', label: 'Business' },
        { value: 'creative', label: 'Creative' },
        { value: 'management', label: 'Management' },
        { value: 'domain', label: 'Domain' }
      ]
    },
    {
      id: 'team_size_year1',
      question: 'What is your target team size in Year 1?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'just_me', label: 'Just me' },
        { value: '2-3', label: '2-3' },
        { value: '4-7', label: '4-7' },
        { value: '8-15', label: '8-15' },
        { value: '16-25', label: '16-25' },
        { value: '25+', label: '25+' }
      ],
      required: true
    },
    {
      id: 'hiring_priorities',
      question: 'What will be your hiring priorities in first 12 months?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'product_mgr', label: 'Product Manager' },
        { value: 'software', label: 'Software Engineers' },
        { value: 'designers', label: 'Designers' },
        { value: 'support', label: 'Customer Support' },
        { value: 'operations', label: 'Operations' },
        { value: 'finance', label: 'Finance' },
        { value: 'hr', label: 'HR' },
        { value: 'legal', label: 'Legal' }
      ]
    },
    {
      id: 'employment_model',
      question: 'Will you hire full-time employees, contractors, or both?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'fte_only', label: 'FTE only' },
        { value: 'contractors_only', label: 'Contractors only' },
        { value: 'mix', label: 'Mix' },
        { value: 'starting_contractors', label: 'Starting with contractors' },
        { value: 'depends', label: 'Depends' }
      ]
    },
    {
      id: 'work_arrangement',
      question: 'What will be your work arrangement?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'remote', label: 'Fully remote' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'office', label: 'Office-based' },
        { value: 'flexible', label: 'Flexible' },
        { value: 'coworking', label: 'Co-working' },
        { value: 'home', label: 'Home office' }
      ]
    },
    {
      id: 'salary_budget',
      question: 'What is your estimated monthly salary budget for Year 1?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹5,00,000/month'
    },
    {
      id: 'key_vendors',
      question: 'What key vendors or suppliers will you need?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'cloud', label: 'Cloud hosting' },
        { value: 'payment', label: 'Payment gateway' },
        { value: 'manufacturers', label: 'Manufacturers' },
        { value: 'shipping', label: 'Shipping' },
        { value: 'software', label: 'Software tools' },
        { value: 'legal', label: 'Legal services' },
        { value: 'marketing', label: 'Marketing agencies' },
        { value: 'office', label: 'Office space' }
      ]
    },
    {
      id: 'manufacturing_model',
      question: 'Will you manufacture in-house, outsource, or white-label?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'in_house', label: 'In-house' },
        { value: 'contract', label: 'Contract manufacturing' },
        { value: 'white_label', label: 'White-label' },
        { value: 'dropshipping', label: 'Dropshipping' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'na', label: 'N/A' }
      ]
    },
    {
      id: 'strategic_partnerships',
      question: 'Are there strategic partnerships critical to your business?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'distribution', label: 'Yes, distribution' },
        { value: 'technology', label: 'Yes, technology' },
        { value: 'content', label: 'Yes, content' },
        { value: 'channel', label: 'Yes, channel' },
        { value: 'no', label: 'No' },
        { value: 'planning', label: 'Planning' }
      ]
    },
    {
      id: 'tech_stack',
      question: 'What technology stack or tools do you need?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'crm', label: 'CRM' },
        { value: 'accounting', label: 'Accounting software' },
        { value: 'project', label: 'Project management' },
        { value: 'communication', label: 'Communication' },
        { value: 'email_marketing', label: 'Email marketing' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'ecommerce', label: 'E-commerce platform' },
        { value: 'custom', label: 'Custom software' }
      ]
    },
    {
      id: 'tech_budget',
      question: 'What is your estimated monthly technology/tool budget?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹50,000/month'
    },
    {
      id: 'custom_tech',
      question: 'Do you need to build custom technology/IP?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'off_shelf', label: 'No, off-the-shelf' },
        { value: 'software', label: 'Yes, custom software' },
        { value: 'ai', label: 'Yes, proprietary AI' },
        { value: 'hardware', label: 'Yes, hardware' },
        { value: 'maybe', label: 'Maybe' }
      ]
    },
    {
      id: 'licenses_needed',
      question: 'What licenses or permits do you need?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'registration', label: 'Business registration' },
        { value: 'gst', label: 'GST' },
        { value: 'fssai', label: 'FSSAI' },
        { value: 'drug', label: 'Drug license' },
        { value: 'rbi', label: 'RBI approval' },
        { value: 'iso', label: 'ISO certifications' },
        { value: 'import_export', label: 'Import/Export' },
        { value: 'none', label: 'None' },
        { value: 'not_sure', label: 'Not sure' }
      ]
    },
    {
      id: 'regulations',
      question: 'Do you need to comply with any specific regulations?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'data_privacy', label: 'Data privacy' },
        { value: 'financial', label: 'Financial regulations' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'safety', label: 'Safety standards' },
        { value: 'environmental', label: 'Environmental' },
        { value: 'consumer', label: 'Consumer protection' },
        { value: 'labor', label: 'Labor laws' },
        { value: 'tax', label: 'Tax' },
        { value: 'not_sure', label: 'Not sure' }
      ]
    },
    {
      id: 'insurance_needed',
      question: 'What insurance coverage do you need?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'general', label: 'General liability' },
        { value: 'professional', label: 'Professional liability' },
        { value: 'product', label: 'Product liability' },
        { value: 'cyber', label: 'Cyber liability' },
        { value: 'property', label: 'Property' },
        { value: 'workers', label: 'Workers comp' },
        { value: 'do', label: 'D&O' },
        { value: 'not_sure', label: 'Not sure' }
      ]
    },
    {
      id: 'checkpoint_operations',
      question: 'Operations planned! Ready to create your go-to-market strategy?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 5-7 minutes',
      estimated_time_next: '5-7 minutes'
    }
  ]
}

// ==========================================
// PHASE 8: GO-TO-MARKET STRATEGY (13 questions)
// ==========================================

export const PHASE_8_GOTOMARKET: Phase = {
  id: 'gtm',
  name: 'Phase 8: Go-to-Market Strategy',
  description: 'Plan customer acquisition and marketing',
  estimated_time: '5-7 minutes',
  questions: [
    {
      id: 'acquisition_channels',
      question: 'What will be your primary customer acquisition channels? (Top 3)',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'google_ads', label: 'Google Ads' },
        { value: 'social_ads', label: 'Social Media Ads' },
        { value: 'content', label: 'Content Marketing' },
        { value: 'email', label: 'Email Marketing' },
        { value: 'influencer', label: 'Influencer Marketing' },
        { value: 'affiliate', label: 'Affiliate' },
        { value: 'marketplaces', label: 'Marketplaces' },
        { value: 'direct_sales', label: 'Direct Sales' },
        { value: 'partners', label: 'Channel Partners' },
        { value: 'trade_shows', label: 'Trade Shows' },
        { value: 'word_of_mouth', label: 'Word of Mouth' },
        { value: 'pr', label: 'PR' },
        { value: 'partnerships', label: 'Partnerships' }
      ]
    },
    {
      id: 'acquisition_strategy',
      question: 'Describe your customer acquisition strategy for Year 1',
      type: QuestionType.TEXTAREA,
      placeholder: 'Plan to get first 100 customers'
    },
    {
      id: 'marketing_budget',
      question: 'What is your monthly marketing budget for Year 1?',
      type: QuestionType.CHOICE,
      options: [
        { value: '0-50k', label: '₹0-50k' },
        { value: '50k-2l', label: '₹50k-2L' },
        { value: '2-5l', label: '₹2-5L' },
        { value: '5l+', label: '₹5L+' },
        { value: 'percent', label: '% of revenue' }
      ]
    },
    {
      id: 'existing_audience',
      question: 'Do you have any existing audience or warm leads?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'email_list', label: 'Email list' },
        { value: 'social_following', label: 'Social following' },
        { value: 'network', label: 'Network' },
        { value: 'existing_customers', label: 'Existing customers' },
        { value: 'starting', label: 'No, starting from zero' }
      ]
    },
    {
      id: 'sales_model',
      question: 'What is your primary sales model?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'self_serve', label: 'Self-serve' },
        { value: 'inside_sales', label: 'Inside sales' },
        { value: 'field_sales', label: 'Field sales' },
        { value: 'channel', label: 'Channel partners' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'marketplace', label: 'Marketplace' }
      ]
    },
    {
      id: 'sales_team',
      question: 'Will you have a dedicated sales team in Year 1?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'founder', label: 'Founder-led' },
        { value: '1-2', label: '1-2 reps' },
        { value: '3-5', label: '3-5 reps' },
        { value: '5+', label: '5+ reps' },
        { value: 'outsourced', label: 'Outsourced' }
      ]
    },
    {
      id: 'commission_structure',
      question: 'What is your sales commission structure?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'salary_only', label: 'Salaried only' },
        { value: 'base_commission', label: 'Base + commission' },
        { value: 'commission_only', label: 'Commission only' },
        { value: 'industry', label: 'Industry standard' },
        { value: 'custom', label: 'Custom' }
      ]
    },
    {
      id: 'brand_positioning',
      question: 'What is your brand positioning?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'economy', label: 'Economy' },
        { value: 'value', label: 'Value' },
        { value: 'premium', label: 'Premium' },
        { value: 'luxury', label: 'Luxury' },
        { value: 'innovative', label: 'Innovative' },
        { value: 'trusted', label: 'Trusted' },
        { value: 'lifestyle', label: 'Fun/Lifestyle' }
      ]
    },
    {
      id: 'brand_voice',
      question: 'What is your unique brand voice?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'professional', label: 'Professional' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'bold', label: 'Bold' },
        { value: 'playful', label: 'Playful' },
        { value: 'sophisticated', label: 'Sophisticated' },
        { value: 'innovative', label: 'Innovative' },
        { value: 'trustworthy', label: 'Trustworthy' },
        { value: 'inspirational', label: 'Inspirational' },
        { value: 'educational', label: 'Educational' }
      ]
    },
    {
      id: 'marketing_focus',
      question: 'Will you focus on brand building or performance marketing?',
      type: QuestionType.CHOICE,
      options: [
        { value: '100_performance', label: '100% Performance' },
        { value: '80_20', label: '80/20' },
        { value: '60_40', label: '60/40' },
        { value: '50_50', label: '50/50' },
        { value: '40_60', label: '40/60' },
        { value: '20_80', label: '20/80' },
        { value: '100_brand', label: '100% Brand' }
      ]
    },
    {
      id: 'key_milestones',
      question: 'What are key milestones for next 12-18 months?',
      type: QuestionType.MILESTONE,
      placeholder: 'Month 1-2: MVP, Month 3: First customer, etc.'
    },
    {
      id: 'launch_timeline',
      question: 'When do you plan to officially launch?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'launched', label: 'Already launched' },
        { value: '1_month', label: 'Within 1 month' },
        { value: '1-3_months', label: '1-3 months' },
        { value: '3-6_months', label: '3-6 months' },
        { value: '6-12_months', label: '6-12 months' },
        { value: '12+_months', label: '12+ months' }
      ]
    },
    {
      id: 'checkpoint_gtm',
      question: 'Great go-to-market plan! Ready to plan funding strategy?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 5-7 minutes',
      estimated_time_next: '5-7 minutes'
    }
  ]
}

// ==========================================
// PHASE 9: FUNDING STRATEGY (10 questions)
// ==========================================

export const PHASE_9_FUNDING: Phase = {
  id: 'funding',
  name: 'Phase 9: Funding Strategy',
  description: 'Plan capital requirements and fundraising',
  estimated_time: '5-7 minutes',
  questions: [
    {
      id: 'external_funding',
      question: 'Are you planning to raise external funding?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'bootstrap', label: 'No, bootstrapping' },
        { value: 'maybe', label: 'Maybe' },
        { value: 'planning', label: 'Yes, planning' },
        { value: 'raised', label: 'Already raised' }
      ],
      required: true
    },
    {
      id: 'funding_stage',
      question: 'What stage of funding are you targeting?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'pre_seed', label: 'Pre-Seed' },
        { value: 'seed', label: 'Seed' },
        { value: 'series_a', label: 'Series A' },
        { value: 'series_b', label: 'Series B+' },
        { value: 'debt', label: 'Debt' },
        { value: 'grants', label: 'Grants' },
        { value: 'not_sure', label: 'Not sure' }
      ]
    },
    {
      id: 'capital_needed',
      question: 'How much capital do you need to raise?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹1,00,00,000'
    },
    {
      id: 'funds_allocation',
      question: 'What will funds be used for?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Product dev, hiring, marketing, etc.'
    },
    {
      id: 'equity_dilution',
      question: 'What equity are you willing to dilute?',
      type: QuestionType.PERCENTAGE,
      placeholder: 'e.g., 15%'
    },
    {
      id: 'target_valuation',
      question: 'What is your target company valuation?',
      type: QuestionType.AMOUNT,
      placeholder: 'e.g., ₹10,00,00,000'
    },
    {
      id: 'investor_types',
      question: 'What type of investors are you targeting?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'angels', label: 'Angels' },
        { value: 'vcs', label: 'VCs' },
        { value: 'corporate_vcs', label: 'Corporate VCs' },
        { value: 'accelerators', label: 'Accelerators' },
        { value: 'family_offices', label: 'Family Offices' },
        { value: 'crowdfunding', label: 'Crowdfunding' },
        { value: 'banks', label: 'Banks' }
      ]
    },
    {
      id: 'investor_connections',
      question: 'Do you have warm introductions to investors?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'multiple', label: 'Yes, multiple' },
        { value: 'few', label: 'Yes, a few' },
        { value: 'cold', label: 'No, cold outreach' },
        { value: 'need_help', label: 'Need help' }
      ]
    },
    {
      id: 'investor_conversations',
      question: 'Have you had investor conversations or term sheets?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'term_sheet', label: 'Have term sheet' },
        { value: 'active', label: 'Active discussions' },
        { value: 'early', label: 'Early conversations' },
        { value: 'not_started', label: 'Haven\'t started' },
        { value: 'not_ready', label: 'Not ready' }
      ]
    },
    {
      id: 'checkpoint_funding',
      question: 'Funding strategy complete! Ready to assess risks?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Next section takes about 3-5 minutes',
      estimated_time_next: '3-5 minutes'
    }
  ]
}

// ==========================================
// PHASE 10: RISK ASSESSMENT (5 questions)
// ==========================================

export const PHASE_10_RISK: Phase = {
  id: 'risk',
  name: 'Phase 10: Risk Assessment',
  description: 'Identify and mitigate business risks',
  estimated_time: '3-5 minutes',
  questions: [
    {
      id: 'key_risks',
      question: 'What are key risks to your business?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'market_small', label: 'Market smaller than expected' },
        { value: 'slow_adoption', label: 'Slow adoption' },
        { value: 'competition', label: 'Strong competition' },
        { value: 'cant_build', label: 'Can\'t build product' },
        { value: 'high_cac', label: 'High customer acquisition cost' },
        { value: 'team_execution', label: 'Team execution' },
        { value: 'cash_out', label: 'Running out of cash' },
        { value: 'cant_raise', label: 'Can\'t raise funding' },
        { value: 'regulatory', label: 'Regulatory changes' },
        { value: 'key_person', label: 'Key person dependency' },
        { value: 'economic', label: 'Economic downturn' },
        { value: 'supply_chain', label: 'Supply chain issues' }
      ]
    },
    {
      id: 'risk_mitigation',
      question: 'For top 3 risks, what are your mitigation strategies?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Risk 1: [mitigation], Risk 2: [mitigation], etc.'
    },
    {
      id: 'plan_b',
      question: 'What is your Plan B if this doesn\'t work?',
      type: QuestionType.TEXTAREA,
      placeholder: 'Alternative business model or pivot plan'
    },
    {
      id: 'key_assumptions',
      question: 'What are key assumptions that need validation?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'willingness_to_pay', label: 'Customer willingness to pay' },
        { value: 'cac', label: 'Customer acquisition cost' },
        { value: 'conversion', label: 'Conversion rates' },
        { value: 'churn', label: 'Churn rates' },
        { value: 'market_size', label: 'Market size' },
        { value: 'dev_timeline', label: 'Development timeline' },
        { value: 'hiring_timeline', label: 'Hiring timeline' },
        { value: 'competitor_response', label: 'Competitor response' },
        { value: 'tech_feasibility', label: 'Technology feasibility' }
      ]
    },
    {
      id: 'checkpoint_risk',
      question: 'Risk assessment complete! Ready for final review?',
      type: QuestionType.CHECKPOINT,
      options: [
        { value: 'continue', label: 'Continue now' },
        { value: 'pause', label: 'Pause and resume later' }
      ],
      helper_text: 'Final section takes about 2-3 minutes',
      estimated_time_next: '2-3 minutes'
    }
  ]
}

// ==========================================
// PHASE 11: FINAL REVIEW & OUTPUT (8 questions)
// ==========================================

export const PHASE_11_FINAL: Phase = {
  id: 'final',
  name: 'Phase 11: Final Review & Output',
  description: 'Review and generate business model',
  estimated_time: '2-3 minutes',
  questions: [
    {
      id: 'summary_review',
      question: 'Does your business model summary look accurate?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'perfect', label: '✅ Looks perfect' },
        { value: 'minor', label: '⚠️ Needs minor edits' },
        { value: 'major', label: '❌ Needs major revisions' }
      ],
      required: true
    },
    {
      id: 'output_formats',
      question: 'Which format(s) would you like for your business model?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'pdf', label: 'PDF Report' },
        { value: 'ppt', label: 'PowerPoint' },
        { value: 'excel', label: 'Excel Model' },
        { value: 'canvas', label: 'Business Model Canvas' },
        { value: 'dashboard', label: 'Web Dashboard' },
        { value: 'notion', label: 'Notion' },
        { value: 'all', label: 'All' }
      ],
      required: true
    },
    {
      id: 'detail_level',
      question: 'What level of detail do you want?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'executive', label: 'Executive Summary' },
        { value: 'standard', label: 'Standard Detail' },
        { value: 'comprehensive', label: 'Comprehensive' },
        { value: 'custom', label: 'Custom' }
      ],
      required: true
    },
    {
      id: 'purpose',
      question: 'Are you creating this for a specific purpose?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'personal', label: 'Personal planning' },
        { value: 'investor', label: 'Investor pitch' },
        { value: 'team', label: 'Team alignment' },
        { value: 'bank', label: 'Bank loan' },
        { value: 'accelerator', label: 'Accelerator' },
        { value: 'general', label: 'General' }
      ],
      required: true
    },
    {
      id: 'ai_recommendations',
      question: 'Include AI strategic recommendations?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'yes_include', label: 'Yes, include' },
        { value: 'no_compile', label: 'No, just compile' },
        { value: 'ai_suggestions', label: 'Yes, mark as AI suggestions' }
      ],
      required: true
    },
    {
      id: 'follow_up',
      question: 'Would you like a follow-up session?',
      type: QuestionType.MULTI_SELECT,
      options: [
        { value: 'refine_model', label: 'Refine business model' },
        { value: 'financials', label: 'Deep-dive financials' },
        { value: 'gtm_plan', label: 'Detailed GTM plan' },
        { value: 'pitch_deck', label: 'Investor pitch deck' },
        { value: 'investor_intros', label: 'Investor introductions' },
        { value: 'cofounder', label: 'Co-founder matching' },
        { value: 'roadmap', label: 'Implementation roadmap' },
        { value: 'coaching', label: 'Business coaching' },
        { value: 'not_needed', label: 'Not needed' }
      ]
    },
    {
      id: 'contact_permission',
      question: 'May we contact you with relevant opportunities?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'yes_update', label: 'Yes, keep me updated' },
        { value: 'no_model', label: 'No, just send business model' }
      ],
      required: true
    },
    {
      id: 'final_confirmation',
      question: 'Ready to generate your comprehensive business model?',
      type: QuestionType.CHOICE,
      options: [
        { value: 'generate', label: '✅ Generate Now' },
        { value: 'review', label: '📋 Review Answers' },
        { value: 'save', label: '⏸️ Save for Later' }
      ],
      required: true
    }
  ]
}

// ==========================================
// ALL PHASES COLLECTION
// ==========================================

export const ALL_PHASES: Phase[] = [
  PHASE_1_AUTH,
  PHASE_2_DISCOVERY,
  PHASE_3_CONTEXT,
  PHASE_4_MARKET,
  PHASE_5_REVENUE,
  PHASE_6_COMPETITION,
  PHASE_7_OPERATIONS,
  PHASE_8_GOTOMARKET,
  PHASE_9_FUNDING,
  PHASE_10_RISK,
  PHASE_11_FINAL
]

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

// ==========================================
// STATE MANAGEMENT INTERFACES
// ==========================================

export interface UserResponse {
  question_id: string
  answer: any
  timestamp: Date
}

export interface QuestionnaireState {
  user_id: string
  current_phase: string
  current_question_index: number
  responses: Record<string, any>
  completed_phases: string[]
  paused: boolean
  created_at: Date
  updated_at: Date
}

// ==========================================
// QUESTIONNAIRE MANAGER CLASS
// ==========================================

export class BusinessModelQuestionnaire {
  private phases: Record<string, Phase> = {}
  private userSessions: Record<string, QuestionnaireState> = {}

  constructor() {
    // Initialize phases
    ALL_PHASES.forEach(phase => {
      this.phases[phase.id] = phase
    })
  }

  startSession(userId: string): QuestionnaireState {
    const now = new Date()
    const session: QuestionnaireState = {
      user_id: userId,
      current_phase: 'auth',
      current_question_index: 0,
      responses: {},
      completed_phases: [],
      paused: false,
      created_at: now,
      updated_at: now
    }
    this.userSessions[userId] = session
    return session
  }

  getCurrentQuestion(userId: string): Question | undefined {
    const session = this.userSessions[userId]
    if (!session) return undefined

    const phase = this.phases[session.current_phase]
    if (!phase) return undefined

    if (session.current_question_index < phase.questions.length) {
      return phase.questions[session.current_question_index]
    }
    return undefined
  }

  submitAnswer(userId: string, answer: any): {
    success: boolean
    message: string
    nextQuestion?: Question
  } {
    const session = this.userSessions[userId]
    if (!session) {
      return { success: false, message: 'Session not found' }
    }

    const currentQuestion = this.getCurrentQuestion(userId)
    if (!currentQuestion) {
      return { success: false, message: 'No current question' }
    }

    // Handle checkpoint questions
    if (currentQuestion.type === QuestionType.CHECKPOINT) {
      if (answer === 'pause') {
        session.paused = true
        return { success: false, message: 'Session paused' }
      } else if (answer === 'continue') {
        // Move to next question
        session.current_question_index++
        session.updated_at = new Date()

        // If we've completed all questions in this phase
        const phase = this.phases[session.current_phase]
        if (session.current_question_index >= phase.questions.length) {
          return this.moveToNextPhase(userId)
        }

        const nextQuestion = this.getCurrentQuestion(userId)
        return {
          success: true,
          message: 'Checkpoint passed',
          nextQuestion
        }
      }
    }

    // Store answer for regular questions
    session.responses[currentQuestion.id] = answer
    session.current_question_index++
    session.updated_at = new Date()

    // Check if we've completed this phase
    const phase = this.phases[session.current_phase]
    if (session.current_question_index >= phase.questions.length) {
      return this.moveToNextPhase(userId)
    }

    const nextQuestion = this.getCurrentQuestion(userId)
    return {
      success: true,
      message: 'Answer submitted',
      nextQuestion
    }
  }

  private moveToNextPhase(userId: string): {
    success: boolean
    message: string
    nextQuestion?: Question
  } {
    const session = this.userSessions[userId]
    if (!session) {
      return { success: false, message: 'Session not found' }
    }

    // Mark current phase as completed
    if (!session.completed_phases.includes(session.current_phase)) {
      session.completed_phases.push(session.current_phase)
    }

    // Determine next phase
    const phaseOrder = [
      'auth', 'discovery', 'context', 'market', 'revenue',
      'competition', 'operations', 'gtm', 'funding', 'risk', 'final'
    ]

    const currentIndex = phaseOrder.indexOf(session.current_phase)
    if (currentIndex + 1 < phaseOrder.length) {
      const nextPhaseId = phaseOrder[currentIndex + 1]
      session.current_phase = nextPhaseId
      session.current_question_index = 0
      session.updated_at = new Date()

      const nextQuestion = this.getCurrentQuestion(userId)
      return {
        success: true,
        message: `Moved to ${nextPhaseId}`,
        nextQuestion
      }
    } else {
      // All phases completed
      return { success: false, message: 'Questionnaire completed' }
    }
  }

  getProgress(userId: string): {
    current_phase: string
    current_question: number
    total_in_current_phase: number
    completed_phases: string[]
    total_phases: number
    answered_questions: number
    total_questions: number
    progress_percentage: number
    paused: boolean
  } | null {
    const session = this.userSessions[userId]
    if (!session) return null

    const totalQuestions = ALL_PHASES.reduce(
      (sum, phase) => sum + phase.questions.length, 0
    )
    const answeredQuestions = Object.keys(session.responses).length

    // Count questions in completed phases plus current phase progress
    let completedCount = 0
    session.completed_phases.forEach(phaseId => {
      completedCount += this.phases[phaseId].questions.length
    })

    // Add progress in current phase
    const currentPhase = this.phases[session.current_phase]
    completedCount += session.current_question_index

    const progressPercentage = (completedCount / totalQuestions) * 100

    return {
      current_phase: session.current_phase,
      current_question: session.current_question_index + 1,
      total_in_current_phase: currentPhase.questions.length,
      completed_phases: session.completed_phases,
      total_phases: ALL_PHASES.length,
      answered_questions: answeredQuestions,
      total_questions: totalQuestions,
      progress_percentage: parseFloat(progressPercentage.toFixed(1)),
      paused: session.paused
    }
  }

  getResponsesSummary(userId: string): {
    user_id: string
    responses: Record<string, any>
    completed_phases: string[]
    current_phase: string
    progress: any
  } | null {
    const session = this.userSessions[userId]
    if (!session) return null

    return {
      user_id: userId,
      responses: session.responses,
      completed_phases: session.completed_phases,
      current_phase: session.current_phase,
      progress: this.getProgress(userId)
    }
  }
}

// ==========================================
// BUSINESS MODEL GENERATOR CLASS
// ==========================================

export interface BusinessModelSummary {
  business_name: string
  industry: string
  business_type: string
  target_market: string
  customer_type: string
  value_proposition: string
  revenue_model: string
  year1_target: string | number
  competitive_advantage: string
  team_size: string
  funding_needed: string | number
  key_risks: string[]
  launch_timeline: string
}

export interface FinancialProjections {
  year1: number
  year2: number
  year3: number
  year4: number
  year5: number
  gross_margin: number
  target_cac: number
  ltv: number
  ltv_cac_ratio: number
}

export interface CompleteBusinessModel {
  executive_summary: BusinessModelSummary
  financial_projections: FinancialProjections
  market_analysis: {
    target_customer: {
      type: string
      demographics: {
        age: string
        income: string
        location: string
      }
    }
    market_size: string
    competition: string[]
  }
  operations_plan: {
    team_structure: string
    key_roles: string[]
    technology: string[]
    vendors: string[]
  }
  go_to_market: {
    channels: string[]
    budget: string
    sales_model: string
    launch_timeline: string
  }
  funding_strategy: {
    needed: string | number
    type: string
    use_of_funds: string
    valuation: string | number
  }
  risk_assessment: {
    key_risks: string[]
    mitigations: string
    assumptions: string[]
  }
  metadata: {
    generated_at: string
    user_id: string
    question_count: number
  }
}

export class BusinessModelGenerator {
  static generateExecutiveSummary(responses: Record<string, any>): BusinessModelSummary {
    const targetIndustries = responses.target_industries || []
    const industry = Array.isArray(targetIndustries) && targetIndustries.length > 0
      ? targetIndustries[0]
      : responses.existing_industry || 'General'

    return {
      business_name: responses.existing_name || 'New Venture',
      industry: industry,
      business_type: responses.business_model_type || 'Not specified',
      target_market: responses.primary_market || 'Not specified',
      customer_type: responses.customer_type || 'Not specified',
      value_proposition: responses.business_idea_detail || responses.customer_problem || 'Not specified',
      revenue_model: responses.revenue_model || 'Not specified',
      year1_target: responses.revenue_target_year1 || 'Not specified',
      competitive_advantage: responses.competitive_advantage || 'Not specified',
      team_size: responses.team_size_year1 || 'Solo',
      funding_needed: responses.capital_needed || 'Bootstrapping',
      key_risks: responses.key_risks || [],
      launch_timeline: responses.launch_timeline || 'Not specified'
    }
  }

  static generateFinancialProjections(responses: Record<string, any>): FinancialProjections {
    const year1Revenue = typeof responses.revenue_target_year1 === 'number'
      ? responses.revenue_target_year1
      : 0
    const growthRate = responses.growth_rate || '50-100%'

    // Parse growth rate
    let growth = 0.50 // Default
    if (growthRate.includes('20-40')) growth = 0.30
    if (growthRate.includes('50-100')) growth = 0.75
    if (growthRate.includes('100-200')) growth = 1.50
    if (growthRate.includes('200+')) growth = 2.00

    const cac = typeof responses.target_cac === 'number' ? responses.target_cac : 0
    const ltv = typeof responses.ltv === 'number' ? responses.ltv : 0

    const projections: FinancialProjections = {
      year1: year1Revenue,
      year2: year1Revenue * (1 + growth),
      year3: year1Revenue * (1 + growth) ** 2,
      year4: year1Revenue * (1 + growth) ** 3,
      year5: year1Revenue * (1 + growth) ** 4,
      gross_margin: typeof responses.gross_margin === 'number' ? responses.gross_margin : 0.50,
      target_cac: cac,
      ltv: ltv,
      ltv_cac_ratio: cac > 0 ? ltv / cac : 0
    }

    return projections
  }

  static generateCompleteModel(userId: string, responses: Record<string, any>): CompleteBusinessModel {
    return {
      executive_summary: this.generateExecutiveSummary(responses),
      financial_projections: this.generateFinancialProjections(responses),
      market_analysis: {
        target_customer: {
          type: responses.customer_type || '',
          demographics: {
            age: responses.target_age || '',
            income: responses.target_income || '',
            location: responses.target_location || ''
          }
        },
        market_size: 'Auto-generated based on inputs',
        competition: responses.top_competitors || []
      },
      operations_plan: {
        team_structure: responses.team_size_year1 || '',
        key_roles: responses.hiring_priorities || [],
        technology: responses.tech_stack || [],
        vendors: responses.key_vendors || []
      },
      go_to_market: {
        channels: responses.acquisition_channels || [],
        budget: responses.marketing_budget || '',
        sales_model: responses.sales_model || '',
        launch_timeline: responses.launch_timeline || ''
      },
      funding_strategy: {
        needed: responses.capital_needed || '',
        type: responses.funding_stage || '',
        use_of_funds: responses.funds_allocation || '',
        valuation: responses.target_valuation || ''
      },
      risk_assessment: {
        key_risks: responses.key_risks || [],
        mitigations: responses.risk_mitigation || '',
        assumptions: responses.key_assumptions || []
      },
      metadata: {
        generated_at: new Date().toISOString(),
        user_id: userId,
        question_count: Object.keys(responses).length
      }
    }
  }
}

// ==========================================
// EXAMPLE USAGE
// ==========================================

export function exampleUsage(): void {
  // Initialize the questionnaire system
  const questionnaire = new BusinessModelQuestionnaire()

  // Start a session for a user
  const userId = 'user_123'
  const session = questionnaire.startSession(userId)
  console.log(`Started session for ${userId}`)

  // Get the first question
  const currentQuestion = questionnaire.getCurrentQuestion(userId)
  if (currentQuestion) {
    console.log(`First question: ${currentQuestion.question}`)
    console.log(`Type: ${currentQuestion.type}`)
    if (currentQuestion.options) {
      console.log(`Options: ${currentQuestion.options.map(opt => opt.label).join(', ')}`)
    }
  }

  // Simulate answering questions
  console.log('\n--- Simulating answers ---')

  // Answer first few questions
  const answers = [
    { answer: 'John Doe', expectedId: 'user_name' },
    { answer: 'john@example.com', expectedId: 'user_email' },
    { answer: 'continue', expectedId: 'checkpoint_auth' },
    { answer: 'bachelors', expectedId: 'education_level' },
    { answer: 'Computer Science', expectedId: 'education_field' }
  ]

  for (const { answer, expectedId } of answers) {
    const result = questionnaire.submitAnswer(userId, answer)
    console.log(`Answer '${answer}' -> ${result.message}`)
    if (result.nextQuestion) {
      console.log(`Next: ${result.nextQuestion.question.substring(0, 50)}...`)
    }
  }

  // Check progress
  const progress = questionnaire.getProgress(userId)
  if (progress) {
    console.log(`\nProgress: ${progress.progress_percentage}% complete`)
  }

  // Get responses summary
  const summary = questionnaire.getResponsesSummary(userId)
  if (summary) {
    console.log(`\nResponses collected: ${Object.keys(summary.responses).length}`)

    // Generate business model
    const model = BusinessModelGenerator.generateCompleteModel(userId, summary.responses)
    console.log(`\nGenerated business model with ${Object.keys(model).length} sections`)

    // Display executive summary
    console.log('\n--- Executive Summary ---')
    console.log(`Business: ${model.executive_summary.business_name}`)
    console.log(`Industry: ${model.executive_summary.industry}`)
    console.log(`Revenue Model: ${model.executive_summary.revenue_model}`)
    console.log(`Year 1 Target: ${model.executive_summary.year1_target}`)
  }
}

// Uncomment to run example
// exampleUsage()// Initialize questionnaire
const questionnaire = new BusinessModelQuestionnaire()

// Start session
const session = questionnaire.startSession('user_123')

// Get current question
const current = questionnaire.getCurrentQuestion('user_123')

// Submit answer
const result = questionnaire.submitAnswer('user_123', 'answer')

// Get progress
const progress = questionnaire.getProgress('user_123')

// Generate business model (example - requires responses object)
// const model = BusinessModelGenerator.generateCompleteModel('user_123', responses)