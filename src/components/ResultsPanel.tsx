import type { EnhanceResponse } from "@/types/resume";

interface ResultsPanelProps {
  data: EnhanceResponse;
}

function getBadgeColor(score: number) {
  if (score >= 75) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (score >= 50) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function ResultsPanel({ data }: ResultsPanelProps) {
  if (!data?.sections?.length) {
    return <div className="text-slate-400 text-center py-8">No sections found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-8">
        <div className={`flex-1 p-6 rounded-xl border ${getBadgeColor(data.overall_score)}`}>
          <div className="text-sm font-semibold mb-1 opacity-80">OVERALL SCORE</div>
          <div className="text-4xl font-bold">{data.overall_score}</div>
        </div>
        <div className={`flex-1 p-6 rounded-xl border ${getBadgeColor(data.ats_score)}`}>
          <div className="text-sm font-semibold mb-1 opacity-80">ATS SCORE</div>
          <div className="text-4xl font-bold">{data.ats_score}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.sections.map((section) => (
          <div key={section.name} className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-slate-100">{section.name}</h3>
              <span className={`px-2.5 py-1 text-sm font-bold rounded-md border ${getBadgeColor(section.score)}`}>
                {section.score}
              </span>
            </div>

            {section.strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What is working</h4>
                <ul className="space-y-1">
                  {section.strengths.map((str, i) => (
                    <li key={i} className="text-sm text-slate-200 flex gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.improvements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What to improve</h4>
                <ul className="space-y-1">
                  {section.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-200 flex gap-2">
                      <span className="text-orange-500 mt-0.5">→</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.rewrite_suggestion && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested rewrite</h4>
                <blockquote className="border-l-2 border-indigo-500/50 pl-4 py-1 text-sm italic text-slate-300 bg-indigo-500/5 rounded-r-lg">
                  {section.rewrite_suggestion}
                </blockquote>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
