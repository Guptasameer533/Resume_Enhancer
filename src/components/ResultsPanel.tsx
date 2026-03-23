import type { EnhancementResult } from "@/types";
import AtsScoreBadge from "./AtsScoreBadge";
import SuggestionCard from "./SuggestionCard";

interface ResultsPanelProps {
    result: EnhancementResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
    const { overall_score, ats_score, sections } = result;

    return (
        <section aria-label="Resume analysis results" className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Analysis Results</h2>

            {/* Score badges */}
            <AtsScoreBadge score={ats_score} overallScore={overall_score} />

            {/* Section cards */}
            <div className="space-y-4">
                {sections.map((section) => (
                    <SuggestionCard key={section.name} section={section} />
                ))}
            </div>
        </section>
    );
}
