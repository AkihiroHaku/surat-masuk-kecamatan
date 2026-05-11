import { NextResponse } from "next/server";
import { extractLetterInsight } from "@/services/ai";
import { verifySession } from "@/services/users";

export async function POST(request: Request) {
  await verifySession("admin");

  const contentType = request.headers.get("content-type") ?? "";
  let text = "";

  if (contentType.includes("application/json")) {
    // ── Path 1: Teks dikirim dari frontend (hasil Tesseract image OCR) ──
    const body = await request.json() as { text?: string };
    text = body.text ?? "";
  } else if (contentType.includes("multipart/form-data")) {
    // ── Path 2: File PDF dikirim dari frontend, ekstraksi teks di server ──
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File PDF tidak ditemukan dalam request." },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Hanya file PDF yang didukung pada jalur ini." },
        { status: 400 },
      );
    }

    // Ekstrak teks dari PDF menggunakan pdf-parse v2
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // pdf-parse v2.x mengekspor class PDFParse, bukan fungsi langsung
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require("pdf-parse") as {
        PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
      };

      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text ?? "";
    } catch (err) {
      console.error("PDF parse error:", err);
      return NextResponse.json(
        { message: "Gagal mengekstrak teks dari PDF. Pastikan PDF tidak terpassword." },
        { status: 422 },
      );
    }
  } else {
    return NextResponse.json(
      { message: "Content-Type tidak didukung." },
      { status: 415 },
    );
  }

  if (!text || text.trim().length < 5) {
    return NextResponse.json(
      { message: "Teks tidak ditemukan atau terlalu pendek untuk dianalisis." },
      { status: 400 },
    );
  }

  const ai = await extractLetterInsight(text);

  return NextResponse.json({
    data: {
      extractedText: text,
      provider: "gemini",
      warnings: [],
      fields: ai,
    },
  });
}
