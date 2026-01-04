/**
 * Compliance Checker Skill Implementation
 * Checks legal and regulatory requirements
 */

import {
    Skill,
    ToolDefinition,
    ComplianceCheckInput,
    ComplianceCheckOutput,
    SkillExecutionError
} from '../../utils/types';
import { logger } from '../../utils/logger';

/**
 * Compliance requirements database (simplified)
 */
const COMPLIANCE_DATA: Record<string, any> = {
    'india': {
        'saas': {
            licenses: ['GST Registration', 'Shop and Establishment License', 'Professional Tax Registration'],
            permits: ['Digital Signature Certificate', 'Import Export Code (if applicable)'],
            risks: ['Data localization requirements', 'GST compliance', 'Payment gateway regulations']
        },
        'ecommerce': {
            licenses: ['GST Registration', 'FSSAI License (for food)', 'Shop and Establishment License'],
            permits: ['Import Export Code', 'BIS Certification (for electronics)'],
            risks: ['Consumer protection laws', 'Return/refund policies', 'Product liability']
        },
        'fintech': {
            licenses: ['RBI License/NBFC Registration', 'GST Registration', 'PCI DSS Compliance'],
            permits: ['Digital Lending License', 'Payment Aggregator License'],
            risks: ['RBI regulations', 'KYC/AML compliance', 'Data security requirements']
        },
        'default': {
            licenses: ['GST Registration', 'Shop and Establishment License', 'Professional Tax Registration'],
            permits: ['Trade License', 'Fire Safety Certificate'],
            risks: ['Tax compliance', 'Labor laws', 'Environmental regulations']
        }
    },
    'usa': {
        'saas': {
            licenses: ['Business License', 'EIN (Employer Identification Number)', 'State Registration'],
            permits: ['Sales Tax Permit (if applicable)'],
            risks: ['GDPR/CCPA compliance', 'SOC 2 certification', 'Data privacy laws']
        },
        'default': {
            licenses: ['Business License', 'EIN', 'State Business Registration'],
            permits: ['Zoning Permit', 'Health Permit (if applicable)'],
            risks: ['Tax compliance', 'Employment laws', 'Industry-specific regulations']
        }
    },
    'default': {
        'default': {
            licenses: ['Business Registration', 'Tax Registration', 'Operating License'],
            permits: ['Local Business Permit'],
            risks: ['Tax compliance', 'Employment regulations', 'Industry standards']
        }
    }
};

/**
 * Get compliance requirements
 */
function getComplianceRequirements(
    location: string,
    industry: string,
    businessType: string
): any {
    const locationKey = location.toLowerCase();
    const industryKey = industry.toLowerCase().replace(/\s+/g, '_');

    const locationData = COMPLIANCE_DATA[locationKey] || COMPLIANCE_DATA['default'];
    const requirements = locationData[industryKey] || locationData['default'];

    return requirements;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
    requirements: any,
    businessType: string
): string[] {
    const recommendations = [
        'Consult with a local attorney to ensure full compliance',
        'Register your business entity before starting operations',
        'Obtain all required licenses before launching',
        'Set up proper accounting and tax systems from day one',
        'Consider business insurance to mitigate risks'
    ];

    if (requirements.licenses.length > 3) {
        recommendations.push('Work with a compliance consultant to navigate complex licensing requirements');
    }

    if (businessType.toLowerCase().includes('online') || businessType.toLowerCase().includes('digital')) {
        recommendations.push('Implement data privacy and security measures (SSL, encryption, etc.)');
        recommendations.push('Create clear Terms of Service and Privacy Policy');
    }

    return recommendations;
}

/**
 * Execute compliance check
 */
async function execute(params: ComplianceCheckInput): Promise<ComplianceCheckOutput> {
    try {
        logger.info('Executing compliance check', {
            location: params.location,
            industry: params.industry,
            business_type: params.business_type
        });

        const requirements = getComplianceRequirements(
            params.location,
            params.industry,
            params.business_type
        );

        const recommendations = generateRecommendations(requirements, params.business_type);

        const output: ComplianceCheckOutput = {
            required_licenses: requirements.licenses,
            required_permits: requirements.permits,
            compliance_risks: requirements.risks,
            recommendations
        };

        logger.info('Compliance check complete', {
            licenses: output.required_licenses.length,
            permits: output.required_permits.length,
            risks: output.compliance_risks.length
        });

        return output;
    } catch (error) {
        logger.error('Compliance check failed', error);
        throw new SkillExecutionError('Compliance check execution failed', 'compliance_checker', error);
    }
}

/**
 * Get tool definition for Groq function calling
 */
function getToolDefinition(): ToolDefinition {
    return {
        type: 'function',
        function: {
            name: 'compliance_checker',
            description: 'Check legal and regulatory requirements including licenses, permits, and compliance risks for a business.',
            parameters: {
                type: 'object',
                properties: {
                    industry: {
                        type: 'string',
                        description: 'Industry or business category'
                    },
                    location: {
                        type: 'string',
                        description: 'Country or region where business will operate'
                    },
                    business_type: {
                        type: 'string',
                        description: 'Type of business entity (e.g., LLC, Corporation, Sole Proprietorship)'
                    }
                },
                required: ['industry', 'location', 'business_type']
            }
        }
    };
}

export const complianceCheckerSkill: Skill = {
    id: 'compliance_checker',
    name: 'Compliance Checker',
    description: 'Check legal requirements, licenses, and regulatory compliance',
    execute,
    getToolDefinition
};
