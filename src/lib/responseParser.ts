/**
 * responseParser.ts
 * Validates and maps raw Groq JSON output → typed EnhancementResult.
 * Throws a descriptive error if the shape is wrong.
 */
import type { EnhancementResult, ResumeSection } from "@/types";

const VALID_SECTION_NAMES = [
    "Summary",
    "Experience",
    "Skills",
    "Education",
    "Formatting",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSection(raw: any, index: number): ResumeSection {
    if (!VALID_SECTION_NAMES.includes(raw?.name)) {
        throw new Error(`Section[${index}].name is invalid: "${raw?.name}"`);
    }
    return {
        name: raw.name,
        score: typeof raw.score === "number" ? Math.round(raw.score) : 0,
        strengths: Array.isArray(raw.strengths)
            ? raw.strengths.slice(0, 3).map(String)
            : [],
        improvements: Array.isArray(raw.improvements)
            ? raw.improvements.slice(0, 4).map(String)
            : [],
        rewrite_suggestion:
            typeof raw.rewrite_suggestion === "string"
                ? raw.rewrite_suggestion
                : "No rewrite suggestion available.",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEnhancementResult(raw: any): EnhancementResult {
    if (raw?.error) {
        throw new Error(raw.error);
    }
    if (
        typeof raw?.overall_score !== "number" ||
        typeof raw?.ats_score !== "number" ||
        !Array.isArray(raw?.sections)
    ) {
        throw new Error("AI returned an unexpected response format.");
    }
    return {
        overall_score: Math.round(raw.overall_score),
        ats_score: Math.round(raw.ats_score),
        sections: raw.sections.map(parseSection),
    };
}
