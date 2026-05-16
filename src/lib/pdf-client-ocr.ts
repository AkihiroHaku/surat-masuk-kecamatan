import Tesseract from "tesseract.js";
import { getDocument } from "pdfjs-dist/webpack.mjs";

const PDF_OCR_SCALE = 1.8;
const PDF_OCR_MAX_PAGES = 3;

type ProgressHandler = (message: string) => void;

export async function extractTextFromPdfWithOcr(
  file: File,
  onProgress?: ProgressHandler,
) {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const processedPages = Math.min(totalPages, PDF_OCR_MAX_PAGES);
  const chunks: string[] = [];

  for (let pageNumber = 1; pageNumber <= processedPages; pageNumber += 1) {
    onProgress?.(`Menyiapkan halaman ${pageNumber} dari ${processedPages}...`);

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: PDF_OCR_SCALE });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Canvas OCR tidak dapat dijalankan di browser ini.");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    onProgress?.(`Menjalankan OCR halaman ${pageNumber} dari ${processedPages}...`);

    const result = await Tesseract.recognize(canvas, "ind+eng");
    const text = result.data.text.trim();

    if (text) {
      chunks.push(text);
    }

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  await loadingTask.destroy();

  return {
    text: chunks.join("\n\n").trim(),
    processedPages,
    totalPages,
    truncated: totalPages > processedPages,
  };
}
