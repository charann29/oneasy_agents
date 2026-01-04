/**
 * Core Orchestrator
 * Intelligently routes user requests to specialized agents and synthesizes responses
 */

import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
    IntentAnalysis,
    ExecutionPlan,
    Task,
    AgentOutput,
    OrchestratorResponse,
    GroqMessage,
    ToolCall,
    ToolCallResult,
    BusinessContext,
    OrchestratorError,
    AgentExecutionError
} from '../utils/types';
import { logger } from '../utils/logger';
import { getAgentManager } from '../agents/manager';
import { getSkillRegistry } from '../skills/registry';
import { getTranslator } from '../services/translation';

export interface OrchestratorConfig {
    groqApiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    useLocal?: boolean;
    localBaseUrl?: string;
    localModel?: string;
}

export class Orchestrator {
    private groq: Groq;
    private openai?: OpenAI;
    private agentManager;
    private skillRegistry;
    private config: Required<OrchestratorConfig>;

    constructor(config: OrchestratorConfig) {
        this.groq = new Groq({ apiKey: config.groqApiKey });
        this.agentManager = getAgentManager();
        this.skillRegistry = getSkillRegistry();

        this.config = {
            groqApiKey: config.groqApiKey,
            model: config.model || 'llama-3.3-70b-versatile',
            temperature: config.temperature || 0.3,
            maxTokens: config.maxTokens || 8000,
            useLocal: config.useLocal || false,
            localBaseUrl: config.localBaseUrl || 'http://localhost:11434/v1',
            localModel: config.localModel || 'llama3'
        };

        if (this.config.useLocal) {
            this.openai = new OpenAI({
                baseURL: this.config.localBaseUrl,
                apiKey: 'ollama', // Ollama doesn't require a real key
            });
            logger.info('Orchestrator using LOCAL LLM', {
                url: this.config.localBaseUrl,
                model: this.config.localModel
            });
        } else {
            logger.info('Orchestrator initialized (Groq Cloud)', {
                model: this.config.model,
                agents: this.agentManager.getAgentCount(),
                skills: this.skillRegistry.getSkillCount()
            });
        }
    }

    /**
     * Main entry point - process user request
     */
    async processRequest(
        message: string,
        context?: BusinessContext
    ): Promise<OrchestratorResponse> {
        const startTime = Date.now();

        try {
            logger.orchestrator('Processing request', { message: message.substring(0, 100), context: !!context });

            let intent: IntentAnalysis;
            const currentPhaseStr = String(context?.currentPhase || '');
            const isPhase1 = currentPhaseStr.includes('Phase 1') || currentPhaseStr === '1';

            // SPECIAL PATH: SUGGESTION REQUEST
            if (context?.requestType === 'suggestion') {
                logger.orchestrator('Processing SUGGESTION request');
                intent = {
                    goal: 'Generate 3-4 short, specific brainstorming ideas for the user question',
                    agents: ['business_planner_lead'],
                    skills: [],
                    execution_type: 'sequential',
                    reasoning: 'Explicit suggestion request',
                    context_requirements: []
                };
            }
            // FAST PATH FOR PHASE 1 (Onboarding/Data Collection)
            else if (isPhase1) {
                logger.orchestrator('Using FAST PATH for Phase 1');
                intent = {
                    goal: 'Collect user information',
                    agents: ['context_collector'],
                    skills: [],
                    execution_type: 'parallel',
                    reasoning: 'Phase 1 Fast Path optimization',
                    context_requirements: []
                };
            }
            // FAST PATH FOR STANDARD Q&A (Phase 2+)
            // If we already know the next question, we don't need full intent analysis
            else if (context?.nextQuestion) {
                logger.orchestrator('Using ACCELERATED Q&A PATH');
                intent = {
                    goal: 'Process answer and transition to next question',
                    agents: ['business_planner_lead'], // Use single Lead agent for speed
                    skills: [],
                    execution_type: 'parallel', // Fastest execution
                    reasoning: 'Standard Q&A flow optimization',
                    context_requirements: []
                };
            }
            else {
                // Step 1: Parse intent (Normal Path for complex queries/deviations)
                logger.orchestrator('Step 1: Parsing intent...');
                intent = await this.parseIntent(message, context);
            }

            logger.orchestrator('Intent parsed', {
                agents: intent.agents,
                execution_type: intent.execution_type
            });

            // Step 2: Create execution plan
            logger.orchestrator('Step 2: Creating plan...');
            const plan = this.createPlan(intent);
            logger.orchestrator('Plan created', { tasks: plan.tasks.length });

            // Step 3: Execute plan
            logger.orchestrator('Step 3: Executing plan...');
            const agentOutputs = await this.execute(plan, context);
            logger.orchestrator('Execution complete', { outputs: agentOutputs.length });

            // Step 4: Synthesize results
            logger.orchestrator('Step 4: Synthesizing results...');
            const synthesis = await this.synthesize(
                agentOutputs,
                message,
                context?.nextQuestion, // Pass next question if provided
                context?.language || context?.allAnswers?.['language']
            );
            logger.orchestrator('Synthesis complete');

            const executionTime = Date.now() - startTime;
            logger.timing('Total orchestration', executionTime);

            return {
                synthesis,
                agent_outputs: agentOutputs,
                execution_time_ms: executionTime,
                intent,
                plan
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error('Orchestration failed', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                message: message.substring(0, 100)
            });
            logger.timing('Total orchestration (failed)', executionTime);

            throw new OrchestratorError(
                'Failed to process request',
                'ORCHESTRATION_FAILED',
                error
            );
        }
    }

