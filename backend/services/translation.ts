/**
 * Translation Service
 * Uses Google Cloud Translation API for accurate translations
 */

import { logger } from '../utils/logger';

export interface TranslationConfig {
    apiKey?: string;
}

export interface TranslationResult {
    originalText: string;
    translatedText: string;
    targetLanguage: string;
    success: boolean;
    error?: string;
}

// Map locale codes to Google Translate language codes
const LANGUAGE_CODES: Record<string, string> = {
    'hi-IN': 'hi',
    'te-IN': 'te',
    'ta-IN': 'ta',
    'kn-IN': 'kn',
    'ml-IN': 'ml',
    'mr-IN': 'mr',
    'bn-IN': 'bn',
    'gu-IN': 'gu',
    'en-US': 'en',
    'hi': 'hi',
    'te': 'te',
    'ta': 'ta',
    'kn': 'kn',
    'ml': 'ml',
    'mr': 'mr',
    'bn': 'bn',
    'gu': 'gu',
    'en': 'en'
};

const LANGUAGE_NAMES: Record<string, string> = {
    'hi-IN': 'Hindi',
    'hi': 'Hindi',
    'te-IN': 'Telugu',
    'te': 'Telugu',
    'ta-IN': 'Tamil',
    'ta': 'Tamil',
    'kn-IN': 'Kannada',
    'kn': 'Kannada',
    'ml-IN': 'Malayalam',
    'ml': 'Malayalam',
    'mr-IN': 'Marathi',
    'mr': 'Marathi',
    'bn-IN': 'Bengali',
    'bn': 'Bengali',
    'gu-IN': 'Gujarati',
    'gu': 'Gujarati',
    'en-US': 'English',
    'en': 'English'
};

export class TranslationService {
    private apiKey: string;

    constructor(config?: TranslationConfig) {
        this.apiKey = config?.apiKey || process.env.GOOGLE_CLOUD_API_KEY || '';

        if (!this.apiKey) {
            logger.warn('TranslationService: No Google Cloud API key provided. Translation may fail.');
        } else {
            logger.info('TranslationService: Google Cloud Translation API initialized');
        }
    }

    /**
     * Translate text to target language using Google Cloud Translation API
     */
    async translate(text: string, targetLanguageCode: string, sourceLanguage: string = 'en'): Promise<TranslationResult> {
        const targetLangCode = LANGUAGE_CODES[targetLanguageCode] || targetLanguageCode;
        const sourceLangCode = LANGUAGE_CODES[sourceLanguage] || sourceLanguage;
        const targetLanguageName = LANGUAGE_NAMES[targetLanguageCode] || targetLanguageCode;

        // Skip translation if already English or target is English
        if (targetLangCode === 'en' || targetLanguageCode === 'en-US') {
            return {
                originalText: text,
                translatedText: text,
                targetLanguage: targetLanguageName,
                success: true
            };
        }

        // Skip if source and target are the same
        if (targetLangCode === sourceLangCode) {
            return {
                originalText: text,
                translatedText: text,
                targetLanguage: targetLanguageName,
                success: true
            };
        }

        if (!this.apiKey) {
            logger.error('Translation failed: No API key');
            return {
                originalText: text,
                translatedText: text,
                targetLanguage: targetLanguageName,
                success: false,
                error: 'Google Cloud API key not configured'
            };
        }

        try {
            logger.info('Translating with Google Cloud Translation API', {
                textLength: text.length,
                source: sourceLangCode,
                target: targetLangCode
            });

            const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLangCode,
                    target: targetLangCode,
                    format: 'text'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Google Translation API error', { status: response.status, error: errorText });
                throw new Error(`Google API error: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.data?.translations?.[0]?.translatedText || text;

            logger.info('Google translation complete', {
                originalLength: text.length,
                translatedLength: translatedText.length,
                targetLanguage: targetLanguageName
            });

            return {
                originalText: text,
                translatedText,
                targetLanguage: targetLanguageName,
                success: true
            };

        } catch (error: any) {
            logger.error('Translation failed', error);
            return {
                originalText: text,
                translatedText: text,
                targetLanguage: targetLanguageName,
                success: false,
                error: error.message || 'Translation failed'
            };
        }
    }

    /**
     * Check if translation service is available
     */
    async isAvailable(): Promise<boolean> {
        return !!this.apiKey;
    }
}

// Singleton instance
let translatorInstance: TranslationService | null = null;

export function getTranslator(config?: TranslationConfig): TranslationService {
    if (!translatorInstance) {
        translatorInstance = new TranslationService({
            apiKey: process.env.GOOGLE_CLOUD_API_KEY,
            ...config
        });
    }
    return translatorInstance;
}

// Keep old export for backwards compatibility
export { TranslationService as OllamaTranslator };
