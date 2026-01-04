/**
 * Market Sizing Calculator Skill Implementation
 * Calculates TAM, SAM, and SOM for market analysis
 */

import {
    Skill,
    ToolDefinition,
    MarketSizingInput,
    MarketSizingOutput,
    SkillExecutionError
} from '../../utils/types';
import { logger } from '../../utils/logger';

/**
 * Market size data (simplified - in production would use real data sources)
 */
const MARKET_DATA: Record<string, any> = {
    'saas': { global_tam: 195000000000, growth_rate: 18 },
    'ecommerce': { global_tam: 5700000000000, growth_rate: 14 },
    'fintech': { global_tam: 310000000000, growth_rate: 23 },
    'healthtech': { global_tam: 280000000000, growth_rate: 21 },
    'edtech': { global_tam: 254000000000, growth_rate: 17 },
    'food_delivery': { global_tam: 150000000000, growth_rate: 11 },
    'default': { global_tam: 100000000000, growth_rate: 10 }
};

const GEOGRAPHY_MULTIPLIERS: Record<string, number> = {
    'global': 1.0,
    'north_america': 0.35,
    'europe': 0.25,
    'asia': 0.30,
    'india': 0.08,
    'usa': 0.30,
    'default': 0.05
};

/**
 * Calculate TAM (Total Addressable Market)
 */
function calculateTAM(industry: string, geography: string): number {
    const industryKey = industry.toLowerCase().replace(/\s+/g, '_');
    const geoKey = geography.toLowerCase().replace(/\s+/g, '_');

    const marketData = MARKET_DATA[industryKey] || MARKET_DATA['default'];
    const geoMultiplier = GEOGRAPHY_MULTIPLIERS[geoKey] || GEOGRAPHY_MULTIPLIERS['default'];

    return marketData.global_tam * geoMultiplier;
}

/**
 * Calculate SAM (Serviceable Addressable Market)
 * Typically 10-30% of TAM based on target segment
 */
function calculateSAM(tam: number, targetSegment: string): number {
    // Segment multipliers (how much of TAM is addressable)
    const segmentMultipliers: Record<string, number> = {
        'enterprise': 0.15,
        'smb': 0.25,
        'consumer': 0.30,
        'b2b': 0.20,
        'b2c': 0.25,
        'default': 0.20
    };

    const segmentKey = targetSegment.toLowerCase().replace(/\s+/g, '_');
    const multiplier = segmentMultipliers[segmentKey] || segmentMultipliers['default'];

    return tam * multiplier;
}

/**
 * Calculate SOM (Serviceable Obtainable Market)
 * Typically 5-15% of SAM in first 3-5 years
 */
function calculateSOM(sam: number, approach: string): number {
    // Conservative estimate: 10% of SAM in 5 years
    const somMultiplier = approach === 'bottom_up' ? 0.08 : 0.10;
    return sam * somMultiplier;
}

/**
 * Determine confidence level based on data quality
 */
function determineConfidence(industry: string, geography: string): 'high' | 'medium' | 'low' {
    const hasGoodData = MARKET_DATA.hasOwnProperty(industry.toLowerCase().replace(/\s+/g, '_'));
    const hasGoodGeo = GEOGRAPHY_MULTIPLIERS.hasOwnProperty(geography.toLowerCase().replace(/\s+/g, '_'));

    if (hasGoodData && hasGoodGeo) return 'high';
    if (hasGoodData || hasGoodGeo) return 'medium';
    return 'low';
}

/**
 * Execute market sizing calculation
 */
async function execute(params: MarketSizingInput): Promise<MarketSizingOutput> {
    try {
        logger.info('Executing market sizing', {
            industry: params.industry,
            geography: params.geography
        });

        const tam = calculateTAM(params.industry, params.geography);
        const sam = calculateSAM(tam, params.target_segment);
        const som = calculateSOM(sam, params.approach);

        const confidence = determineConfidence(params.industry, params.geography);

        const assumptions = [
            `Industry: ${params.industry}`,
            `Geography: ${params.geography}`,
            `Target Segment: ${params.target_segment}`,
            `Approach: ${params.approach}`,
            `SAM estimated at 20% of TAM (typical for ${params.target_segment})`,
            `SOM estimated at 10% of SAM (achievable in 5 years)`
        ];

        const methodology = params.approach === 'top_down'
            ? 'Top-down analysis using industry reports and market data'
            : params.approach === 'bottom_up'
                ? 'Bottom-up analysis based on customer segments and pricing'
                : 'Hybrid approach combining top-down and bottom-up methodologies';

        const output: MarketSizingOutput = {
            tam,
            sam,
            som,
            methodology,
            assumptions,
            confidence_level: confidence
        };

        logger.info('Market sizing complete', {
            tam: tam.toLocaleString(),
            sam: sam.toLocaleString(),
            som: som.toLocaleString(),
            confidence
        });

        return output;
    } catch (error) {
        logger.error('Market sizing failed', error);
        throw new SkillExecutionError('Market sizing execution failed', 'market_sizing_calculator', error);
    }
}

/**
 * Get tool definition for Groq function calling
 */
function getToolDefinition(): ToolDefinition {
    return {
        type: 'function',
        function: {
            name: 'market_sizing_calculator',
            description: 'Calculate Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM) for a business opportunity.',
            parameters: {
                type: 'object',
                properties: {
                    industry: {
                        type: 'string',
                        description: 'Industry or market category (e.g., SaaS, ecommerce, fintech)'
                    },
                    geography: {
                        type: 'string',
                        description: 'Geographic market (e.g., global, USA, India, Europe)'
                    },
                    target_segment: {
                        type: 'string',
                        description: 'Target customer segment (e.g., enterprise, SMB, consumer, B2B)'
                    },
                    approach: {
                        type: 'string',
                        enum: ['top_down', 'bottom_up', 'both'],
                        description: 'Market sizing methodology'
                    }
                },
                required: ['industry', 'geography', 'target_segment', 'approach']
            }
        }
    };
}

export const marketSizingSkill: Skill = {
    id: 'market_sizing_calculator',
    name: 'Market Sizing Calculator',
    description: 'Calculate TAM, SAM, and SOM for market opportunity analysis',
    execute,
    getToolDefinition
};
