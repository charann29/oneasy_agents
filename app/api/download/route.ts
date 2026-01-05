import { NextRequest, NextResponse } from 'next/server';
import { exportEngine } from '@/lib/services/export-engine';

export const maxDuration = 60; // Allow 60 seconds for generation

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, type, title } = body;

        if (!content) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const safeTitle = (title || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
        let buffer: Buffer | string;
        let contentType: string;
        let extension: string;

        switch (type) {
            case 'pdf':
                try {
                    buffer = await exportEngine.toPDF(content, { filename: safeTitle, title: title || 'Document' });
                } catch (e) {
                    // Fallback/Warning if puppeteer fails (e.g. no chrome)
                    console.error("PDF Export failed, checking deps", e);
                    throw new Error("PDF generation failed on server. Try downloading Markdown.");
                }
                contentType = 'application/pdf';
                extension = 'pdf';
                break;
            case 'docx':
                buffer = await exportEngine.toDOCX(content, { filename: safeTitle, title: title || 'Document' });
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                extension = 'docx';
                break;
            case 'pptx':
                buffer = await exportEngine.toPPTX(content, { filename: safeTitle, title: title || 'Presentation' });
                contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                extension = 'pptx';
                break;
            case 'csv':
                buffer = exportEngine.toCSV(content);
                contentType = 'text/csv';
                extension = 'csv';
                break;
            default:
                return NextResponse.json({ error: 'Invalid document type. Supported: pdf, docx, pptx, csv' }, { status: 400 });
        }

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${safeTitle}.${extension}"`
            }
        });

    } catch (e: any) {
        console.error('Download API Error:', e);
        return NextResponse.json({ error: e.message || 'Export failed' }, { status: 500 });
    }
}
