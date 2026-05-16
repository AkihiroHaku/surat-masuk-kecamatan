require("dotenv").config({ path: ".env.local" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAI() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
Kamu adalah AI untuk membaca surat resmi pemerintahan Indonesia.

ATURAN WAJIB:
- Output HANYA JSON valid, tidak ada teks lain sama sekali
- Jangan gunakan markdown atau code block
- Semua field harus ada di output
- Gunakan string kosong "" jika data tidak ditemukan (BUKAN null)
- Format tanggal: YYYY-MM-DD
- status selalu "Baru"
- file_url, file_name, ocr_text selalu string kosong ""

FORMAT JSON YANG HARUS DIKEMBALIKAN:
{
  "nomor_surat": "",
  "tanggal_surat": "",
  "tanggal_diterima": "",
  "pengirim": "",
  "instansi_pengirim": "",
  "perihal": "",
  "kategori": "Dinas",
  "prioritas": "Normal",
  "status": "Baru",
  "ringkasan_ai": "",
  "rekomendasi_ai": "",
  "disposisi": "",
  "file_url": "",
  "file_name": "",
  "ocr_text": ""
}

KETENTUAN KATEGORI:
- "Undangan" → ada kata mengundang/undangan
- "Permohonan" → meminta sesuatu
- "Pemberitahuan" → memberi informasi
- "Dinas" → surat resmi instansi pemerintah
- "Internal" → surat internal

KETENTUAN PRIORITAS:
- "Sangat Penting" → mendesak/segera/urgent
- "Penting" → perlu perhatian khusus
- "Normal" → surat biasa

TEKS SURAT:
Nomor: 123/456
Tanggal: 2026-05-15
Perihal: Undangan Rapat
Pengirim: Dinas Pendidikan

KELUARKAN HANYA JSON VALID. TIDAK ADA TEKS LAIN.
`;
  const result = await model.generateContent(prompt);
  let output = result.response.text();
  console.log("Raw output:", output);
  
  output = output
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();
  console.log("Parsed attempt:", JSON.parse(output));
}

testAI().catch(console.error);
