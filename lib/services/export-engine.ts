/**
 * Export Engine
 * Converts markdown documents to PDF, DOCX, and PPT formats
 */

import * as fs from 'fs';
import * as path from 'path';
import { PassThrough } from 'stream';
import MarkdownIt from 'markdown-it';
import archiver from 'archiver';

const md = new MarkdownIt();

export interface ExportOptions {
    filename: string;
    author?: string;
    title?: string;
}

export class ExportEngine {
    /**
     * Convert Markdown to HTML
     */
    private markdownToHtml(markdown: string, title?: string): string {
        const htmlContent = md.render(markdown);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Document'}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
            margin-top: 30px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin-left: 0;
            color: #555;
        }
        strong {
            color: #2c3e50;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>
    `.trim();
    }

    /**
     * Convert Markdown to PDF using Puppeteer
     */
    async toPDF(markdown: string, options: ExportOptions): Promise<Buffer> {
        try {
            // Dynamic import for Puppeteer (optional dependency)
            const puppeteer = await import('puppeteer');

            const html = this.markdownToHtml(markdown, options.title);

            // Launch browser
            const browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm',
                },
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: `
          <div style="font-size: 10px; color: #888; text-align: center; width: 100%;">
            ${options.title || 'Document'}
          </div>
        `,
                footerTemplate: `
          <div style="font-size: 10px; color: #888; text-align: center; width: 100%;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
            });

            await browser.close();

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error('PDF generation failed. Make sure Puppeteer is installed.');
        }
    }

    /**
     * Convert Markdown to DOCX using docx library
     */
    async toDOCX(markdown: string, options: ExportOptions): Promise<Buffer> {
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

            // Parse markdown into docx elements (simplified version)
            const lines = markdown.split('\n');
            const paragraphs: any[] = [];

            for (const line of lines) {
                if (line.startsWith('# ')) {
                    paragraphs.push(
                        new Paragraph({
                            text: line.substring(2),
                            heading: HeadingLevel.HEADING_1,
                        })
                    );
                } else if (line.startsWith('## ')) {
                    paragraphs.push(
                        new Paragraph({
                            text: line.substring(3),
                            heading: HeadingLevel.HEADING_2,
                        })
                    );
                } else if (line.startsWith('### ')) {
                    paragraphs.push(
                        new Paragraph({
                            text: line.substring(4),
                            heading: HeadingLevel.HEADING_3,
                        })
                    );
                } else if (line.trim()) {
                    paragraphs.push(
                        new Paragraph({
                            children: [new TextRun(line)],
                        })
                    );
                } else {
                    paragraphs.push(new Paragraph({ text: '' }));
                }
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs,
                }],
            });

            const buffer = await Packer.toBuffer(doc);
            return buffer;
        } catch (error) {
            console.error('DOCX generation error:', error);
            throw new Error('DOCX generation failed. Make sure docx is installed.');
        }
    }

    /**
     * Convert Markdown to PowerPoint (PPTX)
     */
    async toPPTX(markdown: string, options: ExportOptions): Promise<Buffer> {
        try {
            const pptxgen = await import('pptxgenjs');
            const pptx = new pptxgen.default();

            // Parse markdown into slides
            const sections = markdown.split(/^## /gm);

            for (let i = 1; i < sections.length; i++) {
                const section = sections[i];
                const lines = section.split('\n');
                const title = lines[0].trim();
                const content = lines.slice(1).join('\n').trim();

                const slide = pptx.addSlide();

                // Add title
                slide.addText(title, {
                    x: 0.5,
                    y: 0.5,
                    w: '90%',
                    h: 1,
                    fontSize: 32,
                    bold: true,
                    color: '2C3E50',
                });

                // Add content
                if (content) {
                    slide.addText(content, {
                        x: 0.5,
                        y: 1.8,
                        w: '90%',
                        h: 4,
                        fontSize: 14,
                        color: '34495E',
                    });
                }
            }

            const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
            return buffer;
        } catch (error) {
            console.error('PPTX generation error:', error);
            throw new Error('PPTX generation failed. Make sure pptxgenjs is installed.');
        }
    }

    /**
     * Convert Markdown Tables to CSV
     */
    toCSV(markdown: string): Buffer {
        const lines = markdown.split('\n');
        const rows: string[] = [];
        let textRow = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('|')) {
                // Table row
                if (trimmed.includes('---')) continue; // Skip separators

                // Parse cells, handling | characters within quotes if needed (simplified here)
                // Assuming simple markdown tables for now
                const cells = trimmed.split('|');
                // Remove first and last empty elements from split
                if (cells.length >= 2) {
                    const dataCells = cells.slice(1, cells.length - 1).map(c => {
                        const cellContent = c.trim();
                        // Escape quotes for CSV
                        return `"${cellContent.replace(/"/g, '""')}"`;
                    });
                    rows.push(dataCells.join(','));
                }
            }
        }

        return Buffer.from(rows.join('\n'));
    }

    /**
     * Create ZIP package with all documents
     */
    async createPackage(
        documents: Record<string, { markdown: string; pdf?: Buffer; docx?: Buffer }>,
        outputPath: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {
                zlib: { level: 9 }, // Maximum compression
            });

            output.on('close', () => {
                resolve(outputPath);
            });

            archive.on('error', (err: Error) => {
                reject(err);
            });

            archive.pipe(output);

            // Add documents to ZIP
            for (const [name, doc] of Object.entries(documents)) {
                // Add markdown
                archive.append(doc.markdown, { name: `markdown/${name}.md` });

                // Add PDF if available
                if (doc.pdf) {
                    archive.append(doc.pdf, { name: `pdf/${name}.pdf` });
                }

                // Add DOCX if available
                if (doc.docx) {
                    archive.append(doc.docx, { name: `docx/${name}.docx` });
                }
            }

            archive.finalize();
        });
    }

    /**
     * Create ZIP package as Buffer (for streaming to client)
     */
    async toZipBuffer(
        documents: Array<{ name: string; content: string }>,
        formats: ('pdf' | 'docx' | 'pptx' | 'md')[] = ['pdf', 'docx', 'md']
    ): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const chunks: Buffer[] = [];
                const archive = archiver('zip', {
                    zlib: { level: 9 },
                });

                // Use PassThrough stream to collect data
                const passthrough = new PassThrough();
                passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
                passthrough.on('end', () => resolve(Buffer.concat(chunks)));

                archive.on('error', (err: Error) => reject(err));
                archive.pipe(passthrough);

                // Process each document
                for (const doc of documents) {
                    const safeName = doc.name.replace(/[^a-zA-Z0-9-_]/g, '_');

                    // Always add markdown
                    if (formats.includes('md')) {
                        archive.append(doc.content, { name: `${safeName}.md` });
                    }

                    // Generate and add PDF
                    if (formats.includes('pdf')) {
                        try {
                            const pdfBuffer = await this.toPDF(doc.content, {
                                filename: safeName,
                                title: doc.name
                            });
                            archive.append(pdfBuffer, { name: `${safeName}.pdf` });
                        } catch (e) {
                            console.error(`Failed to generate PDF for ${doc.name}:`, e);
                        }
                    }

                    // Generate and add DOCX
                    if (formats.includes('docx')) {
                        try {
                            const docxBuffer = await this.toDOCX(doc.content, {
                                filename: safeName,
                                title: doc.name
                            });
                            archive.append(docxBuffer, { name: `${safeName}.docx` });
                        } catch (e) {
                            console.error(`Failed to generate DOCX for ${doc.name}:`, e);
                        }
                    }

                    // Generate and add PPTX (only for suitable documents)
                    if (formats.includes('pptx') && doc.content.includes('## ')) {
                        try {
                            const pptxBuffer = await this.toPPTX(doc.content, {
                                filename: safeName,
                                title: doc.name
                            });
                            archive.append(pptxBuffer, { name: `${safeName}.pptx` });
                        } catch (e) {
                            console.error(`Failed to generate PPTX for ${doc.name}:`, e);
                        }
                    }
                }

                archive.finalize();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Save document to file system
     */
    async saveToFile(
        content: Buffer | string,
        filepath: string
    ): Promise<void> {
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await fs.promises.writeFile(filepath, content);
    }
}

/**
 * Singleton instance
 */
export const exportEngine = new ExportEngine();
