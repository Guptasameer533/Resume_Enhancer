/**
 * POST /api/enhance
 * Server-side Route Handler — Node.js runtime required for pdf-parse.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";
import { SYSTEM_PROMPT } from "@/lib/promptBuilder";
import { parseEnhancementResult } from "@/lib/responseParser";

const MAX_CHARS = 15_000;

export async function POST(req: NextRequest) {
    try {
        let resumeText = "";

        const contentType = req.headers.get("content-type") ?? "";

        // ── PDF upload path ───────────────────────────────────────────────────
        if (contentType.includes("multipart/form-data")) {
            const form = await req.formData();
            const file = form.get("file") as File | null;
            if (!file) {
                return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
            }
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            try {
                // Dynamic import inside handler — pdf-parse is never loaded at build time
                const { extractTextFromPdf } = await import("@/lib/pdfParser");
                resumeText = await extractTextFromPdf(buffer);
            } catch (err) {
                return NextResponse.json(
                    { error: (err as Error).message },
                    { status: 400 }
                );
            }
        } else {
            // ── JSON / plain-text paste path ────────────────────────────────────
            const body = await req.json();
            resumeText = (body?.resumeText ?? "").trim();
        }

        // ── Validation ────────────────────────────────────────────────────────
        if (!resumeText) {
            return NextResponse.json(
                { error: "Resume text is required." },
                { status: 400 }
            );
        }
        if (resumeText.length > MAX_CHARS) {
            return NextResponse.json(
                { error: `Resume must be under ${MAX_CHARS.toLocaleString()} characters.` },
                { status: 400 }
            );
        }

        // ── Groq call ─────────────────────────────────────────────────────────
        const chat = await getGroqClient().chat.completions.create({
            model: "llama-3.1-70b-versatile",
            temperature: 0.4,
            max_tokens: 2048,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: resumeText },
            ],
        });

        const rawContent = chat.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(rawContent);
        const result = parseEnhancementResult(parsed);

        return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        const message = (err as Error).message ?? "Unknown error";

        // Surface short-resume / validation errors from parseEnhancementResult
        if (
            message === "Resume too short" ||
            message.startsWith("Section[") ||
            message.startsWith("AI returned")
        ) {
            return NextResponse.json({ error: message }, { status: 422 });
        }

        console.error("[/api/enhance]", message);
        return NextResponse.json(
            { error: "AI service unavailable. Please try again." },
            { status: 500 }
        );
    }
}
