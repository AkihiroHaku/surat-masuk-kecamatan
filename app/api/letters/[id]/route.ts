import { NextRequest, NextResponse } from "next/server";
import { deleteLetter, getLetterById, updateLetter } from "@/services/letters";
import { verifySession } from "@/services/users";
import { suratFormSchema } from "@/validators/surat";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteProps) {
  await verifySession();
  const { id } = await params;
  const item = await getLetterById(id);

  if (!item) {
    return NextResponse.json(
      { message: "Surat tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: item });
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  await verifySession("admin");
  const { id } = await params;
  const body = await request.json();
  const parsed = suratFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data surat tidak valid.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await updateLetter(id, parsed.data);
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteProps) {
  await verifySession("admin");
  const { id } = await params;
  await deleteLetter(id);
  return NextResponse.json({ ok: true });
}
