import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpeechService } from '@/backend/services/google-speech';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Google Cloud Speech-to-Text API endpoint
 * Replaces OpenAI Whisper for better accuracy and language support
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Cloud API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en-US';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`[Google STT] Transcribing audio (${audioFile.size} bytes) in ${language}`);

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Transcribe using Google Cloud Speech-to-Text
    const speechService = new GoogleSpeechService(apiKey);
    const transcript = await speechService.transcribeAudio(audioBuffer, language);

    console.log(`[Google STT] Transcription complete: ${transcript.substring(0, 50)}...`);

    return NextResponse.json({
      transcription: transcript,
      language,
      success: true,
      provider: 'google-cloud-speech-to-text',
    });

  } catch (error: any) {
    console.error('[Google STT] Transcription error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Transcription failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
