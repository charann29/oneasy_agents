import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/backend/orchestrator';
import { BusinessContext } from '@/backend/utils/types';

/**
 * POST /api/questionnaire/answer
 * Submit answer for current question with AI orchestration
 */
export async function POST(request: NextRequest) {
    try {
        const { sessionId, questionId, answer, all_answers } = await request.json();

        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is missing');
            return NextResponse.json(
                { error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            );
        }

        // Initialize Orchestrator
        const orchestrator = new Orchestrator({
            groqApiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
        });

        // 1. Construct Context
        // We accumulate all previous answers to give the AI full context
        const context: BusinessContext = {
            session_id: sessionId,
            previous_responses: all_answers,
            user_id: 'anonymous_user', // TODO: Get from auth
        };

        // 2. Formulate the Request for the Orchestrator
        // We frame the answer as an update to the business plan
        const message = `User provided answer for questionID '${questionId}': ${JSON.stringify(answer)}. 
        Context of all answers so far: ${JSON.stringify(all_answers)}.
        Please analyze this input, validate it if necessary, and update the business plan context.`;

        // 3. Process with AI
        const response = await orchestrator.processRequest(message, context);

        // 4. Construct Thinking Log for UI
        const thinking_log = [
            `Analyzed Request: ${response.intent.goal}`,
            `Plan: ${response.plan.execution_type} execution of ${response.plan.tasks.length} tasks`,
            ...response.plan.tasks.map(t => `Task: ${t.description}`),
            ...response.agent_outputs.map(a => `Agent ${a.agent_name} finished (${a.execution_time_ms}ms)`),
            `Synthesis complete`
        ];

        // 5. Extract Auto-populated fields & Preview Data
        // Ideally, agents would return specific structured data. 
        // For now, we'll try to parse JSON from the synthesis if it exists, or look at tool outputs.
        // This is a simplification; in a full implementation, we'd check specific tool call results.

        let autoPopulated = {};
        let previewData = null;

        return NextResponse.json({
            success: true,
            message: 'Answer processed',
            thinking_log,
            aiSuggestions: [response.synthesis], // The main AI response
            autoPopulated, // AI could populate this in the future
            agent_analysis: {
                agents_used: response.agent_outputs.map(a => a.agent_name),
                skills_used: response.agent_outputs.flatMap(a => a.skills_used)
            },
            // Pass the raw Orchestrator response for debugging/preview if needed
            debug_orchestrator: {
                intent: response.intent,
                execution_time: response.execution_time_ms
            }
        });

    } catch (error) {
        console.error('Answer submission error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to submit answer',
                details: error
            },
            { status: 500 }
        );
    }
}
