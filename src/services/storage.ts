import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

type StoredFile = {
  fileUrl: string;
  fileName: string;
};

export async function storeLetterFile(file: File, nomorSurat?: string): Promise<StoredFile> {
  const extension = file.name.split(".").pop() ?? "pdf";
  const baseName = slugify(nomorSurat || file.name.replace(/\.[^.]+$/, "")) || "surat-masuk";
  const fileName = `${baseName}-${Date.now()}.${extension}`;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const objectPath = `surat/${fileName}`;
    const { error } = await supabase.storage
      .from(env.storageBucket)
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(`Gagal upload file ke storage: ${error.message}`);
    }

    const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(objectPath);
    return {
      fileUrl: data.publicUrl,
      fileName,
    };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const fullPath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, bytes);

  return {
    fileUrl: `/uploads/${fileName}`,
    fileName,
  };
}
