/**
 * Financial Modeling Skill Implementation
 * Performs financial calculations, projections, and analysis
 */

import {
    Skill,
    ToolDefinition,
    FinancialModelingInput,
    FinancialModelingOutput,
    SkillExecutionError
} from '../../utils/types';
import { logger } from '../../utils/logger';

/**
 * Calculate monthly revenue for Year 1
 */
function calculateMonthlyRevenue(products: any[]): number[] {
    const monthlyRevenue: number[] = new Array(12).fill(0);

    products.forEach(product => {
        let quantity = product.initial_quantity_m1;

        for (let month = 0; month < 12; month++) {
            const revenue = quantity * product.avg_price;
            monthlyRevenue[month] += revenue;

            // Apply growth rate for next month
            if (month < 11) {
                const growthRate = product.growth_rates_m[month] || 0;
                quantity = quantity * (1 + growthRate / 100);

                // Apply churn if recurring
                if (product.churn_rate) {
                    quantity = quantity * (1 - product.churn_rate / 100);
                }
            }
        }
    });

    return monthlyRevenue;
}

/**
 * Calculate annual revenue for Years 2-7
 */
function calculateAnnualRevenue(year1Total: number, growthRates: number[]): number[] {
    const annualRevenue: number[] = [];
    let previousYear = year1Total;

    for (let i = 0; i < growthRates.length; i++) {
        const revenue = previousYear * (1 + growthRates[i] / 100);
        annualRevenue.push(revenue);
        previousYear = revenue;
    }

    return annualRevenue;
}

/**
 * Calculate COGS and gross profit
 */
function calculateGrossProfit(revenue: number[], cogsPercentage: number) {
    const cogs = revenue.map(r => r * (cogsPercentage / 100));
    const grossProfit = revenue.map((r, i) => r - cogs[i]);
    const margin = revenue[0] > 0 ? ((grossProfit[0] / revenue[0]) * 100) : 0;

    return { cogs, grossProfit, margin };
}

/**
 * Calculate EBITDA and find break-even
 */
function calculateEBITDA(
    grossProfit: number[],
    revenue: number[],
    opexPercentages: any
): { ebitda: number[]; breakEvenMonth: number; margins: number[] } {
    const ebitda: number[] = [];
    let breakEvenMonth = -1;

    grossProfit.forEach((gp, month) => {
        const year = Math.floor(month / 12) + 1;
        const yearKey = `y${year}`;

        const smPercent = opexPercentages.sales_marketing[yearKey] || 35;
        const rdPercent = opexPercentages.research_development[yearKey] || 30;
        const gaPercent = opexPercentages.general_administrative[yearKey] || 15;

        const totalOpex = revenue[month] * ((smPercent + rdPercent + gaPercent) / 100);
        const monthEbitda = gp - totalOpex;

        ebitda.push(monthEbitda);

        if (breakEvenMonth === -1 && monthEbitda > 0) {
            breakEvenMonth = month + 1;
        }
    });

    const margins = ebitda.map((e, i) => revenue[i] > 0 ? (e / revenue[i]) * 100 : 0);

    return { ebitda, breakEvenMonth, margins };
}

/**
 * Calculate key SaaS metrics
 */
function calculateSaaSMetrics(
    revenue: number[],
    ebitdaMargins: number[]
): { arr_y5: number; rule_of_40_y5: number } {
    const y5Revenue = revenue[revenue.length - 1] || 0;
    const y4Revenue = revenue[revenue.length - 2] || 0;

    const growthRate = y4Revenue > 0 ? ((y5Revenue - y4Revenue) / y4Revenue) * 100 : 0;
    const ebitdaMargin = ebitdaMargins[ebitdaMargins.length - 1] || 0;

    return {
        arr_y5: y5Revenue,
        rule_of_40_y5: growthRate + ebitdaMargin
    };
}

/**
 * Validate financial model
 */
function validateModel(output: FinancialModelingOutput): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check gross margin
    if (output.gross_profit.margin_pct_y1 < 60) {
        warnings.push(`Low gross margin (${output.gross_profit.margin_pct_y1.toFixed(1)}%). Target: >70% for SaaS.`);
    }

    // Check break-even
    if (output.ebitda.break_even_month > 48) {
        warnings.push(`Late break-even (Month ${output.ebitda.break_even_month}). Investors prefer <36 months.`);
    } else if (output.ebitda.break_even_month < 0) {
        errors.push('Business does not reach break-even in projection period.');
    }

    // Check Rule of 40
    if (output.saas_metrics && output.saas_metrics.rule_of_40_y5 < 40) {
        warnings.push(`Rule of 40 is ${output.saas_metrics.rule_of_40_y5.toFixed(1)}. Target: >40.`);
    }

    output.validation_results = {
        pass: errors.length === 0,
        warnings,
        errors
    };
}

/**
 * Execute financial modeling
 */
