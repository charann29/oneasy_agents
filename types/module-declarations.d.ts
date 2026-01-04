// Type declarations for modules without type definitions

declare module 'markdown-it' {
    interface MarkdownIt {
        render(md: string): string;
    }

    interface MarkdownItConstructor {
        new(): MarkdownIt;
        (): MarkdownIt;
    }

    const markdownit: MarkdownItConstructor;
    export = markdownit;
}

declare module 'archiver' {
    import { Writable, Transform } from 'stream';

    interface ArchiverOptions {
        zlib?: { level: number };
        store?: boolean;
    }

    interface Archiver extends Transform {
        append(source: Buffer | string | NodeJS.ReadableStream, options: { name: string }): this;
        directory(dirpath: string, destpath: string | false): this;
        file(filepath: string, options: { name: string }): this;
        finalize(): Promise<void>;
        pipe<T extends Writable>(destination: T): T;
        on(event: 'error', callback: (err: Error) => void): this;
        on(event: 'warning', callback: (err: Error) => void): this;
        on(event: 'end', callback: () => void): this;
        pointer(): number;
    }

    function archiver(format: 'zip' | 'tar', options?: ArchiverOptions): Archiver;
    export = archiver;
}