    /**
     * Parse user intent using Groq
     */
    async parseIntent(
        message: string,
        context?: BusinessContext
    ): Promise<IntentAnalysis> {
        try {
            const systemPrompt = `You are an AI orchestrator that analyzes user requests for business planning.

CRITICAL RULES - AGENT SELECTION:
1. For EVERY user question, you MUST select MINIMUM 2-3 relevant agents
2. NEVER return fewer than 2 agents in the agents array
3. Even for simple questions, use multiple perspectives for depth
4. When in doubt, include business_planner_lead + context_collector + 1 specialist
5. Quality over speed - more agents = better insights

AGENT SELECTION STRATEGY:
- MINIMUM: 2 agents (barely acceptable)
- RECOMMENDED: 3 agents (ideal for comprehensive analysis)
- MAXIMUM: 5 agents (for complex multi-domain questions)

Your job is to determine:
1. What the user wants to accomplish (goal)
2. Which specialized agents are needed (MINIMUM 2, RECOMMENDED 3)
3. Which skills/tools are needed
4. Whether agents should run in parallel or sequential order

Available agents:
- business_planner_lead: Coordinates overall business planning (use when unsure)
- context_collector: Gathers business context and requirements
- customer_profiler: Analyzes target customers and personas
- market_analyst: Analyzes market size, trends, and opportunities
- financial_modeler: Creates financial projections and models
- revenue_architect: Designs revenue streams and pricing
- gtm_strategist: Creates go-to-market strategies
- legal_advisor: Provides legal structure and compliance guidance
- ops_planner: Plans operations and team structure
- funding_strategist: Develops funding strategy
- unit_economics_calculator: Calculates unit economics metrics
- output_generator: Generates final documents and reports

Available skills:
- financial_modeling: Calculate financial projections
- market_sizing_calculator: Calculate TAM/SAM/SOM
- competitor_analysis: Analyze competitors
- compliance_checker: Check legal requirements
- branded_document_generator: Generate documents

AGENT SELECTION RULES (Phase-based Intelligence):
- Phase 1 (Auth/Profile): context_collector + business_planner_lead
- Phase 2 (Discovery): context_collector + customer_profiler + business_planner_lead
- Phase 3 (Business Context): context_collector + market_analyst + customer_profiler
- For market questions: market_analyst + customer_profiler + market_sizing_calculator skill
- For customer questions: customer_profiler + market_analyst + context_collector
- For financial questions: financial_modeler + revenue_architect + financial_modeling skill
- For competitor questions: market_analyst + customer_profiler + competitor_analysis skill
- For legal questions: legal_advisor + business_planner_lead + compliance_checker skill
- For operations: ops_planner + context_collector + business_planner_lead
- For revenue/pricing: revenue_architect + financial_modeler + market_analyst
- For unique advantage/differentiation: market_analyst + customer_profiler + competitor_analysis skill
- For team/hiring: ops_planner + context_collector + business_planner_lead
- When unsure: business_planner_lead + context_collector + market_analyst

Respond with a JSON object:
{
  "goal": "Clear description of what user wants",
  "agents": ["agent_id1", "agent_id2", "agent_id3"],
  "skills": ["skill_id1"],
  "execution_type": "parallel" or "sequential",
  "reasoning": "Why these agents/skills were selected",
  "context_requirements": ["what context is needed"]
}

Use sequential execution when agents depend on each other's outputs.
Use parallel execution when agents can work independently (preferred for speed).

MINIMUM REQUIREMENT: agents array must have at least 2 agents. Aim for 3 for comprehensive insights.`;

            const userPrompt = `User request: "${message}"

${context ? `Current context: ${JSON.stringify(context, null, 2)}` : ''}

Analyze this request and determine which agents and skills are needed.`;

            let content: string | null = null;

            if (this.config.useLocal && this.openai) {
                const response = await this.openai.chat.completions.create({
                    model: this.config.localModel || 'llama3',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2,
                    max_tokens: 1000,
                    response_format: { type: 'json_object' }
                });
                content = response.choices[0]?.message?.content;
            } else {
                const response = await this.groq.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2,
                    max_tokens: 1000,
                    response_format: { type: 'json_object' }
                });
                content = response.choices[0]?.message?.content;
            }
            if (!content) {
                throw new Error('No response from Groq');
            }

