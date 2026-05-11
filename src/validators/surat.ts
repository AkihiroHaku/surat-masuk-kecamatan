import { z } from "zod";

export const suratFormSchema = z.object({
  nomor_surat: z.string().min(3, "Nomor surat wajib diisi."),
  tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi."),
  tanggal_diterima: z.string().min(1, "Tanggal diterima wajib diisi."),
  pengirim: z.string().min(2, "Pengirim wajib diisi."),
  instansi_pengirim: z.string().min(2, "Instansi pengirim wajib diisi."),
  perihal: z.string().min(4, "Perihal wajib diisi."),
  kategori: z.enum([
    "Undangan",
    "Permohonan",
    "Pemberitahuan",
    "Dinas",
    "Internal",
  ]),
  prioritas: z.enum(["Normal", "Penting", "Sangat Penting"]),
  status: z.enum(["Baru", "Diproses", "Selesai"]),
  ringkasan_ai: z.string(),
  rekomendasi_ai: z.string(),
  disposisi: z.string().min(2, "Disposisi wajib diisi."),
  file_url: z.string(),
  file_name: z.string(),
  ocr_text: z.string(),
});

export type SuratFormValues = z.infer<typeof suratFormSchema>;
