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
    <main className="max-w-4xl mx-auto px-4 py-16 relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-slate-900 dark:text-white">
          Resume Enhancer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto font-medium">
          Professional ATS optimization, powerful rewriting suggestions, and instant PDF export.
        </p>
      </div>

      <div className="space-y-10">
        <div className="relative">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-6 shadow-sm">
            <ResumeInput onSubmit={handleSubmit} isLoading={loading} />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium">
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
