export interface ResumeSection {
    name: string;
    score: number;
    strengths: string[];
    improvements: string[];
    rewrite_suggestion: string;
}

export interface EnhanceResponse {
    overall_score: number;
    ats_score: number;
    sections: ResumeSection[];
}

export interface EnhanceRequest {
    resumeText: string;
}
