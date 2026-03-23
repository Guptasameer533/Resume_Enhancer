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
        <div className="space-y-6">
            {/* ── Input form ─────────────── */}
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Drag-and-drop PDF zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 px-6 transition-colors overflow-hidden ${dragOver
                            ? "border-slate-800 bg-slate-50 dark:border-white/50 dark:bg-white/10"
                            : "border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-white/5 hover:border-slate-400 dark:hover:border-white/40 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                >
                    <span className="text-3xl filter drop-shadow-sm opacity-80 mb-1">📄</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center relative z-10">
                        {fileName ? (
                            <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-800 dark:bg-white/20 dark:text-white rounded-full p-1 text-[10px] px-2 font-bold uppercase tracking-wider">Loaded</span> 
                                {fileName}
                            </span>
                        ) : (
                            <>Drag &amp; drop a PDF or <span className="text-slate-900 dark:text-white font-semibold underline decoration-slate-300 dark:decoration-white/30 underline-offset-4 hover:decoration-slate-500 transition-colors">click to browse</span></>
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

                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 my-1">
                    <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                    <span>or paste below</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                </div>

                {/* Textarea */}
                <div className="relative">
                    <textarea
                        id="resume-text"
                        value={resumeText}
                        onChange={(e) => {
                            setFileName(null);
                            setResumeText(e.target.value.slice(0, MAX_CHARS));
                        }}
                        placeholder="Paste your resume text here…"
                        rows={12}
                        className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] px-4 py-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-slate-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-sm"
                        aria-label="Resume text input"
                        disabled={isLoading}
                    />
                    <span
                        className={`absolute bottom-4 right-4 text-[10px] font-bold tracking-wide uppercase tabular-nums px-2 py-1 rounded bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400 ${charsLeft < 500 ? "text-red-600 dark:text-red-400" : ""
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
                    className="w-full rounded-xl bg-slate-900 dark:bg-white py-3 text-sm font-semibold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 overflow-hidden"
                >
                    <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-current opacity-70" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analysing Details…
                            </>
                        ) : "Enhance My Resume"}
                    </span>
                </button>
            </form>

            {/* ── Loading ─────────────────── */}
            {state.status === "loading" && <LoadingSpinner />}

            {/* ── Results ─────────────────── */}
            {state.status === "success" && (
                <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                    <ResultsPanel data={state.result as any} />
                </div>
            )}
        </div>
    );
}
