/**
 * groq.ts — SERVER-ONLY
 * Lazy-initialises the Groq client on first call so the build does not
 * throw when GROQ_API_KEY is absent at build time.
 * Only src/app/api/enhance/route.ts may import this file.
 */
import Groq from "groq-sdk";

let _groq: Groq | null = null;

export function getGroqClient(): Groq {
    if (!_groq) {
        const key = process.env.GROQ_API_KEY;
        if (!key) {
            throw new Error("GROQ_API_KEY is not set in environment variables.");
        }
        _groq = new Groq({ apiKey: key });
    }
    return _groq;
}
