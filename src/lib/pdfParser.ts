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

    // Polyfill Turbopack's missing node module sandboxing mechanism
    // When external dependencies try to load Node CJS built-ins (like 'fs'), Turbopack 
    // strictly intercepts the require and invokes `process.getBuiltinModule`, but glitched
    // and forgot to instantiate it in the Edge/Node API route environment!
    if (typeof process !== "undefined" && !(process as any).getBuiltinModule) {
        // eslint-disable-next-line no-eval
        const realRequire = eval("require");
        (process as any).getBuiltinModule = (name: string) => realRequire(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("pdf-parse" as any);
    // pdf-parse ESM exports the function as .default or as the module itself
    const pdfParse: PdfParseFn =
        typeof mod.default === "function" ? mod.default : (mod as unknown as PdfParseFn);

    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text) {
        throw new Error(
            "Could not extract text from PDF. Try pasting your resume instead."
        );
    }
    return text;
}
