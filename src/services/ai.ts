import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import type { LetterCategory, LetterPriority, LetterStatus } from "@/types";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

type ParsedInsight = {
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  pengirim: string;
  instansi_pengirim: string;
  perihal: string;
  kategori: LetterCategory;
  prioritas: LetterPriority;
  status: LetterStatus;
  ringkasan_ai: string;
  rekomendasi_ai: string;
  disposisi: string;
  file_url: string;
  file_name: string;
  ocr_text: string;
};

function heuristics(text: string): ParsedInsight {
  const normalized = text.replace(/\s+/g, " ").trim();
  const nomorMatch = normalized.match(/nomor[:\s]+([A-Za-z0-9./-]+)/i);
  const perihalMatch = normalized.match(
    /perihal[:\s]+(.+?)(?=kepada|dengan|$)/i,
  );
  const sender = normalized.match(
    /(dinas|kantor|forum|kecamatan|kelurahan)[^.,\n]*/i,
  )?.[0];

  const kategori: LetterCategory = /undangan/i.test(normalized)
    ? "Undangan"
    : /permohonan/i.test(normalized)
      ? "Permohonan"
      : /pemberitahuan/i.test(normalized)
        ? "Pemberitahuan"
        : /internal/i.test(normalized)
          ? "Internal"
          : "Dinas";

  const prioritas: LetterPriority = /sangat penting|segera|urgent/i.test(
    normalized,
  )
    ? "Sangat Penting"
    : /penting/i.test(normalized)
      ? "Penting"
      : "Normal";

  return {
    nomor_surat: nomorMatch?.[1] ?? "-",
    tanggal_surat: new Date().toISOString().slice(0, 10),
    tanggal_diterima: new Date().toISOString().slice(0, 10),
    pengirim: sender ?? "Belum terdeteksi",
    instansi_pengirim: sender ?? "Belum terdeteksi",
    perihal: perihalMatch?.[1]?.trim() ?? "Perlu review admin",
    kategori,
    prioritas,
    status: "Baru",
    ringkasan_ai:
      normalized.slice(0, 220) ||
      "Konten surat belum terdeteksi sepenuhnya, mohon review manual.",
    rekomendasi_ai:
      "Lakukan validasi manual pada field penting lalu disposisikan ke seksi terkait.",
    disposisi: "Kepada unit terkait untuk ditelaah dan ditindaklanjuti.",
    file_url: "",
    file_name: "",
    ocr_text: normalized,
  };
}

export async function extractLetterInsight(text: string): Promise<ParsedInsight> {
  if (!text.trim()) {
    return heuristics(text);
  }

  // Jika Gemini API key tidak ada, gunakan heuristik saja
  if (!env.geminiApiKey) {
    console.warn("GEMINI_API_KEY tidak ditemukan, menggunakan heuristik.");
    return heuristics(text);
  }

  try {
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
${text.slice(0, 12000)}

KELUARKAN HANYA JSON VALID. TIDAK ADA TEKS LAIN.
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();

    // Bersihkan jika model mengembalikan markdown code block
    output = output
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(output) as Partial<ParsedInsight>;

    // Merge dengan heuristik sebagai fallback per-field
    const base = heuristics(text);
    return {
      nomor_surat: parsed.nomor_surat || base.nomor_surat,
      tanggal_surat: parsed.tanggal_surat || base.tanggal_surat,
      tanggal_diterima: parsed.tanggal_diterima || base.tanggal_diterima,
      pengirim: parsed.pengirim || base.pengirim,
      instansi_pengirim: parsed.instansi_pengirim || base.instansi_pengirim,
      perihal: parsed.perihal || base.perihal,
      kategori: parsed.kategori || base.kategori,
      prioritas: parsed.prioritas || base.prioritas,
      status: "Baru",
      ringkasan_ai: parsed.ringkasan_ai || base.ringkasan_ai,
      rekomendasi_ai: parsed.rekomendasi_ai || base.rekomendasi_ai,
      disposisi: parsed.disposisi || base.disposisi,
      file_url: "",
      file_name: "",
      ocr_text: text,
    };
  } catch (err) {
    console.error("Gemini AI error:", err);
    return heuristics(text);
  }
}
