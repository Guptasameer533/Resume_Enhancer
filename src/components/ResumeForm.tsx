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
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Drag-and-drop PDF zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors ${dragOver
                            ? "border-indigo-400 bg-indigo-500/10"
                            : "border-white/15 bg-white/3 hover:border-indigo-500/50 hover:bg-white/5"
                        }`}
                >
                    <span className="text-2xl">📄</span>
                    <p className="text-sm text-slate-400">
                        {fileName ? (
                            <span className="text-indigo-300">✓ {fileName}</span>
                        ) : (
                            <>Drag &amp; drop a PDF or <span className="text-indigo-400 underline">click to browse</span></>
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

                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex-1 border-t border-white/10" />
                    or paste below
                    <div className="flex-1 border-t border-white/10" />
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
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                        aria-label="Resume text input"
                        disabled={isLoading}
                    />
                    <span
                        className={`absolute bottom-3 right-3 text-xs tabular-nums ${charsLeft < 500 ? "text-red-400" : "text-slate-600"
                            }`}
                    >
                        {charsLeft.toLocaleString()} chars left
                    </span>
                </div>

                {/* Error */}
                {state.status === "error" && (
                    <ErrorBanner
                        message={state.message}
                        onDismiss={() => setState({ status: "idle" })}
                    />
                )}

                {/* Submit */}
                <button
                    id="enhance-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    {isLoading ? "Analysing…" : "✨ Enhance My Resume"}
                </button>
            </form>

            {/* ── Loading ─────────────────── */}
            {state.status === "loading" && <LoadingSpinner />}

            {/* ── Results ─────────────────── */}
            {state.status === "success" && <ResultsPanel data={state.result as any} />}
        </div>
    );
}
