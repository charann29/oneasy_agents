/**
 * Translation API Route
 * POST /api/translate
 * Uses Google Cloud Translation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTranslator } from '@/backend/services/translation';
import { logger } from '@/backend/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TranslateRequest {
    text: string;
    targetLanguage: string;
    sourceLanguage?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: TranslateRequest = await request.json();

        if (!body.text || typeof body.text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: text is required' },
                { status: 400 }
            );
        }

        if (!body.targetLanguage || typeof body.targetLanguage !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: targetLanguage is required' },
                { status: 400 }
            );
        }

        logger.info('Translation API request', {
            textLength: body.text.length,
            targetLanguage: body.targetLanguage,
            sourceLanguage: body.sourceLanguage || 'en'
        });

        const translator = getTranslator();

        // Check if translation service is available
        const isAvailable = await translator.isAvailable();
        if (!isAvailable) {
            logger.warn('Google Translation API not available - missing API key');
            return NextResponse.json(
                {
                    error: 'Translation service unavailable. Configure GOOGLE_CLOUD_API_KEY.',
                    translatedText: body.text
                },
                { status: 503 }
            );
        }

        const result = await translator.translate(
            body.text,
            body.targetLanguage,
            body.sourceLanguage || 'en'
        );

        return NextResponse.json({
            originalText: result.originalText,
            translatedText: result.translatedText,
            targetLanguage: result.targetLanguage,
            success: result.success
        });

    } catch (error) {
        logger.error('Translation API error', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
}