            console.log('[DEBUG] Groq Intent Content:', content);
            const intent = JSON.parse(content) as IntentAnalysis;

            // Validate intent
            if (!intent.goal || !intent.agents || !intent.execution_type) {
                throw new Error('Invalid intent structure');
            }

            // CRITICAL: Ensure minimum 2-3 agents for comprehensive analysis
            if (!intent.agents || intent.agents.length === 0) {
                logger.warn('No agents selected, using default agents');
                intent.agents = ['business_planner_lead', 'context_collector'];
                intent.reasoning = 'Default agents selected for comprehensive analysis';
            }

            // Require at least 2 agents for depth
            if (intent.agents.length < 2) {
                logger.info('Expanding agent selection for deeper analysis', {
                    current: intent.agents.length
                });

                // Add context_collector or customer_profiler as second agent based on context
                const secondAgent = context?.currentPhase && context.currentPhase < 3
                    ? 'context_collector'
                    : 'customer_profiler';

                if (!intent.agents.includes(secondAgent)) {
                    intent.agents.push(secondAgent);
                    logger.info('Added second agent for depth', { agent: secondAgent });
                }
            }

            // For even deeper analysis, encourage 3 agents
            if (intent.agents.length < 3) {
                // Add phase-appropriate specialist
                const phaseSpecialists: { [key: number]: string } = {
                    1: 'context_collector',
                    2: 'customer_profiler',
                    3: 'market_analyst',
                    4: 'financial_modeler',
                    5: 'revenue_architect',
                    6: 'gtm_strategist',
                    7: 'funding_strategist'
                };

                const currentPhaseRaw = context?.currentPhase as unknown as (string | number | undefined);
                // Handle both number and string ("Phase 1: ...") inputs
                let currentPhaseNum = 2;
                if (typeof currentPhaseRaw === 'number') {
                    currentPhaseNum = currentPhaseRaw;
                } else if (typeof currentPhaseRaw === 'string') {
                    const match = currentPhaseRaw.match(/Phase (\d+)/);
                    if (match) currentPhaseNum = parseInt(match[1]);
                }

                const specialist = phaseSpecialists[currentPhaseNum] || 'market_analyst';

                if (!intent.agents.includes(specialist)) {
                    intent.agents.push(specialist);
                    logger.info('Added third agent for comprehensive analysis', {
                        agent: specialist,
                        phase: currentPhaseNum
                    });
                }
            }

            logger.info('Final agent selection', {
                count: intent.agents.length,
                agents: intent.agents
            });

