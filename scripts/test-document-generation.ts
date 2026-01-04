/**
 * Test Document Generation System
 * 
 * This script tests the document generation templates with FreshMeal example data
 */

import { generateCompanyProfile, generateBusinessPlan, type QuestionnaireAnswers } from '../lib/templates/document-templates.js';
import * as fs from 'fs';
import * as path from 'path';

// FreshMeal example data extracted from the questionnaire
const freshMealAnswers: QuestionnaireAnswers = {
    // Phase 1: Authentication & Onboarding
    full_name: 'Priya Mehta',
    email: 'priya.mehta@freshmeal.in',
    phone: '+91 98765 43210',
    preferred_language: 'English',
    current_location: 'Mumbai, Maharashtra, India',

    // Phase 2: User Discovery
    education: 'MBA',
    field_of_study: 'Business Administration',
    years_experience: '8 years',
    industries_worked: ['Food Industry', 'Operations', 'Delivery'],
    employment_status: 'Entrepreneur',
    professional_skills: ['Operations Management', 'Supply Chain', 'Last-mile Delivery', 'Food Safety'],
    personal_strengths: ['Problem Solving', 'Strategic Thinking', 'Team Leadership'],
    risk_tolerance: 9,
    capital_available: '₹50 lakhs - ₹2 crores',
    time_commitment: 'Full-time (40+ hours/week)',
    income_timeline: '6-12 months',
    linkedin_profile: 'linkedin.com/in/priyamehta',
    other_profiles: 'IIM Bangalore Alumni Network',

    // Phase 3: Business Context
    business_type: 'new',
    business_name: 'FreshMeals',
    problems_to_solve: `Urban professionals in Mumbai struggle to maintain healthy eating habits due to:
1. Lack of time to cook (averaging 2-3 hours/day commute + 10-hour workday)
2. Limited healthy options in office areas (80% of restaurants serve high-calorie, processed food)
3. Meal prep on weekends is time-consuming (4-6 hours) and ingredients spoil
4. Existing meal delivery services are either too expensive (₹300-500/meal) or unhealthy`,

    business_idea: `FreshMeals delivers chef-prepared, nutritionally balanced meals to offices and homes daily. Each meal is:
- Prepared fresh daily (not frozen)
- Macro-balanced (40% carbs, 30% protein, 30% healthy fats)
- Under 600 calories
- Priced at ₹149-199 per meal (60% cheaper than competitors)
- Customizable (vegetarian, vegan, high-protein, keto options)
- Delivered in eco-friendly packaging`,

    industry: 'Food & Beverage Technology (FoodTech)',
    target_customer: 'B2B2C (Tech companies and startups in Mumbai) and busy professionals working from home',
    unique_advantage: `1. Price: 60% cheaper than competitors (₹149 vs ₹300)
2. B2B focus: Office bulk orders = lower CAC, higher retention
3. Freshness: Daily prep vs. frozen meals (competitors ship frozen)
4. Customization: 6 dietary styles vs. competitors' 2-3`,

    business_model: 'Subscription-based (monthly recurring revenue)',
    stage: 'Pre-launch (prototype ready)',
    validation_status: 'Pilot with 3 companies (150 employees), 4.7/5 average rating',

    // Additional context
    market_size_tam: '₹18,000 Cr (entire food delivery market in India)',
    market_size_sam: '₹3,600 Cr (corporate meal delivery + health-conscious consumers in Mumbai)',
    market_size_som_year_1: '₹2 Cr (0.055% of SAM)',
    market_size_som_year_5: '₹100 Cr (2.8% of SAM)',

    competitors: 'HealthifyMe Meals (₹300/meal), FitMeals (₹250/meal), MyFitnessPal Kitchen (₹350/meal)',
    competitive_advantage: 'Price point, B2B focus, freshness, customization',

    revenue_model: 'Subscription tiers: Starter (₹2,999/month), Pro (₹4,999/month), Elite (₹8,999/month), Corporate (custom)',
    pricing_strategy: '60% below competitors while maintaining 60% gross margins',

    funding_required: '₹75 lakhs seed round',
    funding_use: 'Kitchen & Equipment (30%), Marketing & Sales (35%), Operations & Hiring (25%), Working Capital (10%)',
};

async function testDocumentGeneration() {
    console.log('🧪 Testing Document Generation System\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Generate Company Profile
        console.log('\n📄 Test 1: Generating Company Profile...');
        const startProfile = Date.now();
        const companyProfile = await generateCompanyProfile(freshMealAnswers);
        const profileTime = Date.now() - startProfile;

        console.log(`✅ Generated in ${profileTime}ms`);
        console.log(`   Length: ${companyProfile.length} characters`);
        console.log(`   Lines: ${companyProfile.split('\n').length}`);

        // Save to file
        const profilePath = path.join(__dirname, '../test_output/company_profile.md');
        fs.mkdirSync(path.dirname(profilePath), { recursive: true });
        fs.writeFileSync(profilePath, companyProfile);
        console.log(`   Saved to: ${profilePath}`);

        // Test 2: Generate Business Plan
        console.log('\n📊 Test 2: Generating Business Plan...');
        const startPlan = Date.now();
        const businessPlan = await generateBusinessPlan(freshMealAnswers);
        const planTime = Date.now() - startPlan;

        console.log(`✅ Generated in ${planTime}ms`);
        console.log(`   Length: ${businessPlan.length} characters`);
        console.log(`   Lines: ${businessPlan.split('\n').length}`);

        // Save to file
        const planPath = path.join(__dirname, '../test_output/business_plan.md');
        fs.writeFileSync(planPath, businessPlan);
        console.log(`   Saved to: ${planPath}`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests passed!');
        console.log(`Total execution time: ${profileTime + planTime}ms`);
        console.log(`\nGenerated files:`);
        console.log(`  - ${profilePath}`);
        console.log(`  - ${planPath}`);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests
testDocumentGeneration();
