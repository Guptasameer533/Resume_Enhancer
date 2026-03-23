"use client";

import { useState, useRef } from "react";

interface ResumeInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function ResumeInput({ onSubmit, isLoading }: ResumeInputProps) {
  const [value, setValue] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmpty = value.trim().length === 0;
  const isEnhanceDisabled = isLoading || isExtracting || isEmpty;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a valid PDF file.");
      return;
    }

    setPdfError(null);
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setPdfError(data.error || "Could not extract PDF text");
      } else {
        setValue(data.text);
      }
    } catch (err) {
      setPdfError("Network error checking PDF.");
    } finally {
      setIsExtracting(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload button mapping */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Resume Content</label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfUpload}
          disabled={isLoading || isExtracting}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isExtracting}
          className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {isExtracting ? (
            <>
              <svg className="animate-spin h-3 w-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Extracting text...
            </>
          ) : (
            <>
              📄 Upload PDF
            </>
          )}
        </button>
      </div>

      {pdfError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {pdfError}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste your resume here..."
        disabled={isLoading || isExtracting}
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
        disabled={isEnhanceDisabled}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 text-sm font-semibold transition-colors mt-2"
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {isLoading ? "Enhancing…" : "Enhance My Resume"}
      </button>
    </div>
  );
}
