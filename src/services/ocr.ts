import "server-only";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";

export async function extractTextFromFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type.toLowerCase();
  const warnings: string[] = [];

  if (mimeType.includes("pdf")) {
    const parser = new PDFParse({ data: bytes });
    const parsed = await parser.getText().catch(() => null);

    if (parsed?.text?.trim()) {
      return {
        text: parsed.text.trim(),
        provider: "pdf-parse",
        warnings,
      };
    }

    warnings.push(
      "PDF scan belum memiliki layer teks. Coba unggah versi JPG/PNG untuk OCR Tesseract.",
    );
    return { text: "", provider: "pdf-parse", warnings };
  }

  const result = await Tesseract.recognize(bytes, "eng");
  return {
    text: result.data.text.trim(),
    provider: "tesseract.js",
    warnings,
  };
}
