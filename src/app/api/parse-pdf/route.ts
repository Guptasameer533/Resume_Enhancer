export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdfParser";

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

    // Use our proven Stage 2 extractor which correctly handles Turbopack dynamic imports
    const text = await extractTextFromPdf(buffer);

    return NextResponse.json({ text }, { status: 200 });
  } catch (err) {
    console.error("[/api/parse-pdf] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "Could not extract text from PDF: " + (err as Error).message },
      { status: 500 }
    );
  }
}
