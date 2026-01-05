/**
 * ZIP Download API
 * Creates a ZIP file containing all documents in multiple formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportEngine } from '@/lib/services/export-engine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documents, title, formats } = body;

        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return NextResponse.json(
                { error: 'No documents provided' },
                { status: 400 }
            );
        }

        // Validate document format
        for (const doc of documents) {
            if (!doc.name || !doc.content) {
                return NextResponse.json(
                    { error: 'Each document must have name and content' },
                    { status: 400 }
                );
            }
        }

        console.log(`[ZIP] Creating ZIP with ${documents.length} documents`);
        console.log(`[ZIP] Formats: ${formats?.join(', ') || 'pdf, docx, md'}`);

        // Generate ZIP buffer
        const zipBuffer = await exportEngine.toZipBuffer(
            documents,
            formats || ['pdf', 'docx', 'md']
        );

        console.log(`[ZIP] Generated ZIP: ${zipBuffer.length} bytes`);

        // Create filename
        const baseName = (title || 'Business_Documents').replace(/[^a-zA-Z0-9-_ ]/g, '').trim();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${baseName.replace(/\s+/g, '_')}_${timestamp}.zip`;

        // Return ZIP file
        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': zipBuffer.length.toString(),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Expose-Headers': 'Content-Disposition, Content-Type, Content-Length',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error: any) {
        console.error('[ZIP] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create ZIP' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