            return intent;
        } catch (error) {
            console.error('[CRITICAL] Intent parsing failed:', error);
            logger.error('Intent parsing failed', error);
            throw new OrchestratorError('Failed to parse intent', 'INTENT_PARSE_FAILED', error);
        }
    }

    /**
     * Create execution plan from intent
     */
    createPlan(intent: IntentAnalysis): ExecutionPlan {
        const tasks: Task[] = intent.agents.map((agentId, index) => ({
            id: uuidv4(),
            agent_id: agentId,
            agent_name: this.agentManager.getAgent(agentId)?.name || agentId,
            description: `Execute ${agentId} agent`,
            skills: intent.skills,
            context: {},
            dependencies: intent.execution_type === 'sequential' && index > 0
                ? [intent.agents[index - 1]]
                : [],
            priority: index
        }));

        return {
            tasks,
            execution_type: intent.execution_type,
            estimated_duration_seconds: tasks.length * 10 // Rough estimate
        };
    }

    /**
     * Execute the plan
     */
    async execute(
        plan: ExecutionPlan,
        context?: BusinessContext
    ): Promise<AgentOutput[]> {
        if (plan.execution_type === 'parallel') {
            return await this.executeParallel(plan.tasks, context);
        } else {
            return await this.executeSequential(plan.tasks, context);
        }
    }

    /**
     * Execute tasks in parallel
     */
    private async executeParallel(
        tasks: Task[],
        context?: BusinessContext
    ): Promise<AgentOutput[]> {
        logger.info('Executing tasks in parallel', { count: tasks.length });

        const promises = tasks.map(task => this.executeTask(task, context));
        return await Promise.all(promises);
    }

    /**
     * Execute tasks sequentially
     */
    private async executeSequential(
        tasks: Task[],
        context?: BusinessContext
    ): Promise<AgentOutput[]> {
        logger.info('Executing tasks sequentially', { count: tasks.length });

        const outputs: AgentOutput[] = [];
        let accumulatedContext = { ...context };

        for (const task of tasks) {
            const output = await this.executeTask(task, accumulatedContext);
            outputs.push(output);

            // Add output to context for next task
            accumulatedContext = {
                ...accumulatedContext,
                [`${task.agent_id}_output`]: output.output
            };
        }

        return outputs;
    }

    /**
     * Execute a single task (agent)
     */
    async executeTask(
        task: Task,
        context?: BusinessContext
    ): Promise<AgentOutput> {
        const startTime = Date.now();

        try {
            logger.agent(task.agent_id, 'Starting execution');

            const agent = this.agentManager.getAgent(task.agent_id);
            if (!agent) {
                throw new AgentExecutionError(
                    `Agent not found: ${task.agent_id}`,
                    task.agent_id
                );
            }

            // Get tool definitions for agent's skills
            const tools = this.skillRegistry.getToolDefinitions(agent.skills);

            // Extract language from context for enforcement
            const userLanguage = (context as any)?.language || (context as any)?.allAnswers?.language;
            const languageMap: Record<string, string> = {
                'hi-IN': 'Hindi',
                'te-IN': 'Telugu',
                'ta-IN': 'Tamil',
                'kn-IN': 'Kannada',
                'ml-IN': 'Malayalam',
                'mr-IN': 'Marathi',
                'bn-IN': 'Bengali',
                'gu-IN': 'Gujarati',
                'en-US': 'English'
            };
            const languageName = userLanguage ? (languageMap[userLanguage] || userLanguage) : null;
            const isNonEnglish = languageName && languageName !== 'English';

            // Build user content with explicit language instruction if needed
            let userContent = `${task.description}\n\nContext: ${JSON.stringify(context || {}, null, 2)}`;

            if (isNonEnglish && languageName) {
                // Add example phrases to help the model
                let examplePhrases = '';
                if (userLanguage === 'te-IN') {
                    examplePhrases = `
EXAMPLE CORRECT TELUGU PHRASES (use these as reference):
- "మీ పేరు ఏమిటి?" (What is your name?)
- "చాలా బాగుంది!" (Very good!)
- "ఇంకా చెప్పండి" (Tell me more)
- "మీ email ఏమిటి?" (What is your email?)
- "మీ business idea ఏమిటి?" (What is your business idea?)
- "ధన్యవాదాలు!" (Thank you!)

USE SIMPLE SPOKEN TELUGU ONLY. Mix English words for business terms.`;
                } else if (userLanguage === 'hi-IN') {
                    examplePhrases = `
EXAMPLE CORRECT HINDI PHRASES (use these as reference):
- "आपका नाम क्या है?" (What is your name?)
- "बहुत अच्छा!" (Very good!)
- "और बताइए" (Tell me more)
- "आपका email क्या है?" (What is your email?)
- "आपका business idea क्या है?" (What is your business idea?)
- "धन्यवाद!" (Thank you!)

USE SIMPLE CONVERSATIONAL HINDI ONLY. Hinglish is fine.`;
                }

                userContent = `🔴 CRITICAL LANGUAGE REQUIREMENT 🔴
The user has selected ${languageName} (${userLanguage}) as their preferred language.
YOU MUST respond ENTIRELY in ${languageName}. DO NOT use English sentences.

⚠️ USE SIMPLE, EVERYDAY ${languageName.toUpperCase()} - NOT FORMAL/LITERARY LANGUAGE!
${examplePhrases}

${userContent}

REMINDER: Your response must be 100% in simple ${languageName}. Use common words only.`;
            }

            // Build messages
            const messages: GroqMessage[] = [
                { role: 'system', content: agent.system_prompt },
                {
                    role: 'user',
                    content: userContent
                }
            ];


            // Use local Ollama or Groq based on config
            let response: any;
            if (this.config.useLocal && this.openai) {
                logger.agent(task.agent_id, 'Using LOCAL LLM (Ollama)');
                response = await this.openai.chat.completions.create({
                    model: this.config.localModel,
                    messages: messages as any,
                    temperature: agent.temperature,
                    max_tokens: 4000
                    // Note: Ollama/llama3 has limited tool support, skipping tools for now
                });
            } else {
                // Call Groq with agent configuration
                response = await this.groq.chat.completions.create({
                    model: agent.model,
                    messages: messages as any,
                    temperature: agent.temperature,
                    max_tokens: 4000,
                    tools: tools.length > 0 ? tools : undefined,
                    tool_choice: tools.length > 0 ? 'auto' : undefined
                });
            }

            let assistantMessage = response.choices[0]?.message;
            const toolCalls: ToolCall[] = [];

            // Handle tool calls (only for Groq, not local Ollama)
            if (!this.config.useLocal && assistantMessage?.tool_calls) {
                logger.agent(task.agent_id, 'Processing tool calls', {
                    count: assistantMessage.tool_calls.length
                });

                const toolResults = await this.handleToolCalls(
                    assistantMessage.tool_calls,
                    agent.skills
                );

                toolCalls.push(...assistantMessage.tool_calls);

                // Add assistant message and tool results to conversation
                messages.push(assistantMessage as GroqMessage);
                messages.push(...toolResults);

                // Get final response after tool execution
                response = await this.groq.chat.completions.create({
                    model: agent.model,
                    messages: messages as any,
                    temperature: agent.temperature,
                    max_tokens: 4000
                });

                assistantMessage = response.choices[0]?.message;
            }

            const output: AgentOutput = {
                task_id: task.id,
                agent_id: task.agent_id,
                agent_name: task.agent_name,
                output: assistantMessage?.content || '',
                skills_used: agent.skills.filter(skill =>
                    toolCalls.some(tc => tc.function.name === skill)
                ),
                tool_calls: toolCalls,
                execution_time_ms: Date.now() - startTime,
                success: true
            };

            logger.agent(task.agent_id, 'Execution complete', {
                duration_ms: output.execution_time_ms,
                skills_used: output.skills_used.length
            });

            return output;
        } catch (error) {
            logger.error(`Agent execution failed: ${task.agent_id}`, error);

            return {
                task_id: task.id,
                agent_id: task.agent_id,
                agent_name: task.agent_name,
                output: '',
                skills_used: [],
                tool_calls: [],
                execution_time_ms: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Handle tool/skill calls
     */
    async handleToolCalls(
        toolCalls: ToolCall[],
        availableSkills: string[]
    ): Promise<ToolCallResult[]> {
        const results: ToolCallResult[] = [];

        for (const toolCall of toolCalls) {
            try {
                const skillId = toolCall.function.name;

                if (!availableSkills.includes(skillId)) {
                    logger.warn(`Skill not available for agent: ${skillId}`);
                    results.push({
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        name: skillId,
                        content: JSON.stringify({ error: 'Skill not available' })
                    });
                    continue;
                }

                const params = JSON.parse(toolCall.function.arguments);
                const result = await this.skillRegistry.execute(skillId, params);

                results.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: skillId,
                    content: JSON.stringify(result)
                });
            } catch (error) {
                logger.error(`Tool call failed: ${toolCall.function.name}`, error);
                results.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: toolCall.function.name,
                    content: JSON.stringify({
                        error: error instanceof Error ? error.message : 'Tool execution failed'
                    })
                });
            }
        }

        return results;
    }

    /**
     * Synthesize agent outputs into final response
     */
    async synthesize(
        agentOutputs: AgentOutput[],
        originalMessage: string,
        nextQuestion?: { question: string; type: string; options?: any[] },
        language?: string
    ): Promise<string> {
        try {
            logger.info('Synthesizing agent outputs', { language: language || 'default' });

            const languageMap: Record<string, string> = {
                'hi-IN': 'Hindi',
                'te-IN': 'Telugu',
                'ta-IN': 'Tamil',
                'kn-IN': 'Kannada',
                'ml-IN': 'Malayalam',
                'mr-IN': 'Marathi',
                'bn-IN': 'Bengali',
                'gu-IN': 'Gujarati',
                'en-US': 'English'
            };

            const targetLangName = language ? (languageMap[language] || language) : 'English';
            const isNonEnglish = language && language !== 'en-US' && targetLangName !== 'English';

            logger.info('Synthesize: Language Analysis', {
                input_language: language,
                target_lang_name: targetLangName,
                is_non_english: isNonEnglish
            });

            // Strategy: Attempt to generate in target language directly for better flow,
            // but still use translation service as a backup/refinement if available.
            const systemPrompt = `You are Abhishek, a friendly CA business advisor. Keep responses short (2-3 sentences max).

IMPORTANT RULES:
${isNonEnglish ? `- RESPONSE MUST BE IN ${targetLangName.toUpperCase()}.` : '- Respond in English.'}
- Be warm and natural
- Never use placeholder brackets like [something]
- Never include language codes like "Te-IN" or "Hi-IN" in your response
- Stay focused on the question being asked
- Don't invent topics that weren't mentioned`;

            const userPrompt = nextQuestion
                ? `The user answered: "${originalMessage}"
The question they answered was about: ${nextQuestion.type === 'text' ? 'providing information' : nextQuestion.type}

Now you need to ask them: "${nextQuestion.question}"

Write a short response (under 50 words) that:
1. Briefly acknowledges what they said
2. Then asks the next question in a natural way

${isNonEnglish ? `RESPOND IN ${targetLangName.toUpperCase()} ONLY.` : 'RESPOND IN ENGLISH ONLY.'}`
                : `The user said: "${originalMessage}"

Write a brief, friendly acknowledgment (1-2 sentences). Be natural and warm. ${isNonEnglish ? `RESPOND IN ${targetLangName.toUpperCase()} ONLY.` : 'RESPOND IN ENGLISH ONLY.'}`;

            let content: string | null = null;

            if (this.config.useLocal && this.openai) {
                const response = await this.openai.chat.completions.create({
                    model: this.config.localModel || 'llama3',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });
                content = response.choices[0]?.message?.content;
            } else {
                const response = await this.groq.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });
                content = response.choices[0]?.message?.content;
            }

            // Translate response if non-English language is selected
            let finalContent = content || 'Thanks for sharing that.';

            // DEBUG: Log translation decision
            logger.info('Translation decision', {
                isNonEnglish,
                language,
                willTranslate: !!(isNonEnglish && language),
                contentLength: finalContent.length,
                contentPreview: finalContent.substring(0, 100)
            });

            if (isNonEnglish && language) {
                logger.info('Translating with Google Cloud Translation to ' + language);
                try {
                    // Use fresh translator instance with Google Cloud
                    const translator = getTranslator();

                    logger.info('Translator initialized, calling translate...');

                    // Optimization: If the content is already in the target script/language, we might want to skip.
                    // But for now, we'll let Google Translate handle it (it usually acts as identity for same-lang).
                    const translationResult = await translator.translate(finalContent, language);

                    logger.info('Translation result', {
                        success: translationResult.success,
                        error: translationResult.error,
                        translatedLength: translationResult.translatedText?.length
                    });

                    if (translationResult.success) {
                        finalContent = translationResult.translatedText;
                        logger.info('Response translated successfully', {
                            targetLanguage: language,
                            originalLength: content?.length || 0,
                            translatedLength: finalContent.length,
                            translatedPreview: finalContent.substring(0, 100)
                        });
                    } else {
                        logger.error('Translation returned unsuccessful', translationResult.error);
                    }
                } catch (translationError) {
                    logger.error('Translation threw exception', translationError);
                    // Keep original content on translation failure
                }
            } else {
                logger.info('Skipping translation (English or no language)');
            }

            return finalContent;
        } catch (error) {
            logger.error('Synthesis failed', error);

            // Fallback: Use a simple acknowledgment
            return 'Thanks for sharing that!';
        }
    }
}
