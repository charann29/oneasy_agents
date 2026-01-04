/**
 * Skip Logic for Business Model Questionnaire
 * Defines which questions to skip based on previous answers
 */

// ============================================================================
// Types
// ============================================================================

export type SkipCondition = (answers: Record<string, any>) => boolean;

export interface SkipRule {
    questionId: string;
    condition: SkipCondition;
    reason: string;
}

// ============================================================================
// Skip Rules by Phase
// ============================================================================

/**
 * Phase 2: User Discovery Skip Rules
 */
export const PHASE_2_SKIP_RULES: SkipRule[] = [
    {
        questionId: 'education_field',
        condition: (answers) => answers.education_level === 'self_taught',
        reason: 'Self-taught users do not have a formal field of study'
    },
    {
        questionId: 'industries_worked',
        condition: (answers) => answers.years_experience === '0',
        reason: 'No work experience means no industries worked in'
    }
];

/**
 * Phase 3: Business Context Skip Rules
 */
export const PHASE_3_SKIP_RULES: SkipRule[] = [
    // NEW BUSINESS PATH SKIPS
    {
        questionId: 'idea_status',
        condition: (answers) => answers.business_path === 'existing',
        reason: 'Existing businesses already have an idea'
    },
    {
        questionId: 'business_idea_detail',
        condition: (answers) => answers.business_path === 'existing',
        reason: 'Existing businesses describe their current business instead'
    },
    {
        questionId: 'target_industries',
        condition: (answers) => answers.business_path === 'existing',
        reason: 'Existing businesses already know their target industries'
    },

    // EXISTING BUSINESS PATH SKIPS
    {
        questionId: 'existing_name',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses have a name'
    },
    {
        questionId: 'existing_website',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses may have a website'
    },
    {
        questionId: 'existing_industry',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses have a current industry'
    },
    {
        questionId: 'business_start_date',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses have a start date'
    },
    {
        questionId: 'current_revenue',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses have current revenue'
    },
    {
        questionId: 'legal_entity',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses are registered'
    },
    {
        questionId: 'current_products',
        condition: (answers) => answers.business_path !== 'existing',
        reason: 'Only existing businesses have current products'
    },

    // IDEA GENERATION SKIPS
    {
        questionId: 'problem_to_solve',
        condition: (answers) => answers.idea_status === 'need_suggestions',
        reason: 'Users without ideas will get problem suggestions'
    }
];

/**
 * Phase 4: Market Analysis Skip Rules
 */
export const PHASE_4_SKIP_RULES: SkipRule[] = [
    // EXPANSION SKIPS
    {
        questionId: 'expansion_timeline',
        condition: (answers) => answers.expansion_plan !== 'yes',
        reason: 'No expansion plan means no timeline needed'
    },
    {
        questionId: 'target_regions',
        condition: (answers) => !['yes', 'maybe_later'].includes(answers.international_plan),
        reason: 'No international plans means no target regions'
    },

    // B2C DEMOGRAPHIC SKIPS (skip for B2B/B2G)
    {
        questionId: 'target_age',
        condition: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
        reason: 'B2B/B2G does not target age demographics'
    },
    {
        questionId: 'target_gender',
        condition: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
        reason: 'B2B/B2G does not target gender demographics'
    },
    {
        questionId: 'target_income',
        condition: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
        reason: 'B2B/B2G does not target income levels of individuals'
    },
    {
        questionId: 'target_education',
        condition: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
        reason: 'B2B/B2G does not target education levels'
    },
    {
        questionId: 'customer_interests',
        condition: (answers) => ['b2b', 'b2g'].includes(answers.customer_type),
        reason: 'B2B/B2G does not target lifestyle interests'
    },

    // B2B COMPANY SKIPS (skip for B2C)
    {
        questionId: 'company_size_target',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not target company sizes'
    },
    {
        questionId: 'target_industries_b2b',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not target specific industries'
    },
    {
        questionId: 'company_revenue_target',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not target company revenue ranges'
    },
    {
        questionId: 'decision_maker',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not have business decision makers'
    },
    {
        questionId: 'business_problem_b2b',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not focus on business problems'
    },
    {
        questionId: 'current_solution',
        condition: (answers) => !['b2b', 'b2b2c', 'b2g', 'hybrid'].includes(answers.customer_type),
        reason: 'B2C does not analyze current business solutions'
    }
];

