import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    console.log(process.env.GEMINI_API_KEY);
    try {
        const { text } = await req.json();

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
Kamu adalah sistem AI untuk membaca dan menganalisis surat resmi pemerintahan Indonesia.

Tugas kamu adalah mengekstrak informasi penting dari teks surat berikut dan mengubahnya menjadi JSON VALID.

ATURAN WAJIB:
- Output HARUS berupa JSON valid
- Jangan tambahkan penjelasan apapun
- Gunakan null jika data tidak ditemukan
- Semua field wajib ada
- Format tanggal: YYYY-MM-DD

STRUKTUR JSON:

{
  "nomor_surat": string | null,
  "tanggal_surat": string | null,
  "pengirim": string | null,
  "instansi_pengirim": string | null,
  "perihal": string | null,
  "kategori": "Undangan" | "Permohonan" | "Pemberitahuan" | "Dinas" | "Internal" | null,
  "prioritas": "Normal" | "Penting" | "Sangat Penting" | null,
  "ringkasan": string | null,
  "rekomendasi": string | null
}

KETENTUAN:

- kategori:
  Undangan → jika ada kata mengundang
  Permohonan → jika meminta sesuatu
  Pemberitahuan → jika memberi informasi
  Dinas → surat resmi instansi
  Internal → surat internal

- prioritas:
  Sangat Penting → mendesak
  Penting → perlu perhatian
  Normal → biasa

- ringkasan:
  1-2 kalimat singkat

- rekomendasi:
  contoh:
  "Ditindaklanjuti oleh bagian terkait"

---

TEKS SURAT:
${text}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = response.text();

        let parsed;

        try {
            parsed = JSON.parse(output);
        } catch (err) {
            return Response.json({
                success: false,
                error: "Gagal parsing JSON dari AI",
                raw: output,
            });
        }

        return Response.json({
            success: true,
            data: parsed,
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: "Terjadi error di server",
        });
    }
}