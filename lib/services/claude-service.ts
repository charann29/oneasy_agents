/**
 * Claude API Service
 * Wrapper for Anthropic Claude API compatible with orchestrator
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/backend/utils/logger';

export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'tool_use' | 'tool_result';
        text?: string;
        id?: string;
        name?: string;
        input?: any;
        tool_use_id?: string;
        content?: string;
    }>;
}

export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface ClaudeResponse {
    id: string;
    content: Array<{
        type: 'text' | 'tool_use';
        text?: string;
        id?: string;
        name?: string;
        input?: any;
    }>;
    stop_reason: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

export class ClaudeService {
    private client: Anthropic;
    private model: string;

    constructor(apiKey?: string, model?: string) {
        const key = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!key) {
            logger.error('ANTHROPIC_API_KEY missing in process.env');
            throw new Error('ANTHROPIC_API_KEY is required');
        }

        logger.info('Claude service initializing', { keyPrefix: key.substring(0, 5) + '...' });

        this.client = new Anthropic({ apiKey: key });
        this.model = model || 'claude-3-haiku-20240307';

        logger.info('Claude service initialized', { model: this.model });
    }

    /**
     * Send a message to Claude with optional tools (function calling)
     */
    async sendMessage(
        systemPrompt: string,
        messages: ClaudeMessage[],
        tools?: ClaudeTool[],
        temperature?: number,
        maxTokens?: number
    ): Promise<ClaudeResponse> {
        try {
            logger.info('Sending request to Claude', {
                model: this.model,
                messageCount: messages.length,
                toolCount: tools?.length || 0
            });

            const response = await this.client.messages.create({
                model: this.model,
                system: systemPrompt,
                messages: messages as any,
                max_tokens: maxTokens || 4096,
                temperature: temperature || 0.3,
                tools: tools as any
            });

            logger.info('Claude response received', {
                stopReason: response.stop_reason,
                contentBlocks: response.content.length,
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens
            });

            return response as ClaudeResponse;
        } catch (error) {
            logger.error('Claude API error', error);
            throw error;
        }
    }

    /**
     * Convert Groq tool format to Claude tool format
     */
    convertGroqToolsToClaude(groqTools: any[]): ClaudeTool[] {
        return groqTools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters
        }));
    }

    /**
     * Extract text from Claude response
     */
    extractText(response: ClaudeResponse): string {
        const textBlocks = response.content.filter(block => block.type === 'text');
        return textBlocks.map(block => block.text).join('\n');
    }

    /**
     * Extract tool calls from Claude response
     */
    extractToolCalls(response: ClaudeResponse): Array<{ id: string; name: string; input: any }> {
        const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
        return toolUseBlocks.map(block => ({
            id: block.id!,
            name: block.name!,
            input: block.input
        }));
    }

    /**
     * Check if response has tool calls
     */
    hasToolCalls(response: ClaudeResponse): boolean {
        return response.content.some(block => block.type === 'tool_use');
    }

    /**
     * Get current model
     */
    getModel(): string {
        return this.model;
    }
}

// Export singleton instance
let claudeServiceInstance: ClaudeService | null = null;

export function getClaudeService(): ClaudeService {
    if (!claudeServiceInstance) {
        claudeServiceInstance = new ClaudeService();
    }
    return claudeServiceInstance;
}
