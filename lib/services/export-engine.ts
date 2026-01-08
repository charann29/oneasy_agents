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
     * Convert Markdown to PowerPoint (PPTX) with Professional Design
     * Uses Poppins-style typography and monochrome design system
     */
    async toPPTX(markdown: string, options: ExportOptions): Promise<Buffer> {
        try {
            const pptxgen = await import('pptxgenjs');
            const pptx = new pptxgen.default();

            // ========== DESIGN SYSTEM ==========
            const COLORS = {
                black: '000000',
                darkGray: '333333',
                mediumGray: '666666',
                gray: '999999',
                lightGray: 'CCCCCC',
                paleGray: 'E5E5E5',
                offWhite: 'F5F5F5',
                white: 'FFFFFF',
                accent: '2563EB' // Subtle blue for emphasis
            };

            // Set presentation properties
            pptx.author = options.author || 'Oneasy Business Planner';
            pptx.title = options.title || 'Pitch Deck';
            pptx.subject = 'Investor Pitch Deck';

            // Define slide master/layouts
            pptx.defineSlideMaster({
                title: 'MAIN_SLIDE',
                background: { color: COLORS.white },
                objects: [
                    // Header bar
                    { rect: { x: 0, y: 0, w: '100%', h: 0.05, fill: { color: COLORS.black } } },
                    // Footer bar
                    { rect: { x: 0, y: 5.45, w: '100%', h: 0.05, fill: { color: COLORS.lightGray } } }
                ]
            });

            // Parse markdown into slides
            const sections = this.parseMarkdownForSlides(markdown);

            // Track slide number
            let slideNum = 0;

            for (const section of sections) {
                slideNum++;
                const slide = pptx.addSlide({ masterName: 'MAIN_SLIDE' });

                // Different layouts based on slide type
                if (slideNum === 1) {
                    // ========== COVER SLIDE ==========
                    this.addCoverSlide(slide, section, COLORS, options);
                } else if (section.title.toLowerCase().includes('appendix')) {
                    // ========== APPENDIX SLIDE ==========
                    this.addAppendixSlide(slide, section, COLORS, slideNum);
                } else {
                    // ========== CONTENT SLIDE ==========
                    this.addContentSlide(slide, section, COLORS, slideNum);
                }
            }

            // If no slides were created, add a placeholder
            if (sections.length === 0) {
                const slide = pptx.addSlide();
                slide.addText(options.title || 'Presentation', {
                    x: 0.5, y: 2, w: '90%', h: 1.5,
                    fontSize: 44, bold: true, color: COLORS.black,
                    align: 'center', fontFace: 'Arial'
                });
            }

            const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
            return buffer;
        } catch (error) {
            console.error('PPTX generation error:', error);
            throw new Error('PPTX generation failed. Make sure pptxgenjs is installed.');
        }
    }

    /**
     * Parse markdown content into slide sections
     */
    private parseMarkdownForSlides(markdown: string): Array<{ title: string; content: string; bullets: string[] }> {
        const sections: Array<{ title: string; content: string; bullets: string[] }> = [];

        // Split by "Slide X:" or "## " patterns
        const slidePatterns = markdown.split(/(?=^(?:Slide \d+:|## ))/gm);

        for (const section of slidePatterns) {
            if (!section.trim()) continue;

            const lines = section.split('\n');
            let title = '';
            const bullets: string[] = [];
            let content = '';

            for (const line of lines) {
                const trimmed = line.trim();

                // Extract title
                if (trimmed.match(/^(?:Slide \d+:|## )/)) {
                    title = trimmed.replace(/^(?:Slide \d+:\s*|## )/, '').trim();
                }
                // Extract bullets
                else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\./)) {
                    const bulletText = trimmed.replace(/^[-*]\s*|\d+\.\s*/, '').trim();
                    if (bulletText && !bulletText.startsWith('**Visual') && !bulletText.startsWith('**Speaker')) {
                        bullets.push(bulletText);
                    }
                }
                // Extract labeled content (like **Tagline:** ...)
                else if (trimmed.startsWith('**') && trimmed.includes(':**')) {
                    const match = trimmed.match(/\*\*([^*]+):\*\*\s*(.*)/);
                    if (match) {
                        const label = match[1].trim();
                        const value = match[2].trim();
                        if (label.toLowerCase() !== 'visual guidance' && label.toLowerCase() !== 'speaker notes') {
                            if (value) {
                                bullets.push(`${label}: ${value}`);
                            }
                        }
                    }
                }
                // Regular content
                else if (trimmed && !trimmed.startsWith('#')) {
                    content += trimmed + ' ';
                }
            }

            if (title) {
                sections.push({ title, content: content.trim(), bullets });
            }
        }

        return sections;
    }

    /**
     * Add cover/title slide
     */
    private addCoverSlide(slide: any, section: { title: string; content: string; bullets: string[] }, COLORS: any, options: ExportOptions): void {
        // Background accent
        slide.addShape('rect', {
            x: 0, y: 2.2, w: '100%', h: 1.8,
            fill: { color: COLORS.paleGray }
        });

        // Main title
        slide.addText(options.title || section.title || 'Pitch Deck', {
            x: 0.5, y: 1.8, w: '90%', h: 1,
            fontSize: 48, bold: true, color: COLORS.black,
            align: 'center', fontFace: 'Arial'
        });

        // Tagline (from bullets/content)
        let tagline = '';
        for (const b of section.bullets) {
            if (b.toLowerCase().includes('tagline:')) {
                tagline = b.replace(/tagline:\s*/i, '').trim();
                break;
            }
        }
        if (!tagline && section.content) {
            tagline = section.content.substring(0, 100);
        }

        if (tagline) {
            slide.addText(tagline, {
                x: 0.5, y: 2.8, w: '90%', h: 0.8,
                fontSize: 20, color: COLORS.mediumGray,
                align: 'center', fontFace: 'Arial', italic: true
            });
        }

        // Footer
        slide.addText('Confidential', {
            x: 0.5, y: 5.0, w: '90%', h: 0.3,
            fontSize: 10, color: COLORS.gray,
            align: 'center', fontFace: 'Arial'
        });
    }

    /**
     * Add content slide with bullets
     */
    private addContentSlide(slide: any, section: { title: string; content: string; bullets: string[] }, COLORS: any, slideNum: number): void {
        // Slide header bar
        slide.addShape('rect', {
            x: 0, y: 0, w: '100%', h: 0.8,
            fill: { color: COLORS.black }
        });

        // Slide number
        slide.addText(slideNum.toString(), {
            x: 9.2, y: 0.15, w: 0.5, h: 0.5,
            fontSize: 16, color: COLORS.white,
            align: 'center', fontFace: 'Arial', bold: true
        });

        // Title (in header bar)
        slide.addText(section.title, {
            x: 0.4, y: 0.15, w: '80%', h: 0.5,
            fontSize: 22, bold: true, color: COLORS.white,
            fontFace: 'Arial'
        });

        // Bullets or content
        if (section.bullets.length > 0) {
            // Add bullet points
            const bulletRows = section.bullets.slice(0, 8).map((b, i) => ({
                text: b,
                options: {
                    bullet: { type: 'bullet', color: COLORS.darkGray },
                    fontSize: 16,
                    color: COLORS.darkGray,
                    paraSpaceAfter: 10
                }
            }));

            slide.addText(bulletRows, {
                x: 0.5, y: 1.0, w: '90%', h: 4,
                fontFace: 'Arial',
                valign: 'top'
            });
        } else if (section.content) {
            // Add paragraph content
            slide.addText(section.content, {
                x: 0.5, y: 1.0, w: '90%', h: 4,
                fontSize: 14, color: COLORS.darkGray,
                fontFace: 'Arial', valign: 'top'
            });
        }
    }

    /**
     * Add appendix-style slide
     */
    private addAppendixSlide(slide: any, section: { title: string; content: string; bullets: string[] }, COLORS: any, slideNum: number): void {
        // Gray header for appendix
        slide.addShape('rect', {
            x: 0, y: 0, w: '100%', h: 0.6,
            fill: { color: COLORS.mediumGray }
        });

        // Title
        slide.addText(`Appendix: ${section.title.replace(/appendix/i, '').trim()}`, {
            x: 0.4, y: 0.1, w: '80%', h: 0.4,
            fontSize: 18, color: COLORS.white,
            fontFace: 'Arial'
        });

        // Content
        const allContent = section.bullets.join('\n• ') || section.content;
        if (allContent) {
            slide.addText('• ' + allContent, {
                x: 0.5, y: 0.8, w: '90%', h: 4.2,
                fontSize: 12, color: COLORS.darkGray,
                fontFace: 'Arial', valign: 'top'
            });
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
