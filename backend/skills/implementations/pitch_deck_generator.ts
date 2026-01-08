/**
 * Pitch Deck Generator Skill Implementation
 * Generates investor-ready pitch decks with Poppins typography and monochrome design
 */

import {
    Skill,
    ToolDefinition,
    SkillExecutionError
} from '../../utils/types';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * MANDATORY DESIGN SYSTEM (same as branded_document_generator)
 */
const PITCH_DECK_DESIGN_SYSTEM = {
    typography: {
        primaryFont: 'Poppins',
        slideTitle: { weight: 700, size: 32 }, // Bold
        heading: { weight: 600, size: 24 }, // SemiBold
        body: { weight: 400, size: 16 }, // Regular
        caption: { weight: 300, size: 12 } // Light
    },
    colors: {
        mode: 'monochrome',
        palette: {
            black: '#000000',
            darkGray: '#333333',
            mediumGray: '#666666',
            gray: '#999999',
            lightGray: '#CCCCCC',
            paleGray: '#E5E5E5',
            offWhite: '#F5F5F5',
            white: '#FFFFFF'
        }
    },
    layout: {
        aspectRatio: '16:9',
        style: 'minimalist',
        whitespace: 'generous'
    }
} as const;

/**
 * Pitch Deck Input
 */
interface PitchDeckInput {
    deck_type: 'full' | 'elevator' | 'data_room';
    business_name: string;
    business_data: {
        problem?: string;
        solution?: string;
        market_size?: { tam: number; sam: number; som: number };
        competitors?: string[];
        revenue_streams?: any[];
        financial_projections?: any;
        unit_economics?: { cac: number; ltv: number; ratio: number };
        team?: any[];
        funding_ask?: { amount: number; use_of_funds: any };
        traction?: any;
    };
    branding?: {
        logo_url?: string;
        tagline?: string;
    };
}

/**
 * Pitch Deck Output
 */
interface PitchDeckOutput {
    deck_id: string;
    deck_url: string;
    deck_type: 'full' | 'elevator' | 'data_room';
    slide_count: number;
    format: 'pptx';
    status: 'generated';
    generated_at: string;
    design_system: {
        font: string;
        color_mode: string;
        style: string;
    };
}

/**
 * Execute pitch deck generation
 */
async function execute(params: PitchDeckInput): Promise<PitchDeckOutput> {
    try {
        logger.info('Executing pitch deck generation', {
            business: params.business_name,
            type: params.deck_type
        });

        // Validate business data completeness
        validateBusinessData(params.business_data);

        // Generate appropriate deck based on type
        let slideCount: number;
        switch (params.deck_type) {
            case 'full':
                slideCount = await generateFullDeck(params);
                break;
            case 'elevator':
                slideCount = await generateElevatorDeck(params);
                break;
            case 'data_room':
                slideCount = await generateDataRoomDeck(params);
                break;
            default:
                throw new Error(`Unknown deck type: ${params.deck_type}`);
        }

        // Simulate generation latency
        await new Promise(resolve => setTimeout(resolve, 3000));

        const deckId = uuidv4();
        const timestamp = new Date().toISOString();

        const output: PitchDeckOutput = {
            deck_id: deckId,
            deck_url: `https://storage.oneasy.ai/pitch-decks/${deckId}.pptx`,
            deck_type: params.deck_type,
            slide_count: slideCount,
            format: 'pptx',
            status: 'generated',
            generated_at: timestamp,
            design_system: {
                font: PITCH_DECK_DESIGN_SYSTEM.typography.primaryFont,
                color_mode: PITCH_DECK_DESIGN_SYSTEM.colors.mode,
                style: PITCH_DECK_DESIGN_SYSTEM.layout.style
            }
        };

        logger.info('Pitch deck generation complete', {
            id: output.deck_id,
            url: output.deck_url,
            slides: output.slide_count,
            font: PITCH_DECK_DESIGN_SYSTEM.typography.primaryFont,
            colorMode: PITCH_DECK_DESIGN_SYSTEM.colors.mode
        });

        return output;
    } catch (error) {
        logger.error('Pitch deck generation failed', error);
        throw new SkillExecutionError('Pitch deck generation failed', 'pitch_deck_generator', error);
    }
}

