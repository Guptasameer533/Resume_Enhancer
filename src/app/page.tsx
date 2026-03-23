"use client";

import { useState } from "react";
import ResumeInput from "@/components/ResumeInput";
import ResultsPanel from "@/components/ResultsPanel";
import type { EnhanceResponse } from "@/types/resume";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EnhanceResponse | null>(null);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An unknown error occurred.");
      } else {
        setResults(data);
      }
    } catch (err) {
      setError("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative z-10">
      {/* Background glowing orb effect relative to main container */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-10 dark:bg-indigo-500/10"></div>

      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_5s_infinite_linear]">
            Resume Enhancer
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Elevate your career with AI. Get flawless ATS optimization, powerful rewriting suggestions, and an instant premium PDF export.
        </p>
      </div>

      <div className="space-y-8 relative">
        {/* Main Glassmorphic Container border glowing effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur opacity-50 dark:opacity-100"></div>
        <div className="relative rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <ResumeInput onSubmit={handleSubmit} isLoading={loading} />
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            <span className="font-bold mr-2">Error:</span>
            {error}
          </div>
        )}

        {results && (
          <div className="pt-4">
            <ResultsPanel data={results} />
          </div>
        )}
      </div>
    </main>
  );
}
