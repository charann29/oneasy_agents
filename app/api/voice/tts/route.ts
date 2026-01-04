/**
 * Google Cloud Text-to-Speech API Route
 * Converts text to speech audio using Google Cloud TTS API
 */

import { NextRequest, NextResponse } from 'next/server';

// Voice mapping for Indian languages - ALL MALE voices for consistent "Abhishek CA" character
const VOICE_MAP: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
    'en-US': { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
    'en-IN': { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' },
    'hi-IN': { languageCode: 'hi-IN', name: 'hi-IN-Neural2-B', ssmlGender: 'MALE' },
    'te-IN': { languageCode: 'te-IN', name: 'te-IN-Standard-B', ssmlGender: 'MALE' },
    'ta-IN': { languageCode: 'ta-IN', name: 'ta-IN-Standard-B', ssmlGender: 'MALE' },
    'kn-IN': { languageCode: 'kn-IN', name: 'kn-IN-Standard-B', ssmlGender: 'MALE' },
    'ml-IN': { languageCode: 'ml-IN', name: 'ml-IN-Standard-B', ssmlGender: 'MALE' },
    'mr-IN': { languageCode: 'mr-IN', name: 'mr-IN-Standard-B', ssmlGender: 'MALE' },
    'bn-IN': { languageCode: 'bn-IN', name: 'bn-IN-Standard-B', ssmlGender: 'MALE' },
    'gu-IN': { languageCode: 'gu-IN', name: 'gu-IN-Standard-B', ssmlGender: 'MALE' },
};


export async function POST(request: NextRequest) {
    try {
        const { text, language = 'en-US' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
        if (!apiKey) {
            console.error('[TTS API] GOOGLE_CLOUD_API_KEY not configured');
            return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 });
        }

        // Get voice configuration for the language
        const voiceConfig = VOICE_MAP[language] || VOICE_MAP['en-US'];

        console.log(`[TTS API] Synthesizing speech: ${text.substring(0, 50)}... in ${language}`);

        // Call Google Cloud TTS API
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text: text },
                    voice: {
                        languageCode: voiceConfig.languageCode,
                        name: voiceConfig.name,
                        ssmlGender: voiceConfig.ssmlGender,
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 1.0,
                        pitch: 0,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TTS API] Google TTS error:', response.status, errorText);
            return NextResponse.json({ error: 'TTS API error' }, { status: 500 });
        }

        const data = await response.json();

        if (!data.audioContent) {
            return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
        }

        console.log(`[TTS API] Success! Generated audio for ${language}`);

        // Return base64 audio content
        return NextResponse.json({
            audioContent: data.audioContent,
            contentType: 'audio/mpeg',
        });

    } catch (error: any) {
        console.error('[TTS API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
