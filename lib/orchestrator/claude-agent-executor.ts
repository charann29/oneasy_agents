/**
 * Claude Agent Executor
 * Executes agents using Claude API with full support for skills/tools
 * Built for document generation workflows
 */

import { ClaudeService, ClaudeMessage } from '@/lib/services/claude-service';
import { getAgentManager } from '@/backend/agents/manager';
import { getSkillRegistry } from '@/backend/skills/registry';
import { logger } from '@/backend/utils/logger';
import { Agent } from '@/backend/utils/types';

export interface AgentExecutionContext {
    sessionId?: string;
    allAnswers?: Record<string, any>;
    previousOutputs?: Record<string, any>;
    [key: string]: any;
}

export interface AgentExecutionResult {
    agentId: string;
    agentName: string;
    output: string;
    toolCallsMade: Array<{ skill: string; params: any; result: any }>;
    tokensUsed: { input: number; output: number };
    executionTimeMs: number;
}

export class ClaudeAgentExecutor {
    private claude: ClaudeService;
    private agentManager;
    private skillRegistry;

    constructor() {
        this.claude = new ClaudeService();
        this.agentManager = getAgentManager();
        this.skillRegistry = getSkillRegistry();

        logger.info('Claude Agent Executor initialized', {
            model: this.claude.getModel(),
            agentCount: this.agentManager.getAgentCount(),
            skillCount: this.skillRegistry.getSkillCount()
        });
    }

