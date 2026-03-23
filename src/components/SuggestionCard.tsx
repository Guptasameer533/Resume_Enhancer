import type { ResumeSection } from "@/types";

interface SuggestionCardProps {
    section: ResumeSection;
}

function sectionIcon(name: ResumeSection["name"]) {
    const icons: Record<ResumeSection["name"], string> = {
        Summary: "📝",
        Experience: "💼",
        Skills: "🛠️",
        Education: "🎓",
        Formatting: "🎨",
    };
    return icons[name] ?? "📄";
}

function scoreRing(score: number) {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
}

export default function SuggestionCard({ section }: SuggestionCardProps) {
    const { name, score, strengths, improvements, rewrite_suggestion } = section;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{sectionIcon(name)}</span>
                    <h3 className="text-base font-semibold text-white">{name}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${scoreRing(score)}`} />
                    <span className="text-sm font-bold tabular-nums text-slate-300">{score}/100</span>
                </div>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        ✓ What&apos;s good
                    </p>
                    <ul className="space-y-1">
                        {strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="mt-0.5 text-emerald-500">•</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
                        ↑ Needs improvement
                    </p>
                    <ul className="space-y-1">
                        {improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="mt-0.5 text-amber-500">•</span>
                                {imp}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Rewrite suggestion */}
            {rewrite_suggestion && rewrite_suggestion !== "Section not found in resume." && (
                <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors list-none flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                        Suggested rewrite
                    </summary>
                    <blockquote className="mt-2 border-l-2 border-indigo-500/50 pl-3 text-sm italic text-slate-400 leading-relaxed">
                        {rewrite_suggestion}
                    </blockquote>
                </details>
            )}
        </div>
    );
}
