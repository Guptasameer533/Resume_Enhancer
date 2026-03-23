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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-3">
          Resume Enhancer
        </h1>
        <p className="text-slate-400">Powered by Groq AI</p>
      </div>

      <div className="space-y-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
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
