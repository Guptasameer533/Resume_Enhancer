export const runtime = "nodejs"; // Required for pdf-parse (uses node built-ins)

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Polyfill DOM APIs that pdf-parse implicitly expects but Next.js strips
    if (typeof global.DOMMatrix === "undefined") {
      (global as any).DOMMatrix = class DOMMatrix {};
    }
    if (typeof global.ImageData === "undefined") {
      (global as any).ImageData = class ImageData {};
    }

    // Dynamic import to avoid Turbopack DOMMatrix build errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("pdf-parse" as any);
    const pdfParse = typeof mod.default === "function" ? mod.default : mod;

    const data = await pdfParse(buffer);
    
    // Ensure text exists
    if (!data.text || !data.text.trim()) {
       return NextResponse.json(
        { error: "Could not extract text. PDF might be empty or scanned." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: data.text }, { status: 200 });
  } catch (err) {
    console.error("[/api/parse-pdf] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "Could not extract text from PDF: " + (err as Error).message },
      { status: 500 }
    );
  }
}
