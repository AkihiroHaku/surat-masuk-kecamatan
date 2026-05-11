import { NextResponse } from "next/server";
import { verifySession } from "@/services/users";
import { storeLetterFile } from "@/services/storage";

export async function POST(request: Request) {
  await verifySession("admin");
  const formData = await request.formData();
  const file = formData.get("file");
  const nomorSurat = String(formData.get("nomor_surat") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "File surat wajib dipilih." },
      { status: 400 },
    );
  }

  const stored = await storeLetterFile(file, nomorSurat);
  return NextResponse.json({ data: stored }, { status: 201 });
}
