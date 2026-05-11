import { NextRequest, NextResponse } from "next/server";
import { createLetter, listLettersWithUsers } from "@/services/letters";
import { verifySession } from "@/services/users";
import { suratFormSchema } from "@/validators/surat";

export async function GET(request: NextRequest) {
  await verifySession();
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const letters = await listLettersWithUsers({ query, status, category });
  return NextResponse.json({ data: letters });
}

export async function POST(request: NextRequest) {
  const session = await verifySession("admin");
  const body = await request.json();
  const parsed = suratFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data surat tidak valid.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await createLetter(parsed.data, session.id);
  return NextResponse.json({ data: created }, { status: 201 });
}
