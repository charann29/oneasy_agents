import { NextRequest, NextResponse } from 'next/server';
import { exportEngine } from '@/lib/services/export-engine';

export const maxDuration = 60; // Allow 60 seconds for generation

export async function POST(request: NextRequest) {
    try {
        // Support both JSON and form data
        const requestContentType = request.headers.get('content-type') || '';
        let content, type, title;

        if (requestContentType.includes('application/json')) {
            // JSON request (from fetch)
            const body = await request.json();
            content = body.content;
            type = body.type;
            title = body.title;
        } else {
            // Form data request (from form submission)
            const formData = await request.formData();
            content = formData.get('content')?.toString();
            type = formData.get('type')?.toString();
            title = formData.get('title')?.toString();
        }

        if (!content || !type) {
            return NextResponse.json({ error: 'No content or type provided' }, { status: 400 });
        }

        console.log(`Download request received: type=${type}, title=${title}, contentLength=${content.length}`);

        // Clean and generate filename with timestamp
        const baseName = (title || 'document').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]; // YYYY-MM-DD
        const safeTitle = `${baseName}_${timestamp}`;

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

        // Convert to Uint8Array for better compatibility
        const responseData = new Uint8Array(buffer as any);

        // Create filename (replace spaces with underscores)
        const filename = `${safeTitle.replace(/\s+/g, '_')}.${extension}`;

        console.log(`Serving file: ${filename} (${responseData.length} bytes, type: ${contentType})`);

        return new NextResponse(responseData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': responseData.length.toString(),
                // CORS headers to expose Content-Disposition
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Expose-Headers': 'Content-Disposition, Content-Type, Content-Length',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (e: any) {
        console.error('Download API Error:', e);
        return NextResponse.json({ error: e.message || 'Export failed' }, { status: 500 });
    }
}
