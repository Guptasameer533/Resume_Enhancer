interface AtsScoreBadgeProps {
    score: number;
    overallScore: number;
}

function scoreColor(score: number) {
    if (score >= 75) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 50) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
}

function scoreLabel(score: number) {
    if (score >= 75) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
}

export default function AtsScoreBadge({ score, overallScore }: AtsScoreBadgeProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Overall */}
            <div
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-6 py-5 ${scoreColor(overallScore)}`}
            >
                <span className="text-4xl font-bold tabular-nums">{overallScore}</span>
                <span className="text-xs font-medium uppercase tracking-widest opacity-70">
                    Overall Score
                </span>
                <span className="text-xs font-semibold">{scoreLabel(overallScore)}</span>
            </div>

            {/* ATS */}
            <div
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-6 py-5 ${scoreColor(score)}`}
            >
                <span className="text-4xl font-bold tabular-nums">{score}</span>
                <span className="text-xs font-medium uppercase tracking-widest opacity-70">
                    ATS Score
                </span>
                <span className="text-xs font-semibold">{scoreLabel(score)}</span>
            </div>
        </div>
    );
}
