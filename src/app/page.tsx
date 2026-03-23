import type { Metadata } from "next";
import ResumeForm from "@/components/ResumeForm";

export const metadata: Metadata = {
  title: "AI Resume Enhancer — Powered by Groq",
  description:
    "Paste or upload your resume and get instant AI-powered suggestions to improve language, structure, impact, and ATS-friendliness.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            ✨ Powered by Groq · llama-3.1-70b
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Resume Enhancer
          </h1>
          <p className="mt-3 text-base text-slate-400">
            Paste or upload your resume. Get section-by-section AI feedback
            in seconds — covering language, structure, impact&nbsp;&amp;&nbsp;ATS score.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <ResumeForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your resume is not stored. Analysis happens in real-time.
        </p>
      </div>
    </main>
  );
}