/**
 * Phase 5: Revenue Model Skip Rules
 */
export const PHASE_5_SKIP_RULES: SkipRule[] = [
    // Skip recurring-specific questions for one-time revenue
    {
        questionId: 'billing_frequency',
        condition: (answers) => answers.revenue_model === 'one_time',
        reason: 'One-time revenue does not have billing frequency'
    },
    {
        questionId: 'churn_rate',
        condition: (answers) => answers.revenue_model === 'one_time',
        reason: 'One-time revenue does not have churn'
    },
    {
        questionId: 'expansion_revenue',
        condition: (answers) => answers.revenue_model === 'one_time',
        reason: 'One-time revenue does not have expansion'
    },
    {
        questionId: 'nrr',
        condition: (answers) => answers.revenue_model === 'one_time',
        reason: 'Net Revenue Retention only applies to recurring'
    }
];

/**
 * Phase 7: Operations Skip Rules
 */
export const PHASE_7_SKIP_RULES: SkipRule[] = [
    {
        questionId: 'cofounder_skills',
        condition: (answers) => answers.need_cofounder === 'solo',
        reason: 'Solo founders do not need co-founder skills'
    },
    {
        questionId: 'hiring_priorities',
        condition: (answers) => answers.team_size_year1 === 'just_me',
        reason: 'Solo operators do not have hiring priorities'
    },
    {
        questionId: 'employment_model',
        condition: (answers) => answers.team_size_year1 === 'just_me',
        reason: 'Solo operators do not choose employment models'
    },
    {
        questionId: 'manufacturing',
        condition: (answers) => ['service', 'saas', 'agency', 'consulting'].includes(answers.business_model_type),
        reason: 'Service/SaaS businesses do not have manufacturing'
    }
];

/**
 * Phase 8: GTM Skip Rules
 */
export const PHASE_8_SKIP_RULES: SkipRule[] = [
    {
        questionId: 'sales_team',
        condition: (answers) => answers.sales_model === 'self_serve',
        reason: 'Self-serve model does not need sales team'
    },
    {
        questionId: 'commission_structure',
        condition: (answers) => answers.sales_team === 'founder' || answers.sales_model === 'self_serve',
        reason: 'No commission structure for founder-led or self-serve'
    }
];

/**
 * Phase 9: Funding Skip Rules
 */
export const PHASE_9_SKIP_RULES: SkipRule[] = [
    {
        questionId: 'funding_stage',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not have funding stages'
    },
    {
        questionId: 'capital_needed',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not need external capital'
    },
    {
        questionId: 'funds_allocation',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not allocate raised funds'
    },
    {
        questionId: 'equity_dilution',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not dilute equity'
    },
    {
        questionId: 'target_valuation',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not need valuation'
    },
    {
        questionId: 'investor_types',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not target investors'
    },
    {
        questionId: 'investor_connections',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not need investor connections'
    },
    {
        questionId: 'investor_conversations',
        condition: (answers) => answers.external_funding === 'bootstrap',
        reason: 'Bootstrap does not have investor conversations'
    }
];

// ============================================================================
// Master Skip Rules
// ============================================================================

export const ALL_SKIP_RULES: SkipRule[] = [
    ...PHASE_2_SKIP_RULES,
    ...PHASE_3_SKIP_RULES,
    ...PHASE_4_SKIP_RULES,
    ...PHASE_5_SKIP_RULES,
    ...PHASE_7_SKIP_RULES,
    ...PHASE_8_SKIP_RULES,
    ...PHASE_9_SKIP_RULES
];

// Create a lookup map for fast access
const skipRulesMap = new Map<string, SkipRule>();
ALL_SKIP_RULES.forEach(rule => {
    skipRulesMap.set(rule.questionId, rule);
});

// ============================================================================
// Skip Logic Functions
// ============================================================================

