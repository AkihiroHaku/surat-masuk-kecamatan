# SIPERSUM

SIPERSUM adalah sistem informasi pengelolaan surat masuk berbasis Next.js 15 untuk lingkungan kecamatan. Fokus utamanya adalah mempercepat input surat melalui OCR, AI parsing, arsip digital, tindak lanjut, dan laporan surat masuk dalam antarmuka modern yang mudah dipakai admin kantor.

## Fitur Utama

- Login internal dengan role `admin`, `sekcam`, dan `camat`
- Beranda ringkas dengan statistik surat masuk
- Smart input surat: upload file, OCR, auto-fill AI, review, lalu simpan
- CRUD data surat dan halaman detail tindak lanjut
- Arsip digital siap dihubungkan ke Supabase Storage
- Export laporan ke PDF dan Excel
- Supabase-ready schema, upload service, dan persistence lokal
- Fallback mock mode untuk pengembangan lokal tanpa env

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- Supabase
- React Hook Form + Zod
- OCR: `tesseract.js` + `pdf-parse`
- AI parsing: OpenAI Responses API
- SweetAlert2, jsPDF, xlsx, React Icons

## Struktur

```text
app/
src/
  components/
  data/
  features/
  lib/
  services/
  types/
  validators/
supabase/schema.sql
```

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Salin env:

```bash
cp .env.example .env.local
```

3. Jalankan development server:

```bash
npm run dev
```

4. Login demo:

- `admin@sipersum.local / admin123`
- `sekcam@sipersum.local / sekcam123`
- `camat@sipersum.local / camat123`

## Catatan Integrasi

- Jika variabel Supabase diisi, aplikasi akan menggunakan tabel `users`, `surat_masuk`, dan `tindak_lanjut_logs`.
- Jika `OPENAI_API_KEY` tersedia, route `POST /api/ingestion` akan memakai AI parsing. Jika tidak, sistem memakai heuristic parser.
- Jika Supabase belum diisi, data surat dan tindak lanjut tetap tersimpan lokal di folder `storage/`.
- PDF berbasis teks akan diekstrak dengan `pdf-parse`. Untuk PDF scan murni, rekomendasi terbaik adalah upload JPG/PNG atau menambah OCR berbasis cloud.
