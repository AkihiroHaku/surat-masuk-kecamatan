// Route ini tidak digunakan aktif — OCR image dilakukan di frontend via Tesseract.js
// dan OCR PDF dilakukan di /api/ingestion
// File ini ada agar Next.js tidak throw error "not a module"

export async function POST() {
  return Response.json({ message: "Gunakan /api/ingestion" }, { status: 308 });
}
