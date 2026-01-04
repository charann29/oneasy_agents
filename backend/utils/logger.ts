/**
 * Logger Utility for Orchestrator System
 * Provides structured logging with timestamps and severity levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
}

class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatEntry(level: LogLevel, message: string, data?: any): LogEntry {
        return {
            timestamp: this.formatTimestamp(),
            level,
            message,
            ...(data && { data })
        };
    }

    private output(entry: LogEntry): void {
        const { timestamp, level, message, data } = entry;

        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'debug':
                if (this.isDevelopment) {
                    console.debug(prefix, message, data || '');
                }
                break;
            default:
                console.log(prefix, message, data || '');
        }
    }

    /**
     * Log informational message
     */
    info(message: string, data?: any): void {
        const entry = this.formatEntry('info', message, data);
        this.output(entry);
    }

    /**
     * Log debug message (only in development)
     */
    debug(message: string, data?: any): void {
        const entry = this.formatEntry('debug', message, data);
        this.output(entry);
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: any): void {
        const entry = this.formatEntry('warn', message, data);
        this.output(entry);
    }

    /**
     * Log error message
     */
    error(message: string, error?: Error | any): void {
        const data = error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
            : error;

        const entry = this.formatEntry('error', message, data);
        this.output(entry);
    }

    /**
     * Log orchestrator-specific events
     */
    orchestrator(event: string, data?: any): void {
        this.info(`[ORCHESTRATOR] ${event}`, data);
    }

    /**
     * Log agent execution events
     */
    agent(agentId: string, event: string, data?: any): void {
        this.info(`[AGENT:${agentId}] ${event}`, data);
    }

    /**
     * Log skill execution events
     */
    skill(skillId: string, event: string, data?: any): void {
        this.info(`[SKILL:${skillId}] ${event}`, data);
    }

    /**
     * Log timing information
     */
    timing(operation: string, durationMs: number): void {
        this.info(`[TIMING] ${operation}`, { duration_ms: durationMs });
    }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
