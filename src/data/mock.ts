import { hashSync } from "bcryptjs";
import type { AppUser, FollowUpLog, Letter } from "@/types";

export const mockUsers: AppUser[] = [
  {
    id: "usr-admin",
    name: "Admin Kecamatan",
    username: "admin",
    email: "admin@sipersum.local",
    password_hash: hashSync("admin123", 10),
    role: "admin",
    created_at: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "usr-pimpinan",
    name: "Sekcam Kecamatan",
    username: "sekcam",
    email: "sekcam@sipersum.local",
    password_hash: hashSync("sekcam123", 10),
    role: "sekcam",
    created_at: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "usr-camat",
    name: "Camat Kecamatan",
    username: "camat",
    email: "camat@sipersum.local",
    password_hash: hashSync("camat123", 10),
    role: "camat",
    created_at: "2026-01-01T08:00:00.000Z",
  },
];

export const mockLetters: Letter[] = [
  {
    id: "ltr-001",
    nomor_agenda: "AGD-2026-0001",
    nomor_surat: "420/Disdik/III/2026",
    tanggal_surat: "2026-04-20",
    tanggal_diterima: "2026-04-21",
    pengirim: "Dinas Pendidikan Kabupaten",
    instansi_pengirim: "Dinas Pendidikan",
    perihal: "Permohonan data sarana sekolah triwulan I",
    kategori: "Permohonan",
    prioritas: "Penting",
    status: "Diproses",
    ringkasan_ai:
      "Permohonan data sarana prasarana sekolah untuk kebutuhan laporan triwulan.",
    rekomendasi_ai:
      "Teruskan ke Kasi Pemerintahan dan minta rekap data sekolah paling lambat 3 hari kerja.",
    disposisi: "Kepada Kasi Pemerintahan untuk ditindaklanjuti.",
    file_url: "/mock/surat-disdik-001.pdf",
    file_name: "surat-disdik-001.pdf",
    ocr_text:
      "Nomor 420/Disdik/III/2026 perihal permohonan data sarana sekolah triwulan I.",
    created_by: "usr-admin",
    created_at: "2026-04-21T08:10:00.000Z",
    updated_at: "2026-04-21T08:10:00.000Z",
  },
  {
    id: "ltr-002",
    nomor_agenda: "AGD-2026-0002",
    nomor_surat: "005/UMKM/IV/2026",
    tanggal_surat: "2026-04-23",
    tanggal_diterima: "2026-04-24",
    pengirim: "Forum UMKM Kecamatan",
    instansi_pengirim: "Forum UMKM",
    perihal: "Undangan koordinasi pembinaan UMKM",
    kategori: "Undangan",
    prioritas: "Normal",
    status: "Baru",
    ringkasan_ai:
      "Undangan rapat koordinasi pembinaan UMKM tingkat kecamatan pada akhir April.",
    rekomendasi_ai:
      "Teruskan ke Seksi Perekonomian dan jadwalkan kehadiran pimpinan bila diperlukan.",
    disposisi: "Kepada Seksi Perekonomian untuk persiapan agenda.",
    file_url: "/mock/undangan-umkm-002.pdf",
    file_name: "undangan-umkm-002.pdf",
    ocr_text:
      "Nomor 005/UMKM/IV/2026 perihal undangan koordinasi pembinaan UMKM.",
    created_by: "usr-admin",
    created_at: "2026-04-24T07:30:00.000Z",
    updated_at: "2026-04-24T07:30:00.000Z",
  },
];

export const mockDisposisiLogs: FollowUpLog[] = [
  {
    id: "tdk-001",
    surat_id: "ltr-001",
    from_user: "Admin Kecamatan",
    to_user: "Kasi Pemerintahan",
    note: "Segera siapkan data pendukung untuk jawaban surat.",
    created_at: "2026-04-21T08:15:00.000Z",
    status: "Diproses",
  },
];
