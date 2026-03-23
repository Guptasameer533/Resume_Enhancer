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
  if (score >= 75) return "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20";
  if (score >= 50) return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20";
}

function SectionCard({ section }: { section: ResumeSection }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] shadow-sm space-y-5 transition-shadow">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{section.name}</h3>
        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getBadgeColor(section.score)}`}>
          {section.score} / 100
        </span>
      </div>

      {section.strengths.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">What is working</h4>
          <ul className="space-y-1">
            {section.strengths.map((str, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-slate-400 dark:text-slate-500 mt-0.5 select-none">›</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.improvements.length > 0 && (
        <div className="pt-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">What to improve</h4>
          <ul className="space-y-1">
            {section.improvements.map((imp, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-slate-400 dark:text-slate-500 mt-0.5 select-none">›</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.rewrite_suggestion && (
        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              {showOriginal ? "Original Text" : "Suggested Rewrite"}
            </h4>
            {section.original_text && (
              <button 
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 px-2 py-1 rounded"
              >
                View {showOriginal ? "Rewrite" : "Original"}
              </button>
            )}
          </div>
          <blockquote className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-r-lg whitespace-pre-wrap">
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
    if (score >= 75) return "stroke-green-500 dark:stroke-green-400";
    if (score >= 50) return "stroke-amber-500 dark:stroke-amber-400";
    return "stroke-red-500 dark:stroke-red-400";
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ATS Gauge (Clean Professional Style) */}
      <div className="flex flex-col items-center justify-center py-10 px-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm">
        
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle cx="72" cy="72" r="66" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8" />
            {/* Animated Score Ring */}
            <circle 
              cx="72" cy="72" r="66" 
              className={`${getAtsRingColor(atsScore)} fill-none transition-all duration-1000 ease-out`} 
              strokeWidth="8" 
              strokeDasharray={circumference * 1.1} 
              strokeDashoffset={dashoffset * 1.1}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center justify-center relative z-10">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">{atsScore}</span>
            <span className="text-xs font-semibold text-slate-400">%</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">ATS Compatibility</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Parsing Success Rate</p>
        </div>
        
        {/* Overall Score Pill */}
        <div className="mt-5 px-4 py-1.5 rounded bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall Quality</span>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeColor(data.overall_score)}`}>{data.overall_score}/100</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
          Section Analysis
        </h2>
        <div className="flex w-full sm:w-auto gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 dark:bg-transparent dark:hover:bg-white/5 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-300 dark:border-white/20 transition-colors"
          >
            Export .txt
          </button>
          
          <PDFDownloadLink
            document={<ResumeDocument data={data} />}
            fileName="enhanced-resume.pdf"
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors min-w-[140px]"
          >
            {({ loading }: { loading: boolean }) => (loading ? "Generating..." : "Download PDF")}
          </PDFDownloadLink>
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
