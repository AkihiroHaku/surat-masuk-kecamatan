export type UserRole = "admin" | "sekcam" | "camat";
export type LetterStatus = "Baru" | "Diproses" | "Selesai";
export type LetterCategory =
  | "Undangan"
  | "Permohonan"
  | "Pemberitahuan"
  | "Dinas"
  | "Internal";
export type LetterPriority = "Normal" | "Penting" | "Sangat Penting";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AppUser = SessionUser & {
  username: string;
  password_hash: string;
  created_at: string;
};

export type Letter = {
  id: string;
  nomor_agenda: string;
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
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FollowUpLog = {
  id: string;
  surat_id: string;
  from_user: string;
  to_user: string;
  note: string;
  created_at: string;
  status: LetterStatus;
};

export type LetterSummary = Letter & {
  admin_input: string;
};
