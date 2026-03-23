// ─── Section-level result ──────────────────────────────────────────────────

export interface ResumeSection {
    name: "Summary" | "Experience" | "Skills" | "Education" | "Formatting";
    score: number;
    strengths: string[];
    improvements: string[];
    rewrite_suggestion: string;
}

// ─── Top-level AI response ─────────────────────────────────────────────────

export interface EnhancementResult {
    overall_score: number;
    ats_score: number;
    sections: ResumeSection[];
}

// ─── API route shapes ──────────────────────────────────────────────────────

export interface EnhanceRequestBody {
    resumeText: string;
}

export interface EnhanceSuccessResponse {
    result: EnhancementResult;
}

export interface EnhanceErrorResponse {
    error: string;
}
