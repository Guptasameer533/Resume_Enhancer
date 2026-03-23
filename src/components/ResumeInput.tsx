"use client";

import { useState } from "react";

interface ResumeInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function ResumeInput({ onSubmit, isLoading }: ResumeInputProps) {
  const [value, setValue] = useState("");

  const isEmpty = value.trim().length === 0;
  const isDisabled = isLoading || isEmpty;

  return (
    <div className="flex flex-col gap-3">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste your resume here..."
        disabled={isLoading}
        className="w-full rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-slate-200 placeholder:text-slate-500 resize-y focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-colors disabled:opacity-50"
        style={{ minHeight: "300px" }}
      />

      {/* Character count */}
      <p className="text-xs text-slate-500 text-right">
        {value.length.toLocaleString()} characters
      </p>

      {/* Submit button */}
      <button
        onClick={() => onSubmit(value)}
        disabled={isDisabled}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {isLoading ? "Enhancing…" : "Enhance My Resume"}
      </button>
    </div>
  );
}
