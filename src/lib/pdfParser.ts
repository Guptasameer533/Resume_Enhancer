/**
 * pdfParser.ts — SERVER-ONLY (used inside route.ts with runtime = 'nodejs')
 * Extracts plain text from a PDF Buffer.
 *
 * pdf-parse is dynamically imported INSIDE the function body so it is never
 * evaluated at build time (Next.js runs route modules during page-data
 * collection, which would trigger DOMMatrix errors otherwise).
 *
 * The ESM build of pdf-parse exports the parse function as the module itself
 * (no .default), so we cast with `as unknown as Function`.
 */

type PdfParseResult = { text: string };
type PdfParseFn = (buf: Buffer) => Promise<PdfParseResult>;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    // Polyfill Next.js stripped DOM APIs before dynamically loading
    if (typeof global !== "undefined") {
        if (typeof global.DOMMatrix === "undefined") {
            (global as any).DOMMatrix = class DOMMatrix {};
        }
        if (typeof global.ImageData === "undefined") {
            (global as any).ImageData = class ImageData {};
        }
    }

    try {
        // Use the legacy build which perfectly supports CommonJS and Turbopack
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
        
        // Disable worker for Node API route execution
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
        
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
            disableFontFace: true,
            useWorkerFetch: false,
            isEvalSupported: false,
        });
        
        const pdfDocument = await loadingTask.promise;
        let fullText = "";
        
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const content = await page.getTextContent();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageText = content.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
        }
        
        const text = fullText.trim();
        if (!text) {
            throw new Error("Could not extract text from PDF. Try pasting your resume instead.");
        }
        return text;
    } catch (error) {
        console.error("PDF extraction failed:", error);
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`PDF Error: ${msg}`);
    }
}
