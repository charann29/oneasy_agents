/**
 * Branded Document Generator Skill Implementation
 * Generates professional, branded documents based on business planning data
 *
 * MANDATORY DESIGN SYSTEM:
 * - Font: Poppins ONLY (Regular 400, Medium 500, SemiBold 600, Bold 700)
 * - Colors: Monochrome ONLY (Black, Grays, White - NO other colors)
 * - Style: Minimalist, clean, generous whitespace
 */

import {
    Skill,
    ToolDefinition,
    BrandedDocumentGeneratorInput,
    BrandedDocumentGeneratorOutput,
    SkillExecutionError
} from '../../utils/types';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * MANDATORY DESIGN SYSTEM CONFIGURATION
 * These values are NON-NEGOTIABLE and must be enforced in all outputs
 */
const DESIGN_SYSTEM = {
    typography: {
        primaryFont: 'Poppins',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700
        },
        fallback: 'Arial, sans-serif' // Only used if Poppins fails to load
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
        },
        // Forbidden colors - NEVER use these
        forbidden: ['#', 'rgb', 'hsl'] // Any non-grayscale color
    },
    style: {
        approach: 'minimalist',
        whitespace: 'generous',
        layout: 'clean_grid',
        quality: 'investor_grade'
    }
} as const;

/**
 * Validate that a color is monochrome (grayscale only)
 */
function validateMonochromeColor(color: string): boolean {
    if (!color.startsWith('#')) return false;

    const hex = color.toUpperCase().replace('#', '');
    if (hex.length !== 6) return false;

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Grayscale means R = G = B
    return r === g && g === b;
}

/**
 * Validate design system compliance
 */
function validateDesignSystem(brandIdentity?: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check font
    if (brandIdentity?.font_family && brandIdentity.font_family !== 'Poppins') {
        errors.push(`Font must be Poppins. Got: ${brandIdentity.font_family}`);
    }

    // Check colors
    if (brandIdentity?.colors && Array.isArray(brandIdentity.colors)) {
        brandIdentity.colors.forEach((color: string, index: number) => {
            if (!validateMonochromeColor(color)) {
                errors.push(`Color ${index + 1} (${color}) is not monochrome. Only grayscale allowed.`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Execute branded document generation
 */
async function execute(params: BrandedDocumentGeneratorInput): Promise<BrandedDocumentGeneratorOutput> {
    try {
        logger.info('Executing branded document generation', {
            type: params.document_type,
            business: params.business_name,
            format: params.format
        });

        // CRITICAL: Validate design system compliance
        const validation = validateDesignSystem(params.brand_identity);
        if (!validation.valid) {
            logger.error('Design system validation failed', { errors: validation.errors });
            throw new Error(`Design system violations detected:\n${validation.errors.join('\n')}`);
        }

        // Override brand identity to enforce design system
        const enforcedBrandIdentity = {
            ...params.brand_identity,
            font_family: DESIGN_SYSTEM.typography.primaryFont,
            colors: params.brand_identity?.colors?.map((color: string) => {
                // Convert any non-grayscale to closest grayscale
                if (!validateMonochromeColor(color)) {
                    logger.warn(`Converting non-grayscale color ${color} to grayscale`);
                    return DESIGN_SYSTEM.colors.palette.darkGray;
                }
                return color;
            }) || [
                DESIGN_SYSTEM.colors.palette.black,
                DESIGN_SYSTEM.colors.palette.darkGray,
                DESIGN_SYSTEM.colors.palette.gray
            ]
        };

        logger.info('Design system enforced', {
            font: enforcedBrandIdentity.font_family,
            colors: enforcedBrandIdentity.colors
        });

        // Simulate document generation latency
        await new Promise(resolve => setTimeout(resolve, 2000));

        const documentId = uuidv4();
        const timestamp = new Date().toISOString();

        // In a real implementation, this would:
        // 1. Gather HTML/Markdown templates with Poppins font embedded
        // 2. Inject content with monochrome styling enforced
        // 3. Use puppeteer/pandoc with custom CSS for Poppins + B&W
        // 4. Generate PDF with embedded Poppins font
        // 5. Validate output has no colored elements
        // 6. Upload to cloud storage (S3/Supabase Storage)

        // For MVP, return a simulated success response
        const output: BrandedDocumentGeneratorOutput = {
            document_id: documentId,
            document_url: `https://storage.oneasy.ai/documents/${documentId}.${params.format}`,
            format: params.format,
            page_count: Math.floor(Math.random() * 10) + 5,
            status: 'generated',
            generated_at: timestamp,
            design_system: {
                font: DESIGN_SYSTEM.typography.primaryFont,
                color_mode: DESIGN_SYSTEM.colors.mode,
                style: DESIGN_SYSTEM.style.approach
            }
        };

        logger.info('Branded document generation complete (with design system)', {
            id: output.document_id,
            url: output.document_url,
            font: DESIGN_SYSTEM.typography.primaryFont,
            colorMode: DESIGN_SYSTEM.colors.mode
        });

        return output;
    } catch (error) {
        logger.error('Branded document generation failed', error);
        throw new SkillExecutionError('Branded document generation failed', 'branded_document_generator', error);
    }
}

/**
 * Get tool definition for Groq function calling
 */
function getToolDefinition(): ToolDefinition {
    return {
        type: 'function',
        function: {
            name: 'branded_document_generator',
            description: 'Generate professional, branded PDF/Docx documents for business plans, financial models, and investor decks.',
            parameters: {
                type: 'object',
                properties: {
                    document_type: {
                        type: 'string',
                        enum: ['business_plan', 'financial_model', 'investor_deck', 'executive_summary'],
                        description: 'Type of document to generate'
                    },
                    content: {
                        type: 'object',
                        description: 'Structured content to include in the document'
                    },
                    business_name: {
                        type: 'string',
                        description: 'Name of the business for branding'
                    },
                    brand_identity: {
                        type: 'object',
                        properties: {
                            logo_url: { type: 'string' },
                            colors: { type: 'array', items: { type: 'string' } },
                            font_family: { type: 'string' }
                        }
                    },
                    format: {
                        type: 'string',
                        enum: ['pdf', 'docx', 'markdown'],
                        default: 'pdf'
                    }
                },
                required: ['document_type', 'content', 'business_name', 'format']
            }
        }
    };
}

export const brandedDocumentGeneratorSkill: Skill = {
    id: 'branded_document_generator',
    name: 'Branded Document Generator',
    description: 'Create professional business documents with custom branding',
    execute,
    getToolDefinition
};
