import { NextRequest, NextResponse } from 'next/server';
import { generateAllDocumentsWithAI, type DocumentAnswers } from '@/lib/templates/ai-document-generator';

/**
 * Generate Documents API
 * 
 * POST /api/generate-documents
 * 
 * Generates professional business documents using AI (Groq)
 * NOT hardcoded templates - genuine AI-generated content
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, answers } = body;

        if (!answers || Object.keys(answers).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No questionnaire answers provided'
                },
                { status: 400 }
            );
        }

        console.log('📄 Generating AI documents for session:', sessionId);
        console.log('📋 Answers count:', Object.keys(answers).length);

        // Generate all documents using AI
        const startTime = Date.now();
        const documents = await generateAllDocumentsWithAI(answers as DocumentAnswers);
        const executionTime = Date.now() - startTime;

        console.log('✅ Documents generated in', executionTime, 'ms');

        // Return generated documents
        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                documents,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    executionTimeMs: executionTime,
                    documentCount: documents.length,
                    generatedBy: 'AI (Groq llama-3.3-70b)'
                },
            },
        });
    } catch (error) {
        console.error('❌ Document generation error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Document generation failed',
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
