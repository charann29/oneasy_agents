import { NextRequest, NextResponse } from 'next/server';
import { getDocumentGenerationWorkflow } from '@/lib/workflows/document-generation-workflow';

/**
 * Generate Documents API (Phase 2 - Multi-Agent Orchestration)
 *
 * POST /api/generate-documents
 *
 * Generates professional business documents using:
 * - Claude API (Haiku for speed, upgradeable to Opus/Sonnet)
 * - Multi-agent orchestration (market_analyst, financial_modeler, gtm_strategist, customer_profiler)
 * - Real skill invocations (financial_modeling, market_sizing, etc.)
 * - Deep synthesis and analysis (4,000-6,000 word documents)
 *
 * This is NOT simple prompt generation - it's a full agent-based intelligence system.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, answers, additionalNotes } = body;

        if (!answers || Object.keys(answers).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No questionnaire answers provided'
                },
                { status: 400 }
            );
        }

        console.log('🚀 Starting Multi-Agent Document Generation (HMR Check)');
        console.log('📋 Session:', sessionId);
        console.log('📊 Answers count:', Object.keys(answers).length);

        // Include additional notes in context if provided
        if (additionalNotes) {
            console.log('📝 Additional notes provided:', additionalNotes.length, 'chars');
        }

        // Use the new workflow with agent orchestration
        const workflow = getDocumentGenerationWorkflow();

        // Merge additional notes into answers for document generation
        const enrichedAnswers = additionalNotes
            ? { ...answers, _user_additional_context: additionalNotes }
            : answers;

        const result = await workflow.generateAllDocuments(enrichedAnswers, sessionId);

        console.log('✅ Multi-Agent Generation Complete');
        console.log('📄 Documents:', result.documents.length);
        console.log('🤖 Agents executed:', result.metadata.agentsExecuted.join(', '));
        console.log('🔧 Skills invoked:', result.metadata.skillsInvoked);
        console.log('⏱️  Total time:', result.metadata.totalExecutionTimeMs, 'ms');
        console.log('💰 Tokens used:', result.metadata.totalTokensUsed);

        // Return generated documents
        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                documents: result.documents,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    executionTimeMs: result.metadata.totalExecutionTimeMs,
                    documentCount: result.documents.length,
                    generatedBy: 'Multi-Agent System (Claude + Agents + Skills)',
                    agentsExecuted: result.metadata.agentsExecuted,
                    skillsInvoked: result.metadata.skillsInvoked,
                    tokensUsed: result.metadata.totalTokensUsed
                },
            },
        });
    } catch (error) {
        console.error('❌ Document generation error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Document generation failed',
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}


/**
 * Get Generated Documents
 * 
 * GET /api/generate-documents?sessionId=xxx
 * 
 * Retrieves previously generated documents for a session
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Session ID required'
                },
                { status: 400 }
            );
        }

        // TODO: Implement document retrieval from storage
        // For now, return a placeholder response
        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                documents: [],
                message: 'Document retrieval not yet implemented',
            },
        });
    } catch (error) {
        console.error('Document retrieval error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Document retrieval failed',
            },
            { status: 500 }
        );
    }
}
