/**
 * Google Cloud Speech-to-Text Service
 * IMPROVED VERSION with better audio format handling
 */

export interface TranscriptionResult {
    transcript: string;
    isFinal: boolean;
    confidence: number;
    languageCode: string;
}

export class GoogleSpeechService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;

        if (!apiKey) {
            console.warn('[GoogleSpeechService] No API key provided');
        }
    }

    /**
     * Transcribe audio using Google Cloud Speech-to-Text REST API
     * @param audioBuffer - Audio file buffer (WebM/Opus format from browser)
     * @param language - Language code (e.g., 'en-US', 'hi-IN', 'te-IN')
     * @returns Transcription text
     */
    async transcribeAudio(
        audioBuffer: Buffer,
        language: string = 'en-US'
    ): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Google Cloud API key not configured');
        }

        const audioContent = audioBuffer.toString('base64');

        console.log(`[GoogleSpeechService] Processing audio: ${audioBuffer.length} bytes, language: ${language}`);

        // Try multiple encoding configurations - different browsers produce different formats
        const encodingConfigs = [
            { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 }, // Chrome default
            { encoding: 'OGG_OPUS', sampleRateHertz: 48000 },  // Firefox
            { encoding: 'WEBM_OPUS', sampleRateHertz: 16000 }, // Requested sample rate
            { encoding: 'LINEAR16', sampleRateHertz: 16000 },  // Fallback
        ];

        for (const config of encodingConfigs) {
            try {
                const result = await this.tryTranscribe(audioContent, language, config);
                if (result) {
                    return result;
                }
            } catch (error: any) {
                console.log(`[GoogleSpeechService] Encoding ${config.encoding}@${config.sampleRateHertz}Hz failed, trying next...`);
            }
        }

        // If all configs fail, return empty string instead of throwing
        console.warn('[GoogleSpeechService] All encoding attempts failed, returning empty transcript');
        return '';
    }

    private async tryTranscribe(
        audioContent: string,
        language: string,
        config: { encoding: string; sampleRateHertz: number }
    ): Promise<string | null> {
        const requestBody = {
            config: {
                encoding: config.encoding,
                sampleRateHertz: config.sampleRateHertz,
                languageCode: language,
                enableAutomaticPunctuation: true,
                model: 'default', // Use 'default' for better compatibility
                // Enable alternative languages for mixed language detection
                alternativeLanguageCodes: this.getAlternativeLanguages(language),
            },
            audio: {
                content: audioContent,
            },
        };

        const url = `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`[GoogleSpeechService] API error with ${config.encoding}:`, response.status, errorText.substring(0, 200));
            throw new Error(`Speech API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract transcript from results
        const transcript = data.results
            ?.map((result: any) => result.alternatives?.[0]?.transcript || '')
            .join(' ')
            .trim();

        if (transcript) {
            console.log(`[GoogleSpeechService] Success with ${config.encoding}@${config.sampleRateHertz}Hz: "${transcript.substring(0, 50)}..."`);
            return transcript;
        }

        return null;
    }

    /**
     * Get alternative language codes for better detection
     */
    private getAlternativeLanguages(primaryLanguage: string): string[] {
        const languageGroups: Record<string, string[]> = {
            'en-US': ['en-IN'],
            'en-IN': ['en-US', 'hi-IN'],
            'hi-IN': ['en-IN'],
            'te-IN': ['en-IN'],
            'ta-IN': ['en-IN'],
            'kn-IN': ['en-IN'],
            'ml-IN': ['en-IN'],
            'mr-IN': ['en-IN', 'hi-IN'],
            'bn-IN': ['en-IN', 'hi-IN'],
            'gu-IN': ['en-IN', 'hi-IN'],
        };

        return languageGroups[primaryLanguage] || ['en-IN'];
    }

    /**
     * Get supported language codes
     */
    static getSupportedLanguages() {
        return [
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-IN', name: 'English (India)' },
            { code: 'hi-IN', name: 'Hindi' },
            { code: 'te-IN', name: 'Telugu' },
            { code: 'ta-IN', name: 'Tamil' },
            { code: 'kn-IN', name: 'Kannada' },
            { code: 'ml-IN', name: 'Malayalam' },
            { code: 'mr-IN', name: 'Marathi' },
            { code: 'bn-IN', name: 'Bengali' },
            { code: 'gu-IN', name: 'Gujarati' },
        ];
    }
}