/**
 * Validate business data completeness
 */
function validateBusinessData(data: any): void {
    const errors: string[] = [];

    if (!data.problem) errors.push('Missing problem statement');
    if (!data.solution) errors.push('Missing solution description');
    if (!data.market_size) errors.push('Missing market size data');

    if (errors.length > 0) {
        throw new Error('Incomplete business data: ' + errors.join(', '));
    }
}

/**
 * Generate Full Deck (12-15 slides)
 */
async function generateFullDeck(params: PitchDeckInput): Promise<number> {
    logger.info('Generating full pitch deck (12-15 slides)');

    // In real implementation:
    // 1. Use pptxgenjs library
    // 2. Create slides with Poppins font
    // 3. Apply monochrome color scheme
    // 4. Generate charts in grayscale (use Chart.js or similar)
    // 5. Add images (converted to grayscale)
    // 6. Export as PPTX

    // Slide structure:
    // 1. Cover
    // 2. Problem
    // 3. Solution
    // 4. Market Opportunity
    // 5. Product
    // 6. Business Model
    // 7. Traction
    // 8. Competition
    // 9. Unit Economics
    // 10. Team
    // 11. Financial Projections
    // 12. Funding Ask
    // 13. Vision/Roadmap (optional)
    // 14. Appendix (optional)

    return 13; // Simulated slide count
}

/**
 * Generate Elevator Deck (5 slides)
 */
async function generateElevatorDeck(params: PitchDeckInput): Promise<number> {
    logger.info('Generating elevator pitch deck (5 slides)');

    // Quick version:
    // 1. Cover
    // 2. Problem & Solution
    // 3. Market & Traction
    // 4. Business Model & Unit Economics
    // 5. Team & Ask

    return 5;
}

/**
 * Generate Data Room Deck (20+ slides)
 */
async function generateDataRoomDeck(params: PitchDeckInput): Promise<number> {
    logger.info('Generating data room deck (20+ slides)');

    // Detailed version with appendices:
    // Full deck + detailed financials + customer case studies + detailed roadmap

    return 24;
}

/**
 * Get tool definition for Groq function calling
 */
function getToolDefinition(): ToolDefinition {
    return {
        type: 'function',
        function: {
            name: 'pitch_deck_generator',
            description: 'Generate investor-ready pitch decks with Poppins typography and monochrome design. Supports full (12-15 slides), elevator (5 slides), and data room (20+ slides) formats.',
            parameters: {
                type: 'object',
                properties: {
                    deck_type: {
                        type: 'string',
                        enum: ['full', 'elevator', 'data_room'],
                        description: 'Type of pitch deck to generate'
                    },
                    business_name: {
                        type: 'string',
                        description: 'Name of the business'
                    },
                    business_data: {
                        type: 'object',
                        description: 'Complete business data from all framework phases',
                        properties: {
                            problem: { type: 'string' },
                            solution: { type: 'string' },
                            market_size: {
                                type: 'object',
                                properties: {
                                    tam: { type: 'number' },
                                    sam: { type: 'number' },
                                    som: { type: 'number' }
                                }
                            },
                            competitors: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            revenue_streams: { type: 'array' },
                            financial_projections: { type: 'object' },
                            unit_economics: {
                                type: 'object',
                                properties: {
                                    cac: { type: 'number' },
                                    ltv: { type: 'number' },
                                    ratio: { type: 'number' }
                                }
                            },
                            team: { type: 'array' },
                            funding_ask: {
                                type: 'object',
                                properties: {
                                    amount: { type: 'number' },
                                    use_of_funds: { type: 'object' }
                                }
                            },
                            traction: { type: 'object' }
                        }
                    },
                    branding: {
                        type: 'object',
                        properties: {
                            logo_url: { type: 'string' },
                            tagline: { type: 'string' }
                        }
                    }
                },
                required: ['deck_type', 'business_name', 'business_data']
            }
        }
    };
}

export const pitchDeckGeneratorSkill: Skill = {
    id: 'pitch_deck_generator',
    name: 'Pitch Deck Generator',
    description: 'Generate professional investor pitch decks with Poppins font and monochrome design',
    execute,
    getToolDefinition
};