/**
 * Check if a question should be skipped
 */
export function shouldSkip(questionId: string, answers: Record<string, any>): boolean {
    const rule = skipRulesMap.get(questionId);
    if (!rule) return false;

    try {
        return rule.condition(answers);
    } catch {
        // If condition fails, don't skip
        return false;
    }
}

/**
 * Get skip reason for a question
 */
export function getSkipReason(questionId: string, answers: Record<string, any>): string | null {
    const rule = skipRulesMap.get(questionId);
    if (!rule) return null;

    try {
        if (rule.condition(answers)) {
            return rule.reason;
        }
    } catch {
        // Ignore condition errors
    }

    return null;
}

/**
 * Get all questions that will be skipped given current answers
 */
export function getSkippedQuestions(answers: Record<string, any>): string[] {
    const skipped: string[] = [];

    for (const rule of ALL_SKIP_RULES) {
        try {
            if (rule.condition(answers)) {
                skipped.push(rule.questionId);
            }
        } catch {
            // Ignore condition errors
        }
    }

    return skipped;
}

/**
 * Get next non-skipped question index starting from a given index
 */
export function getNextQuestionIndex(
    questions: { id: string }[],
    startIndex: number,
    answers: Record<string, any>
): number {
    let index = startIndex;

    while (index < questions.length) {
        const question = questions[index];
        if (!shouldSkip(question.id, answers)) {
            return index;
        }
        index++;
    }

    return index; // Return past-end index if all remaining are skipped
}

/**
 * Count remaining questions (accounting for skips)
 */
export function countRemainingQuestions(
    questions: { id: string }[],
    currentIndex: number,
    answers: Record<string, any>
): number {
    let count = 0;

    for (let i = currentIndex; i < questions.length; i++) {
        if (!shouldSkip(questions[i].id, answers)) {
            count++;
        }
    }

    return count;
}

// ============================================================================
// Branching Points
// ============================================================================

export const BRANCHING_POINTS: Record<string, {
    questionId: string;
    branches: Record<string, string[]>;
    description: string;
}> = {
    business_path: {
        questionId: 'business_path',
        branches: {
            'new': ['idea_status', 'business_idea_detail', 'target_industries', 'problem_to_solve'],
            'existing': ['existing_name', 'existing_website', 'existing_industry', 'business_start_date', 'current_revenue', 'legal_entity', 'current_products'],
            'idea_only': ['idea_status', 'target_industries'],
            'informal': ['existing_name', 'idea_status']
        },
        description: 'Determines whether to ask new business or existing business questions'
    },
    customer_type: {
        questionId: 'customer_type',
        branches: {
            'b2c': ['target_age', 'target_gender', 'target_income', 'target_education', 'customer_interests'],
            'b2b': ['company_size_target', 'target_industries_b2b', 'company_revenue_target', 'decision_maker', 'business_problem_b2b', 'current_solution'],
            'b2b2c': ['target_age', 'target_gender', 'company_size_target', 'target_industries_b2b'],
            'b2g': ['company_size_target', 'target_industries_b2b', 'decision_maker'],
            'hybrid': ['target_age', 'target_income', 'company_size_target', 'target_industries_b2b']
        },
        description: 'Determines whether to ask B2C demographics or B2B firmographics'
    },
    external_funding: {
        questionId: 'external_funding',
        branches: {
            'yes': ['funding_stage', 'capital_needed', 'funds_allocation', 'equity_dilution', 'target_valuation', 'investor_types', 'investor_connections', 'investor_conversations'],
            'bootstrap': [], // Skip all funding questions
            'later': ['capital_needed', 'funds_allocation'] // Some questions
        },
        description: 'Determines whether to ask funding-related questions'
    }
};

/**
 * Get questions activated by a branching point answer
 */
export function getBranchQuestions(branchingPointId: string, answer: string): string[] {
    const branchPoint = BRANCHING_POINTS[branchingPointId];
    if (!branchPoint) return [];

    return branchPoint.branches[answer] || [];
}

console.log('✅ Skip logic loaded with', ALL_SKIP_RULES.length, 'rules');
