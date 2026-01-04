/**
 * Agent Manager
 * Loads and manages agent definitions from YAML files
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Agent, IntentAnalysis } from '../utils/types';
import { logger } from '../utils/logger';

export class AgentManager {
    private agents: Map<string, Agent>;
    private agentsDir: string;

    constructor(agentsDir?: string) {
        this.agents = new Map();
        // Internal agents (YAML)
        this.agentsDir = agentsDir || path.join(process.cwd(), 'backend', 'agents');
        this.loadAgents();

        // External Agents (Markdown) - Core (OPTIONAL, don't crash if missing)
        try {
            const externalCoreDir = path.join(process.cwd(), '..', 'agents');
            this.loadMarkdownAgents(externalCoreDir);
        } catch (error) {
            logger.debug('External core agents not loaded', { error });
        }

        // External Agents (Markdown) - Standalone (OPTIONAL, don't crash if missing)
        try {
            const externalStandaloneDir = path.join(process.cwd(), '..', 'standalone_agents');
            this.loadMarkdownAgents(externalStandaloneDir);
        } catch (error) {
            logger.debug('External standalone agents not loaded', { error });
        }
    }

    /**
     * Load all agent YAML files from the agents directory
     */
    private loadAgents(): void {
        try {
            logger.info('Loading agent definitions...', { dir: this.agentsDir });

            if (!fs.existsSync(this.agentsDir)) {
                logger.warn('Agents directory does not exist', { dir: this.agentsDir });
                return;
            }

            const files = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

            logger.info(`Found ${files.length} agent files`);

            files.forEach(file => {
                try {
                    const filePath = path.join(this.agentsDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const agent = yaml.load(content) as Agent;

                    // Validate agent structure
                    if (!agent.id || !agent.name || !agent.system_prompt) {
                        logger.warn(`Invalid agent definition in ${file}`, { agent });
                        return;
                    }

                    this.agents.set(agent.id, agent);
                    logger.debug(`Loaded agent: ${agent.id}`, { name: agent.name });
                } catch (error) {
                    logger.error(`Failed to load agent from ${file}`, error);
                }
            });

            logger.info(`Successfully loaded ${this.agents.size} agents`);
        } catch (error) {
            logger.error('Failed to load agents', error);
            throw error;
        }
    }

    /**
     * Load Markdown agent definitions from a directory
     * Parses the Markdown file to extract agent metadata and uses content as system prompt
     */
    private loadMarkdownAgents(directory: string): void {
        try {
            logger.info('Loading external assignments...', { dir: directory });

            if (!fs.existsSync(directory)) {
                logger.warn('External agents directory not found', { dir: directory });
                return;
            }

            const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));
            logger.info(`Found ${files.length} external agent files in ${path.basename(directory)}`);

            files.forEach(file => {
                try {
                    const filePath = path.join(directory, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const id = path.basename(file, '.md');

                    // Simple parsing strategy:
                    // ID = filename
                    // Name = First H1 header or filename
                    // System Prompt = Full content
                    // Model = Default (can be overriden if frontmatter exists)

                    const nameMatch = content.match(/^#\s+(.+)$/m);
                    const name = nameMatch ? nameMatch[1].trim() : id.replace(/_/g, ' ');

                    // Extract Utils/Skills if mentioned? For now, simplistic mapping.
                    // Assuming external agents need broad capabilities.

                    const agent: Agent = {
                        id: id,
                        name: name,
                        description: `External agent loaded from ${file}`,
                        model: 'llama-3.3-70b-versatile', // Default to high-perf model
                        system_prompt: content,
                        skills: ['financial_modeling', 'market_sizing_calculator', 'competitor_analysis', 'compliance_checker', 'branded_document_generator'], // Give all skills by default to external agents
                        tools: [],
                        temperature: 0.3,
                        context_window: 8000,
                        phase: 'custom'
                    };

                    this.agents.set(agent.id, agent);
                    logger.info(`Loaded/Overridden external agent: ${agent.id}`);
                } catch (error) {
                    logger.error(`Failed to load external agent ${file}`, error);
                }
            });

        } catch (error) {
            logger.error(`Failed to load markdown agents from ${directory}`, error);
        }
    }

    /**
     * Get agent by ID
     */
    getAgent(id: string): Agent | undefined {
        return this.agents.get(id);
    }

    /**
     * Get all agents
     */
    getAllAgents(): Agent[] {
        return Array.from(this.agents.values());
    }

    /**
     * Get agents by IDs
     */
    getAgents(ids: string[]): Agent[] {
        return ids
            .map(id => this.agents.get(id))
            .filter((agent): agent is Agent => agent !== undefined);
    }

    /**
     * Select agents based on intent analysis
     * This is a smart selection that can handle missing agents gracefully
     */
    selectAgents(intent: IntentAnalysis): Agent[] {
        const selectedAgents: Agent[] = [];
        const missingAgents: string[] = [];

        intent.agents.forEach(agentId => {
            const agent = this.agents.get(agentId);
            if (agent) {
                selectedAgents.push(agent);
            } else {
                missingAgents.push(agentId);
            }
        });

        if (missingAgents.length > 0) {
            logger.warn('Some requested agents not found', { missing: missingAgents });
        }

        logger.info('Selected agents', {
            count: selectedAgents.length,
            agents: selectedAgents.map(a => a.id)
        });

        return selectedAgents;
    }

    /**
     * Search agents by capability (skills, tools, or keywords)
     */
    searchAgents(query: string): Agent[] {
        const lowerQuery = query.toLowerCase();

        return this.getAllAgents().filter(agent => {
            // Search in name, description, skills, and tools
            const searchText = [
                agent.name,
                agent.description,
                ...agent.skills,
                ...agent.tools
            ].join(' ').toLowerCase();

            return searchText.includes(lowerQuery);
        });
    }

    /**
     * Get agents by skill
     */
    getAgentsBySkill(skillId: string): Agent[] {
        return this.getAllAgents().filter(agent =>
            agent.skills.includes(skillId)
        );
    }

    /**
     * Get agents by phase (if phase is defined)
     */
    getAgentsByPhase(phase: string): Agent[] {
        return this.getAllAgents().filter(agent =>
            agent.phase?.toLowerCase().includes(phase.toLowerCase())
        );
    }

    /**
     * Validate that all required agents exist
     */
    validateAgents(agentIds: string[]): { valid: boolean; missing: string[] } {
        const missing = agentIds.filter(id => !this.agents.has(id));
        return {
            valid: missing.length === 0,
            missing
        };
    }

    /**
     * Reload agents from disk (useful for hot-reloading in development)
     */
    reload(): void {
        this.agents.clear();
        this.loadAgents();
    }

    /**
     * Get agent count
     */
    getAgentCount(): number {
        return this.agents.size;
    }

    /**
     * Check if agent exists
     */
    hasAgent(id: string): boolean {
        return this.agents.has(id);
    }
}

// Export singleton instance
let agentManagerInstance: AgentManager | null = null;

export function getAgentManager(): AgentManager {
    if (!agentManagerInstance) {
        agentManagerInstance = new AgentManager();
    }
    return agentManagerInstance;
}