    /**
     * Execute a single agent with full context
     */
    async executeAgent(
        agentId: string,
        context: AgentExecutionContext
    ): Promise<AgentExecutionResult> {
        const startTime = Date.now();

        try {
            logger.info(`Executing agent: ${agentId}`, { context: !!context });

            // Load agent definition
            const agent = this.agentManager.getAgent(agentId);
            if (!agent) {
                throw new Error(`Agent not found: ${agentId}`);
            }

            // Get tools for agent's skills
            const groqTools = this.skillRegistry.getToolDefinitions(agent.skills);
            const claudeTools = this.claude.convertGroqToolsToClaude(groqTools);

            logger.info(`Agent loaded: ${agent.name}`, {
                skills: agent.skills.length,
                tools: claudeTools.length
            });

            // Build initial message
            const userMessage = this.buildUserMessage(agent, context);

            const messages: ClaudeMessage[] = [
                {
                    role: 'user',
                    content: userMessage
                }
            ];

            // Call Claude (may involve multiple rounds for tool calls)
            const result = await this.executeWithToolCalls(
                agent,
                messages,
                claudeTools,
                context
            );

            const executionTime = Date.now() - startTime;

            logger.info(`Agent execution complete: ${agentId}`, {
                executionTimeMs: executionTime,
                toolCalls: result.toolCallsMade.length
            });

            return {
                agentId: agent.id,
                agentName: agent.name,
                output: result.output,
                toolCallsMade: result.toolCallsMade,
                tokensUsed: result.tokensUsed,
                executionTimeMs: executionTime
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error(`Agent execution failed: ${agentId}`, error);

            throw new Error(
                `Agent execution failed (${agentId}): ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Execute agent with tool calls (iterative)
     */
    private async executeWithToolCalls(
        agent: Agent,
        messages: ClaudeMessage[],
        tools: any[],
        context: AgentExecutionContext
    ): Promise<{
        output: string;
        toolCallsMade: Array<{ skill: string; params: any; result: any }>;
        tokensUsed: { input: number; output: number };
    }> {
        const toolCallsMade: Array<{ skill: string; params: any; result: any }> = [];
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let iterations = 0;
        const maxIterations = 5; // Prevent infinite loops

        while (iterations < maxIterations) {
            iterations++;

            // Call Claude
            const response = await this.claude.sendMessage(
                agent.system_prompt,
                messages,
                tools.length > 0 ? tools : undefined,
                agent.temperature,
                4096
            );

            totalInputTokens += response.usage.input_tokens;
            totalOutputTokens += response.usage.output_tokens;

            // Check if Claude wants to use tools
            if (this.claude.hasToolCalls(response)) {
                logger.info('Processing tool calls from Claude', {
                    iteration: iterations
                });

                const toolCalls = this.claude.extractToolCalls(response);

                // Add assistant message with tool uses
                messages.push({
                    role: 'assistant',
                    content: response.content.map(block => ({
                        type: block.type as any,
                        text: block.text,
                        id: block.id,
                        name: block.name,
                        input: block.input
                    }))
                });

                // Execute each tool call
                const toolResults: any[] = [];

                for (const toolCall of toolCalls) {
                    try {
                        logger.info(`Executing skill: ${toolCall.name}`, {
                            params: toolCall.input
                        });

                        const result = await this.skillRegistry.execute(
                            toolCall.name,
                            toolCall.input
                        );

                        toolCallsMade.push({
                            skill: toolCall.name,
                            params: toolCall.input,
                            result: result
                        });

                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: toolCall.id,
                            content: JSON.stringify(result)
                        });

                        logger.info(`Skill executed: ${toolCall.name}`);
                    } catch (error) {
                        logger.error(`Skill execution failed: ${toolCall.name}`, error);

                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: toolCall.id,
                            content: `Error: ${error instanceof Error ? error.message : String(error)}`
                        });
                    }
                }

                // Add tool results as user message
                messages.push({
                    role: 'user',
                    content: toolResults
                });

                // Continue loop to get final response
                continue;
            }

            // No more tool calls - extract final text
            const output = this.claude.extractText(response);

            return {
                output,
                toolCallsMade,
                tokensUsed: {
                    input: totalInputTokens,
                    output: totalOutputTokens
                }
            };
        }

        throw new Error(`Max iterations (${maxIterations}) reached for agent execution`);
    }

    /**
     * Build user message with context
     */
    private buildUserMessage(agent: Agent, context: AgentExecutionContext): string {
        const sections: string[] = [];

        sections.push(`# Task for ${agent.name}`);
        sections.push(`You are ${agent.name}. Use your expertise to complete this task.`);

        // Add questionnaire answers if available
        if (context.allAnswers && Object.keys(context.allAnswers).length > 0) {
            sections.push('\n## Questionnaire Data');
            sections.push('```json');
            sections.push(JSON.stringify(context.allAnswers, null, 2));
            sections.push('```');
        }

        // Add previous agent outputs if available
        if (context.previousOutputs && Object.keys(context.previousOutputs).length > 0) {
            sections.push('\n## Previous Agent Outputs');
            for (const [agentId, output] of Object.entries(context.previousOutputs)) {
                sections.push(`\n### ${agentId}:`);
                sections.push(String(output).substring(0, 1000)); // Limit size
            }
        }

        // Add specific instructions based on agent type
        sections.push('\n## Instructions');
        if (agent.id === 'financial_modeler') {
            sections.push('Generate a complete 5-7 year financial model using the financial_modeling skill.');
            sections.push('Include: Revenue projections, COGS, OPEX, EBITDA, cash flow, break-even analysis.');
        } else if (agent.id === 'market_analyst') {
            sections.push('Analyze the market size (TAM/SAM/SOM) using the market_sizing_calculator skill.');
            sections.push('Provide market trends, growth potential, and competitive dynamics.');
        } else if (agent.id === 'gtm_strategist') {
            sections.push('Create a comprehensive go-to-market strategy.');
            sections.push('Include: Customer acquisition channels, marketing strategy, sales approach.');
        } else {
            sections.push('Use your expertise and available skills to complete your assigned task.');
        }

        return sections.join('\n');
    }

    /**
     * Execute multiple agents in sequence (for document generation workflows)
     */
    async executeAgentSequence(
        agentIds: string[],
        context: AgentExecutionContext
    ): Promise<Record<string, AgentExecutionResult>> {
        logger.info('Executing agent sequence', { agents: agentIds });

        const results: Record<string, AgentExecutionResult> = {};
        const previousOutputs: Record<string, any> = {};

        for (const agentId of agentIds) {
            const result = await this.executeAgent(agentId, {
                ...context,
                previousOutputs
            });

            results[agentId] = result;
            previousOutputs[agentId] = result.output;

            logger.info(`Agent completed: ${agentId}`, {
                outputLength: result.output.length,
                toolCalls: result.toolCallsMade.length
            });
        }

        logger.info('Agent sequence complete', {
            agentsExecuted: Object.keys(results).length
        });

        return results;
    }
}

// Export singleton
let executorInstance: ClaudeAgentExecutor | null = null;

export function getClaudeAgentExecutor(): ClaudeAgentExecutor {
    if (!executorInstance) {
        executorInstance = new ClaudeAgentExecutor();
    }
    return executorInstance;
}
