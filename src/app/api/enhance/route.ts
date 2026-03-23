/**
 * POST /api/enhance
 * Server-side Route Handler — Node.js runtime required for pdf-parse.
 *
 * References:
 *   - src/types/resume.ts  (EnhanceRequest, EnhanceResponse)
 *   - src/lib/promptBuilder.ts  (SYSTEM_PROMPT)
 *   - PLANNING.md data flow section
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "@/lib/promptBuilder";
import type { EnhanceRequest, EnhanceResponse } from "@/types/resume";

const MAX_CHARS = 15_000;

export async function POST(req: NextRequest) {
    // ── Parse & validate body ──────────────────────────────────────────────
    let body: EnhanceRequest;
    try {
        body = (await req.json()) as EnhanceRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const resumeText = (body?.resumeText ?? "").trim();

    if (!resumeText) {
        return NextResponse.json(
            { error: "Resume text is required." },
            { status: 400 }
        );
    }

    if (resumeText.length < 100) {
        return NextResponse.json(
            { error: "Resume too short" },
            { status: 400 }
        );
    }

    if (resumeText.length > MAX_CHARS) {
        return NextResponse.json(
            { error: `Resume must be under ${MAX_CHARS.toLocaleString()} characters.` },
            { status: 400 }
        );
    }

    // ── Groq call ──────────────────────────────────────────────────────────
    try {
        // Instantiate inside handler so GROQ_API_KEY is read at request time,
        // not at module load (prevents build-time errors on Vercel).
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chat = await groq.chat.completions.create({
            model: "llama-3.1-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: resumeText },
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const rawContent = chat.choices[0]?.message?.content ?? "{}";
        const result = JSON.parse(rawContent) as EnhanceResponse;

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("[/api/enhance] Groq error:", (err as Error).message);
        return NextResponse.json(
            { error: "AI service error" },
            { status: 500 }
        );
    }
}
