import { useState } from "react";
import dynamic from "next/dynamic";
import type { EnhanceResponse, ResumeSection } from "@/types/resume";
import { ResumeDocument } from "./ResumeDocument";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface ResultsPanelProps {
  data: EnhanceResponse;
}

function getBadgeColor(score: number) {
  if (score >= 75) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (score >= 50) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function SectionCard({ section }: { section: ResumeSection }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
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
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {showOriginal ? "Original Text" : "Suggested rewrite"}
            </h4>
            {section.original_text && (
              <button 
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                Show {showOriginal ? "Rewrite" : "Original"}
              </button>
            )}
          </div>
          <blockquote className="border-l-2 border-indigo-500/50 pl-4 py-2 text-sm italic text-slate-300 bg-indigo-500/5 rounded-r-lg whitespace-pre-wrap">
            {showOriginal ? section.original_text : section.rewrite_suggestion}
          </blockquote>
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ data }: ResultsPanelProps) {
  if (!data?.sections?.length) {
    return <div className="text-slate-400 text-center py-8">No sections found</div>;
  }

  const handleDownload = () => {
    let report = `RESUME ENHANCEMENT REPORT\n`;
    report += `Overall Score: ${data.overall_score}/100\n`;
    report += `ATS Score: ${data.ats_score}/100\n\n`;

    data.sections.forEach((s) => {
      report += `SECTION: ${s.name}  |  Score: ${s.score}/100\n`;
      if (s.strengths.length > 0) {
        report += `Strengths:\n`;
        s.strengths.forEach((str) => (report += `+ ${str}\n`));
      }
      if (s.improvements.length > 0) {
        report += `Improvements:\n`;
        s.improvements.forEach((imp) => (report += `-> ${imp}\n`));
      }
      if (s.rewrite_suggestion) {
        report += `Suggested Rewrite:\n${s.rewrite_suggestion}\n`;
      }
      report += `\n`;
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-enhancement-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

const atsScore = Math.max(0, data.ats_score || 0);
  const circumference = 376.99;
  const dashoffset = circumference * (1 - atsScore / 100);

  function getAtsRingColor(score: number) {
    if (score >= 75) return "stroke-green-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-red-500";
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-sm font-semibold rounded-lg shadow-sm transition-colors border border-indigo-500/30"
        >
          Download Report (.txt)
        </button>
        <PDFDownloadLink
          document={<ResumeDocument data={data} />}
          fileName="enhanced-resume.pdf"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border border-indigo-500/50 flex items-center justify-center min-w-[200px]"
        >
          {({ loading }: { loading: boolean }) => (loading ? "Generating PDF..." : "Download Resume (.pdf)")}
        </PDFDownloadLink>
      </div>

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
          <SectionCard key={section.name} section={section} />
        ))}
      </div>
    </div>
  );
}
