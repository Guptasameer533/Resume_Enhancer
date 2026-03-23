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
  if (score >= 75) return "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20";
  if (score >= 50) return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  return "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20";
}

function SectionCard({ section }: { section: ResumeSection }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="group p-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 space-y-5">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{section.name}</h3>
        <span className={`px-3 py-1 text-sm font-bold rounded-lg border ${getBadgeColor(section.score)} shadow-sm`}>
          {section.score} / 100
        </span>
      </div>

      {section.strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">What is working</h4>
          <ul className="space-y-2">
            {section.strengths.map((str, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-3 leading-relaxed">
                <span className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0 bg-green-50 dark:bg-green-500/10 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.improvements.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">What to improve</h4>
          <ul className="space-y-2">
            {section.improvements.map((imp, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-3 leading-relaxed">
                <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section.rewrite_suggestion && (
        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              {showOriginal ? "Original Text" : "AI Rewrite"}
            </h4>
            {section.original_text && (
              <button 
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-md"
              >
                View {showOriginal ? "Rewrite" : "Original"}
              </button>
            )}
          </div>
          <div className="relative group/quote">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover/quote:opacity-100 transition-opacity"></div>
            <blockquote className="relative border-l-4 border-indigo-400 dark:border-indigo-500 pl-4 py-3 pr-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-r-xl whitespace-pre-wrap font-medium">
              {showOriginal ? section.original_text : section.rewrite_suggestion}
            </blockquote>
          </div>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ATS Compatibility Hero Gauge (Premium Redesign) */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center py-12 px-6 mb-8 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative w-40 h-40 flex items-center justify-center drop-shadow-xl z-10 transition-transform hover:scale-105 duration-500">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 filter drop-shadow-lg">
            {/* Background track */}
            <circle cx="80" cy="80" r="72" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="12" />
            {/* Animated Score Ring */}
            <circle 
              cx="80" cy="80" r="72" 
              className={`${getAtsRingColor(atsScore)} fill-none transition-all duration-1000 ease-out`} 
              strokeWidth="12" 
              strokeDasharray={circumference * 1.2} 
              strokeDashoffset={dashoffset * 1.2}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center justify-center relative z-10">
            <span className="text-5xl font-extrabold text-slate-800 dark:text-white tracking-tighter">{atsScore}</span>
            <span className="text-sm font-bold text-slate-400">%</span>
          </div>
        </div>
        
        <div className="mt-8 text-center z-10">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">ATS Compatibility</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Your resume's parsing success rate</p>
        </div>
        
        {/* Premium Overall Score Pill */}
        <div className="mt-6 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-200 dark:bg-black/30 dark:border-white/5 flex items-center gap-4 z-10 shadow-sm backdrop-blur-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Quality</span>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
          <span className={`px-2.5 py-0.5 rounded-md text-sm font-bold border ${getBadgeColor(data.overall_score)}`}>{data.overall_score}/100</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="text-indigo-500">❖</span> Section Analysis
        </h2>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 text-sm font-bold rounded-xl shadow-sm transition-all border border-slate-200 dark:border-white/5"
          >
            Export .txt
          </button>
          <div className="group relative">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition-opacity"></div>
             {/* @ts-expect-error dynamic wrapper loses explicit prop types */}
             <PDFDownloadLink
                document={<ResumeDocument data={data} />}
                fileName="enhanced-resume.pdf"
                className="relative flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all border border-indigo-400/50 min-w-[180px]"
              >
               {({ loading }: { loading: boolean }) => (loading ? "Generating PDF..." : "Download Original PDF")}
             </PDFDownloadLink>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.sections.map((section) => (
          <SectionCard key={section.name} section={section} />
        ))}
      </div>
    </div>
  );
}
