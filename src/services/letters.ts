import "server-only";
import { mockDisposisiLogs, mockLetters } from "@/data/mock";
import { readJsonFile, writeJsonFile } from "@/lib/local-db";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { FollowUpLog, Letter, LetterSummary, LetterStatus } from "@/types";
import type { SuratFormValues } from "@/validators/surat";

const LETTERS_FILE = "letters.json";
const FOLLOWUPS_FILE = "tindak-lanjut-logs.json";

async function readLettersLocal() {
  return readJsonFile<Letter[]>(LETTERS_FILE, mockLetters);
}

async function writeLettersLocal(items: Letter[]) {
  await writeJsonFile(LETTERS_FILE, items);
}

async function readFollowUpsLocal() {
  return readJsonFile<FollowUpLog[]>(FOLLOWUPS_FILE, mockDisposisiLogs);
}

async function writeFollowUpsLocal(items: FollowUpLog[]) {
  await writeJsonFile(FOLLOWUPS_FILE, items);
}

export async function listLetters(filters?: {
  query?: string;
  status?: string;
  category?: string;
}) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    let query = supabase
      .from("surat_masuk")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.query) {
      query = query.or(
        `nomor_surat.ilike.%${filters.query}%,pengirim.ilike.%${filters.query}%,perihal.ilike.%${filters.query}%`,
      );
    }
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.category) query = query.eq("kategori", filters.category);

    const { data } = await query;
    return (data as Letter[]) ?? [];
  }

  const letters = await readLettersLocal();

  return letters.filter((item) => {
    const matchesQuery = filters?.query
      ? [item.nomor_surat, item.pengirim, item.perihal, item.instansi_pengirim]
          .join(" ")
          .toLowerCase()
          .includes(filters.query.toLowerCase())
      : true;
    const matchesStatus = filters?.status ? item.status === filters.status : true;
    const matchesCategory = filters?.category
      ? item.kategori === filters.category
      : true;
    return matchesQuery && matchesStatus && matchesCategory;
  });
}

export async function getLetterById(id: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data } = await supabase
      .from("surat_masuk")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Letter | null) ?? null;
  }

  const letters = await readLettersLocal();
  return letters.find((item) => item.id === id) ?? null;
}

export async function createLetter(payload: SuratFormValues, userId: string) {
  const localLetters = await readLettersLocal();
  const now = new Date().toISOString();
  const generated: Letter = {
    id: crypto.randomUUID(),
    nomor_agenda: `AGD-${new Date().getFullYear()}-${String(localLetters.length + 1).padStart(4, "0")}`,
    ...payload,
    created_by: userId,
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("surat_masuk")
      .insert(generated)
      .select("*")
      .single();
    return data as Letter;
  }

  localLetters.unshift(generated);
  await writeLettersLocal(localLetters);
  return generated;
}

export async function updateLetter(id: string, payload: SuratFormValues) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data } = await supabase
      .from("surat_masuk")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    return data as Letter;
  }

  const letters = await readLettersLocal();
  const index = letters.findIndex((item) => item.id === id);
  if (index >= 0) {
    letters[index] = {
      ...letters[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    await writeLettersLocal(letters);
  }
  return letters[index];
}

export async function deleteLetter(id: string) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    await supabase.from("surat_masuk").delete().eq("id", id);
    return;
  }

  const letters = await readLettersLocal();
  const nextLetters = letters.filter((item) => item.id !== id);
  await writeLettersLocal(nextLetters);
}

export async function getFollowUpLogsByLetterId(
  suratId: string,
): Promise<FollowUpLog[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data } = await supabase
      .from("tindak_lanjut_logs")
      .select("*")
      .eq("surat_id", suratId)
      .order("created_at", { ascending: false });
    return (data as FollowUpLog[]) ?? [];
  }

  const logs = await readFollowUpsLocal();
  return logs.filter((item) => item.surat_id === suratId);
}

export async function addFollowUpLog(input: {
  suratId: string;
  fromUser: string;
  toUser: string;
  note: string;
  status: LetterStatus;
}) {
  const now = new Date().toISOString();
  const payload: FollowUpLog = {
    id: crypto.randomUUID(),
    surat_id: input.suratId,
    from_user: input.fromUser,
    to_user: input.toUser,
    note: input.note,
    created_at: now,
    status: input.status,
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("tindak_lanjut_logs")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as FollowUpLog;
  }

  const logs = await readFollowUpsLocal();
  logs.unshift(payload);
  await writeFollowUpsLocal(logs);
  return payload;
}

export async function updateLetterStatus(id: string, status: LetterStatus) {
  const letter = await getLetterById(id);
  if (!letter) {
    throw new Error("Surat tidak ditemukan.");
  }

  return updateLetter(id, {
    nomor_surat: letter.nomor_surat,
    tanggal_surat: letter.tanggal_surat,
    tanggal_diterima: letter.tanggal_diterima,
    pengirim: letter.pengirim,
    instansi_pengirim: letter.instansi_pengirim,
    perihal: letter.perihal,
    kategori: letter.kategori,
    prioritas: letter.prioritas,
    status,
    ringkasan_ai: letter.ringkasan_ai,
    rekomendasi_ai: letter.rekomendasi_ai,
    disposisi: letter.disposisi,
    file_url: letter.file_url,
    file_name: letter.file_name,
    ocr_text: letter.ocr_text,
  });
}

export async function listLettersWithUsers(filters?: {
  query?: string;
  status?: string;
  category?: string;
}) {
  const letters = await listLetters(filters);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data: users } = await supabase.from("users").select("id, name");
    const userMap = new Map((users ?? []).map((item) => [item.id, item.name]));
    return letters.map((item) => ({
      ...item,
      admin_input: userMap.get(item.created_by) ?? "Admin",
    })) as LetterSummary[];
  }

  const userMap = new Map([
    ["usr-admin", "Admin Kecamatan"],
    ["usr-pimpinan", "Sekcam Kecamatan"],
    ["usr-camat", "Camat Kecamatan"],
  ]);

  return letters.map((item) => ({
    ...item,
    admin_input: userMap.get(item.created_by) ?? "Admin",
  })) as LetterSummary[];
}

export async function getLetterStats() {
  const letters = await listLetters();
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7);

  return {
    total: letters.length,
    today: letters.filter((item) => item.tanggal_diterima === today).length,
    month: letters.filter((item) => item.tanggal_diterima.startsWith(monthPrefix))
      .length,
    pending: letters.filter((item) => item.status !== "Selesai").length,
    completed: letters.filter((item) => item.status === "Selesai").length,
  };
}
