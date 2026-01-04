/**
 * Dialogflow Service
 * Handles conversation management using Google Dialogflow ES
 */

import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface DialogflowConfig {
    projectId: string;
    languageCode?: string;
}

export interface DialogflowResponse {
    queryText: string;
    fulfillmentText: string;
    intent: {
        name: string;
        displayName: string;
        confidence: number;
    } | null;
    parameters: Record<string, any>;
    allRequiredParamsPresent: boolean;
    outputContexts: any[];
    sentimentAnalysisResult?: {
        score: number;
        magnitude: number;
    };
}

export interface OrchestratorContext {
    detectedIntent: string | null;
    intentConfidence: number;
    extractedEntities: Record<string, any>;
    conversationContext: string[];
    sentiment?: {
        score: number;
        magnitude: number;
    };
}

export class DialogflowService {
    private sessionClient: SessionsClient;
    private projectId: string;
    private defaultLanguage: string;

    constructor(config: DialogflowConfig) {
        this.sessionClient = new SessionsClient();
        this.projectId = config.projectId;
        this.defaultLanguage = config.languageCode || 'en-US';

        logger.info('DialogflowService initialized', {
            projectId: this.projectId,
            defaultLanguage: this.defaultLanguage
        });
    }

    /**
     * Detect intent from user text input
     */
    async detectIntent(
        text: string,
        sessionId?: string,
        languageCode?: string
    ): Promise<DialogflowResponse> {
        const session = this.sessionClient.projectAgentSessionPath(
            this.projectId,
            sessionId || uuidv4()
        );

        const request = {
            session,
            queryInput: {
                text: {
                    text,
                    languageCode: languageCode || this.defaultLanguage,
                },
            },
        };

        try {
            logger.info('Detecting intent', {
                text: text.substring(0, 50) + '...',
                sessionId,
                languageCode: languageCode || this.defaultLanguage
            });

            const [response] = await this.sessionClient.detectIntent(request);
            return this.parseDialogflowResponse(response, text);
        } catch (error) {
            logger.error('Dialogflow intent detection failed', error);
            throw error;
        }
    }

    /**
     * Detect intent from audio input
     * Dialogflow ES handles STT internally
     */
    async detectIntentFromAudio(
        audioBuffer: Buffer,
        sessionId: string,
        languageCode?: string
    ): Promise<DialogflowResponse> {
        const session = this.sessionClient.projectAgentSessionPath(
            this.projectId,
            sessionId
        );

        const request = {
            session,
            queryInput: {
                audioConfig: {
                    audioEncoding: 'AUDIO_ENCODING_OGG_OPUS' as const,
                    sampleRateHertz: 16000,
                    languageCode: languageCode || this.defaultLanguage,
                },
            },
            inputAudio: audioBuffer,
        };

        try {
            logger.info('Detecting intent from audio', {
                audioSize: audioBuffer.length,
                sessionId,
                languageCode: languageCode || this.defaultLanguage
            });

            const [response] = await this.sessionClient.detectIntent(request);
            return this.parseDialogflowResponse(response, '');
        } catch (error) {
            logger.error('Dialogflow audio intent detection failed', error);
            throw error;
        }
    }

    /**
     * Parse Dialogflow response into our standard format
     */
    private parseDialogflowResponse(response: any, originalText: string): DialogflowResponse {
        const result = response.queryResult;

        if (!result) {
            throw new Error('No query result from Dialogflow');
        }

        const dialogflowResponse: DialogflowResponse = {
            queryText: result.queryText || originalText,
            fulfillmentText: result.fulfillmentText || '',
            intent: result.intent ? {
                name: result.intent.name || '',
                displayName: result.intent.displayName || '',
                confidence: result.intentDetectionConfidence || 0
            } : null,
            parameters: result.parameters?.fields ?
                this.convertStructToObject(result.parameters.fields) : {},
            allRequiredParamsPresent: result.allRequiredParamsPresent || false,
            outputContexts: result.outputContexts || [],
            sentimentAnalysisResult: result.sentimentAnalysisResult?.queryTextSentiment ? {
                score: result.sentimentAnalysisResult.queryTextSentiment.score || 0,
                magnitude: result.sentimentAnalysisResult.queryTextSentiment.magnitude || 0
            } : undefined
        };

        logger.info('Intent detected', {
            intent: dialogflowResponse.intent?.displayName,
            confidence: dialogflowResponse.intent?.confidence,
            fulfillmentText: dialogflowResponse.fulfillmentText.substring(0, 50)
        });

        return dialogflowResponse;
    }

    /**
     * Convert Dialogflow Struct to plain object
     */
    private convertStructToObject(fields: any): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(fields)) {
            result[key] = this.extractValue(value as any);
        }
        return result;
    }

    /**
     * Extract value from Dialogflow Value type
     */
    private extractValue(value: any): any {
        if (value.stringValue !== undefined) return value.stringValue;
        if (value.numberValue !== undefined) return value.numberValue;
        if (value.boolValue !== undefined) return value.boolValue;
        if (value.listValue) {
            return value.listValue.values?.map((v: any) => this.extractValue(v)) || [];
        }
        if (value.structValue) {
            return this.convertStructToObject(value.structValue.fields || {});
        }
        return null;
    }

    /**
     * Extract context for the Groq orchestrator
     * Transforms Dialogflow response into orchestrator-friendly format
     */
    extractContextForOrchestrator(response: DialogflowResponse): OrchestratorContext {
        // Extract context names from output contexts
        const contextNames = response.outputContexts
            .map((ctx: any) => {
                const parts = ctx.name?.split('/') || [];
                return parts[parts.length - 1] || '';
            })
            .filter((name: string) => name && !name.startsWith('__'));

        return {
            detectedIntent: response.intent?.displayName || null,
            intentConfidence: response.intent?.confidence || 0,
            extractedEntities: response.parameters,
            conversationContext: contextNames,
            sentiment: response.sentimentAnalysisResult
        };
    }

    /**
     * Create a new session ID
     */
    createSessionId(): string {
        return uuidv4();
    }
}

// Singleton instance
let dialogflowInstance: DialogflowService | null = null;

export function getDialogflowService(config?: DialogflowConfig): DialogflowService | null {
    const projectId = config?.projectId || process.env.DIALOGFLOW_PROJECT_ID;

    if (!projectId) {
        logger.warn('DIALOGFLOW_PROJECT_ID not set, Dialogflow service unavailable');
        return null;
    }

    if (!dialogflowInstance) {
        dialogflowInstance = new DialogflowService({
            projectId,
            languageCode: config?.languageCode
        });
    }
    return dialogflowInstance;
}

