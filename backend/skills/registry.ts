/**
 * Skill Registry
 * Manages and executes business logic skills
 */

import { Skill, ToolDefinition, SkillExecutionError } from '../utils/types';
import { logger } from '../utils/logger';

// Import skill implementations
import { financialModelingSkill } from './implementations/financial_modeling';
import { marketSizingSkill } from './implementations/market_sizing';
import { competitorAnalysisSkill } from './implementations/competitor_analysis';
import { complianceCheckerSkill } from './implementations/compliance_checker';
import { brandedDocumentGeneratorSkill } from './implementations/branded_document_generator';

import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

class GenericLLMSkill implements Skill {
    id: string;
    name: string;
    description: string;
    private systemPrompt: string;
    private groq: Groq;

    constructor(id: string, name: string, description: string, systemPrompt: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.systemPrompt = systemPrompt;
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
    }

    getToolDefinition(): ToolDefinition {
        return {
            type: 'function',
            function: {
                name: this.id,
                description: this.description,
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'The specific request or query for this skill' },
                        context: { type: 'object', description: 'Any relevant business context' }
                    },
                    required: ['query']
                }
            }
        };
    }

    async execute(params: any): Promise<any> {
        try {
            const userPrompt = `Parameters: ${JSON.stringify(params, null, 2)}\n\nExecute the task based on your instructions.`;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1
            });

            return completion.choices[0]?.message?.content || 'No response generated.';
        } catch (error) {
            throw new SkillExecutionError(`Failed to execute LLM skill ${this.id}`, this.id, error);
        }
    }
}

export class SkillRegistry {
    private skills: Map<string, Skill>;

    constructor() {
        this.skills = new Map();
        this.registerSkills();
    }

    /**
     * Register all available skills
     */
    private registerSkills(): void {
        logger.info('Registering skills...');

        const skillsToRegister = [
            financialModelingSkill,
            marketSizingSkill,
            competitorAnalysisSkill,
            complianceCheckerSkill,
            brandedDocumentGeneratorSkill
        ];


        skillsToRegister.forEach(skill => {
            this.skills.set(skill.id, skill);
            logger.debug(`Registered skill: ${skill.id}`, { name: skill.name });
        });

        // Load External Skills (Markdown)
        this.loadExternalSkills();

        logger.info(`Successfully registered ${this.skills.size} skills`);
    }

    private loadExternalSkills(): void {
        try {
            const externalSkillsDir = path.join(process.cwd(), '..', 'skills');

            if (!fs.existsSync(externalSkillsDir)) {
                logger.warn('External skills directory not found', { dir: externalSkillsDir });
                return;
            }

            const files = fs.readdirSync(externalSkillsDir).filter(f => f.endsWith('.md'));
            logger.info(`Found ${files.length} external skill files`);

            files.forEach(file => {
                try {
                    const filePath = path.join(externalSkillsDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const id = path.basename(file, '.md');

                    const nameMatch = content.match(/^#\s+(.+)$/m);
                    const name = nameMatch ? nameMatch[1].trim() : id.replace(/_/g, ' ');

                    const skill = new GenericLLMSkill(
                        id,
                        name,
                        `External skill loaded from ${file}`,
                        content
                    );

                    this.skills.set(skill.id, skill);
                    logger.info(`Loaded/Overridden external skill: ${skill.id}`);
                } catch (e) {
                    logger.error(`Failed to load external skill ${file}`, e);
                }
            });

        } catch (error) {
            logger.error('Failed to load external skills', error);
        }
    }

    /**
     * Get skill by ID
     */
    getSkill(id: string): Skill | undefined {
        return this.skills.get(id);
    }

    /**
     * Get all skills
     */
    getAllSkills(): Skill[] {
        return Array.from(this.skills.values());
    }

    /**
     * Get tool definition for a skill (for Groq function calling)
     */
    getToolDefinition(skillId: string): ToolDefinition | undefined {
        const skill = this.skills.get(skillId);
        if (!skill) {
            logger.warn(`Skill not found: ${skillId}`);
            return undefined;
        }
        return skill.getToolDefinition();
    }

    /**
     * Get all tool definitions (for Groq function calling)
     */
    getAllToolDefinitions(): ToolDefinition[] {
        return this.getAllSkills().map(skill => skill.getToolDefinition());
    }

    /**
     * Get tool definitions for specific skills
     */
    getToolDefinitions(skillIds: string[]): ToolDefinition[] {
        return skillIds
            .map(id => this.getToolDefinition(id))
            .filter((def): def is ToolDefinition => def !== undefined);
    }

    /**
     * Execute a skill with given parameters
     */
    async execute(skillId: string, params: any): Promise<any> {
        const startTime = Date.now();

        try {
            const skill = this.skills.get(skillId);

            if (!skill) {
                throw new SkillExecutionError(
                    `Skill not found: ${skillId}`,
                    skillId
                );
            }

            logger.skill(skillId, 'Executing', { params });

            const result = await skill.execute(params);

            const duration = Date.now() - startTime;
            logger.timing(`Skill execution: ${skillId}`, duration);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`Skill execution failed: ${skillId}`, error);
            logger.timing(`Skill execution (failed): ${skillId}`, duration);

            if (error instanceof SkillExecutionError) {
                throw error;
            }

            throw new SkillExecutionError(
                `Failed to execute skill: ${skillId}`,
                skillId,
                error
            );
        }
    }

    /**
     * Check if skill exists
     */
    hasSkill(id: string): boolean {
        return this.skills.has(id);
    }

    /**
     * Get skill count
     */
    getSkillCount(): number {
        return this.skills.size;
    }

    /**
     * Validate that all required skills exist
     */
    validateSkills(skillIds: string[]): { valid: boolean; missing: string[] } {
        const missing = skillIds.filter(id => !this.skills.has(id));
        return {
            valid: missing.length === 0,
            missing
        };
    }
}

// Export singleton instance
let skillRegistryInstance: SkillRegistry | null = null;

export function getSkillRegistry(): SkillRegistry {
    if (!skillRegistryInstance) {
        skillRegistryInstance = new SkillRegistry();
    }
    return skillRegistryInstance;
}
