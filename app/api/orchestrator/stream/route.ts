/**
 * Orchestrator Streaming API Route
 * GET /api/orchestrator/stream?message=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/backend/orchestrator';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message');

    if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                logger.info('Starting streaming orchestration', { message });

                const orchestrator = new Orchestrator({
                    groqApiKey,
                    model: 'llama-3.3-70b-versatile'
                });

                // Step 1: Parse intent
                sendUpdate({ status: 'analyzing_intent', message: 'Analyzing your request...' });
                const intent = await orchestrator.parseIntent(message);
                sendUpdate({ status: 'intent_analyzed', intent });

                // Step 2: Create plan
                const plan = orchestrator.createPlan(intent);
                sendUpdate({ status: 'plan_created', plan });

                // Step 3: Execute plan
                sendUpdate({
                    status: 'executing_agents',
                    agents: plan.tasks.map(t => t.agent_name),
                    message: `Executing specialized agents: ${plan.tasks.map(t => t.agent_name).join(', ')}...`
                });

                const agentOutputs = await orchestrator.execute(plan);
                sendUpdate({ status: 'execution_complete', agentOutputs });

                // Step 4: Synthesize results
                sendUpdate({ status: 'synthesizing', message: 'Synthesizing insights...' });
                const synthesis = await orchestrator.synthesize(agentOutputs, message);

                sendUpdate({
                    status: 'complete',
                    synthesis,
                    metadata: {
                        agents_executed: agentOutputs.length,
                        execution_type: plan.execution_type
                    }
                });

                controller.close();
            } catch (error) {
                logger.error('Streaming orchestration failed', error);
                sendUpdate({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
