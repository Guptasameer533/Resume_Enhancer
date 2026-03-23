"use client";

import { useState, useRef, useCallback } from "react";
import type { EnhancementResult } from "@/types";
import ErrorBanner from "./ErrorBanner";
import LoadingSpinner from "./LoadingSpinner";
import ResultsPanel from "./ResultsPanel";

const MAX_CHARS = Number(process.env.NEXT_PUBLIC_MAX_RESUME_CHARS ?? 15000);

type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; result: EnhancementResult }
    | { status: "error"; message: string };

export default function ResumeForm() {
    const [resumeText, setResumeText] = useState("");
    const [state, setState] = useState<State>({ status: "idle" });
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── PDF handling ─────────────────────────────────────────────────────────
    const handleFile = useCallback((file: File) => {
        if (file.type !== "application/pdf") {
            setState({ status: "error", message: "Only PDF files are supported." });
            return;
        }
        setFileName(file.name);
        setResumeText("");
        submitForm(file);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const submitForm = useCallback(
        async (pdfFile?: File) => {
            if (debounceRef.current) return; // debounce guard
            debounceRef.current = setTimeout(() => {
                debounceRef.current = null;
            }, 3000);

            setState({ status: "loading" });

            try {
                let res: Response;
                if (pdfFile) {
                    const form = new FormData();
                    form.append("file", pdfFile);
                    res = await fetch("/api/enhance", { method: "POST", body: form });
                } else {
                    res = await fetch("/api/enhance", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ resumeText }),
                    });
                }

                const data = await res.json();
                if (!res.ok || data.error) {
                    setState({ status: "error", message: data.error ?? "Something went wrong." });
                    return;
                }
                setState({ status: "success", result: data.result });
            } catch {
                setState({ status: "error", message: "Network error. Please check your connection." });
            }
        },
        [resumeText]
    );

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeText.trim()) {
            setState({ status: "error", message: "Please paste your resume text or upload a PDF." });
            return;
        }
        submitForm();
    };

    const charsLeft = MAX_CHARS - resumeText.length;
    const isLoading = state.status === "loading";

    return (
        <div className="space-y-8">
            {/* ── Input form ─────────────── */}
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Drag-and-drop PDF zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed py-10 px-6 transition-all duration-300 overflow-hidden ${dragOver
                            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                            : "border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <span className="text-5xl filter drop-shadow-sm transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 ease-out">📄</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center relative z-10 mt-2">
                        {fileName ? (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full p-1 text-xs px-2">✓</span> 
                                {fileName}
                            </span>
                        ) : (
                            <>Drag &amp; drop a PDF or <br className="sm:hidden" /><span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-200 dark:decoration-indigo-400/30 underline-offset-4 hover:decoration-indigo-400 transition-all ml-1">click to browse</span></>
                        )}
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileChange}
                        id="pdf-upload"
                    />
                </div>

                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 my-2">
                    <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                    <span>or paste below</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                </div>

                {/* Textarea */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
                    <textarea
                        id="resume-text"
                        value={resumeText}
                        onChange={(e) => {
                            setFileName(null);
                            setResumeText(e.target.value.slice(0, MAX_CHARS));
                        }}
                        placeholder="Paste your resume text here…"
                        rows={12}
                        className="relative w-full resize-none rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 px-6 py-5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-sm"
                        aria-label="Resume text input"
                        disabled={isLoading}
                    />
                    <span
                        className={`absolute bottom-5 right-5 text-[10px] font-bold tracking-wide uppercase tabular-nums px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm border border-slate-100 dark:border-white/5 ${charsLeft < 500 ? "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-white/80 text-slate-500 dark:bg-black/40 dark:text-slate-400"
                            }`}
                    >
                        {charsLeft.toLocaleString()} left
                    </span>
                </div>

                {/* Error */}
                {state.status === "error" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ErrorBanner
                            message={state.message}
                            onDismiss={() => setState({ status: "idle" })}
                        />
                    </div>
                )}

                {/* Submit */}
                <button
                    id="enhance-btn"
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full rounded-[1.5rem] bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer pointer-events-none"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analysing Structure…
                            </>
                        ) : "✨ Enhance My Resume"}
                    </span>
                </button>
            </form>

            {/* ── Loading ─────────────────── */}
            {state.status === "loading" && <LoadingSpinner />}

            {/* ── Results ─────────────────── */}
            {state.status === "success" && <ResultsPanel data={state.result as any} />}
        </div>
    );
}
