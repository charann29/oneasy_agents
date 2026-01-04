/**
 * Orchestrator API Route
 * POST /api/orchestrator
 */

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/backend/orchestrator';
import { BusinessContext } from '@/backend/utils/types';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OrchestratorRequest {
    message: string;
    context?: BusinessContext;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Parse request body
        const body: OrchestratorRequest = await request.json();

        // Validate request
        if (!body.message || typeof body.message !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: message is required' },
                { status: 400 }
            );
        }

        if (body.message.length > 5000) {
            return NextResponse.json(
                { error: 'Message too long (max 5000 characters)' },
                { status: 400 }
            );
        }

        const groqApiKey = process.env.GROQ_API_KEY;

        logger.info('Orchestrator API request', {
            message_length: body.message.length,
            has_context: !!body.context
        });

        // Check if Ollama is available first (preferred for local-only setup)
        let useLocal = false;
        try {
            const ollamaCheck = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            useLocal = ollamaCheck.ok;
            if (useLocal) {
                logger.info('✅ Ollama is available, using LOCAL LLM (llama3)');
            }
        } catch (error) {
            logger.warn('Ollama not available at localhost:11434', { error: error instanceof Error ? error.message : String(error) });
        }

        // If no local LLM and no Groq key, fail
        if (!useLocal && !groqApiKey) {
            logger.error('No LLM available: Ollama not running and GROQ_API_KEY not configured');
            return NextResponse.json(
                { error: 'No LLM available. Please start Ollama or configure GROQ_API_KEY.' },
                { status: 500 }
            );
        }

        // Initialize orchestrator with available LLM
        const orchestrator = new Orchestrator({
            groqApiKey: groqApiKey || 'not-needed-for-local',
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            maxTokens: 8000,
            useLocal,
            localBaseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
            localModel: process.env.LOCAL_LLM_MODEL || 'llama3'
        });

        // Process request
        const response = await orchestrator.processRequest(
            body.message,
            body.context
        );

        const totalTime = Date.now() - startTime;
        logger.info('Orchestrator API response', {
            execution_time_ms: response.execution_time_ms,
            total_time_ms: totalTime,
            agents_used: response.agent_outputs.length,
            success: response.agent_outputs.every(o => o.success)
        });

        // Return response
        return NextResponse.json({
            success: true,
            data: response,
            metadata: {
                total_time_ms: totalTime,
                agents_executed: response.agent_outputs.length,
                execution_type: response.plan.execution_type
            }
        });

    } catch (error) {
        const totalTime = Date.now() - startTime;

        logger.error('Orchestrator API error', error);

        // Determine error type and status code
        let statusCode = 500;
        let errorMessage = 'Internal server error';

        if (error instanceof Error) {
            errorMessage = error.message;

            // Check for specific error types
            if (error.message.includes('API key')) {
                statusCode = 401;
            } else if (error.message.includes('rate limit')) {
                statusCode = 429;
            } else if (error.message.includes('timeout')) {
                statusCode = 504;
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                metadata: {
                    total_time_ms: totalTime
                }
            },
            { status: statusCode }
        );
    }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
