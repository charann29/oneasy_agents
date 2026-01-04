/**
 * Chat Interaction Utility
 * Minimal utility - ALL conversational responses come from orchestrator
 */

import { Question, QuestionType } from '../schemas/questions';

const AGENT_SKILLS_MAPPING: Record<string, string[]> = {
    'auth': ['Identity Verify', 'Session Init'],
    'discovery': ['Profile Analyzer', 'Expertise Mapping'],
    'context': ['Concept Validator', 'Vision Alignment'],
    'market': ['Market Sizing', 'Demographic Heatmap'],
    'competitors': ['Competitor Scraping', 'SWOT Analysis'],
    'revenue': ['Revenue Modeling', 'Stream Diversification'],
    'pricing': ['Elasticity Analysis', 'Benchmarking'],
    'financials': ['Cash Flow Projection', 'Burn Rate Calculation'],
    'unit_economics': ['CAC/LTV Analysis', 'Margin Optimization'],
    'operations': ['Resource Planning', 'Workflow Automation'],
    'funding': ['Cap Table Modeling', 'Investor Matching'],
};

export class ChatInteraction {
    /**
     * Returns the RAW question - orchestrator will make it conversational
     */
    static getConversationalQuestion(
        question: Question,
        isFirstInPhase: boolean,
        phaseName: string,
        userName?: string
    ): string {
        // Return RAW question - orchestrator handles all conversation
        return question.question;
    }

    /**
     * Gets relevant agent skills based on the phase
     */
    static getAgentSkillsForPhase(phaseName: string): string[] {
        let phaseKey = 'auth';
        try {
            if (phaseName && phaseName.includes(':')) {
                phaseKey = phaseName.toLowerCase().split(':')[1].trim().split(' ')[0];
            } else if (phaseName) {
                phaseKey = phaseName.toLowerCase().split(' ')[0];
            }
        } catch (e) {
            console.error('Error parsing phase name for skills:', e);
        }

        return AGENT_SKILLS_MAPPING[phaseKey] || ['AI Intelligence', 'Context Analyzer'];
    }

    /**
     * Returns a minimal welcome - orchestrator will generate the full personalized greeting
     */
    static getPersonalizedWelcome(): string {
        // Return minimal - orchestrator generates full welcome
        return "initializing...";
    }
}