async function execute(params: FinancialModelingInput): Promise<FinancialModelingOutput> {
    try {
        logger.info('Executing financial modeling', {
            products: params.revenue_data.products.length,
            years: params.projection_period.years
        });

        // Calculate Year 1 monthly revenue
        const year1Monthly = calculateMonthlyRevenue(params.revenue_data.products);
        const year1Total = year1Monthly.reduce((sum, r) => sum + r, 0);

        // Calculate Years 2-7 annual revenue
        const avgGrowthRates = params.revenue_data.products[0]?.growth_rates_y || [100, 80, 60, 40, 30, 20];
        const years2to7 = calculateAnnualRevenue(year1Total, avgGrowthRates);

        // Combine all revenue periods
        const allRevenue = [...year1Monthly, ...years2to7];

        // Calculate COGS and gross profit
        const avgCogsPercent = params.revenue_data.products[0]?.cogs_percentage || 20;
        const { grossProfit, margin } = calculateGrossProfit(allRevenue, avgCogsPercent);

        // Calculate EBITDA
        const { ebitda, breakEvenMonth, margins } = calculateEBITDA(
            grossProfit,
            allRevenue,
            params.cost_structure.opex_percentages
        );

        // Calculate SaaS metrics
        const saasMetrics = calculateSaaSMetrics(allRevenue, margins);

        // Calculate capital requirements (simplified)
        const negativeCashFlow = ebitda
            .slice(0, breakEvenMonth > 0 ? breakEvenMonth : 12)
            .filter(e => e < 0)
            .reduce((sum, e) => sum + Math.abs(e), 0);

        const totalCapitalRequired = negativeCashFlow + params.assumptions.starting_cash;
        const peakBurnRate = Math.max(...ebitda.slice(0, 12).map(e => Math.abs(Math.min(0, e))));

        const output: FinancialModelingOutput = {
            revenue: {
                year_1_monthly: year1Monthly,
                years_2_7_annual: years2to7,
                total_y1: year1Total,
                total_y5: years2to7[3] || 0
            },
            gross_profit: {
                year_1_monthly: grossProfit.slice(0, 12),
                margin_pct_y1: margin,
                margin_pct_y5: margin // Simplified - same margin
            },
            ebitda: {
                break_even_month: breakEvenMonth,
                year_1_avg_margin: margins.slice(0, 12).reduce((sum, m) => sum + m, 0) / 12,
                year_5_margin: margins[margins.length - 1] || 0
            },
            summary_metrics: {
                total_capital_required: totalCapitalRequired,
                peak_burn_rate: peakBurnRate,
                break_even_month: breakEvenMonth,
                profitability_month: breakEvenMonth, // Simplified
                cagr_y1_y5: years2to7[3] > 0 ? ((Math.pow(years2to7[3] / year1Total, 1 / 5) - 1) * 100) : 0
            },
            saas_metrics: saasMetrics,
            validation_results: {
                pass: true,
                warnings: [],
                errors: []
            }
        };

        // Validate the model
        validateModel(output);

        logger.info('Financial modeling complete', {
            y1_revenue: output.revenue.total_y1,
            break_even: output.ebitda.break_even_month,
            validation: output.validation_results.pass ? 'PASS' : 'FAIL'
        });

        return output;
    } catch (error) {
        logger.error('Financial modeling failed', error);
        throw new SkillExecutionError('Financial modeling execution failed', 'financial_modeling', error);
    }
}

/**
 * Get tool definition for Groq function calling
 */
function getToolDefinition(): ToolDefinition {
    return {
        type: 'function',
        function: {
            name: 'financial_modeling',
            description: 'Calculate comprehensive financial projections including revenue, costs, profitability, and key metrics for a business over 5-7 years.',
            parameters: {
                type: 'object',
                properties: {
                    revenue_data: {
                        type: 'object',
                        description: 'Revenue model with products and growth rates',
                        properties: {
                            products: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        initial_quantity_m1: { type: 'number' },
                                        avg_price: { type: 'number' },
                                        growth_rates_m: { type: 'array', items: { type: 'number' } },
                                        growth_rates_y: { type: 'array', items: { type: 'number' } },
                                        cogs_percentage: { type: 'number' },
                                        churn_rate: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    cost_structure: {
                        type: 'object',
                        description: 'Operating expense percentages by year',
                        properties: {
                            opex_percentages: {
                                type: 'object',
                                properties: {
                                    sales_marketing: { type: 'object' },
                                    research_development: { type: 'object' },
                                    general_administrative: { type: 'object' }
                                }
                            }
                        }
                    },
                    projection_period: {
                        type: 'object',
                        properties: {
                            years: { type: 'number' },
                            detail_level: { type: 'string' }
                        }
                    },
                    assumptions: {
                        type: 'object',
                        properties: {
                            tax_rate: { type: 'number' },
                            starting_cash: { type: 'number' },
                            payment_terms_days: { type: 'number' }
                        }
                    }
                },
                required: ['revenue_data', 'cost_structure', 'projection_period', 'assumptions']
            }
        }
    };
}

export const financialModelingSkill: Skill = {
    id: 'financial_modeling',
    name: 'Financial Modeling',
    description: 'Calculate comprehensive financial projections and key business metrics',
    execute,
    getToolDefinition
};
