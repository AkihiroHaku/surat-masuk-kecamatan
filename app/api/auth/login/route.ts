import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/services/users";
import { loginSchema } from "@/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(parsed.data.email);

  if (!user || !(await compare(parsed.data.password, user.password_hash))) {
    return NextResponse.json(
      { message: "Email atau kata sandi tidak sesuai." },
      { status: 401 },
    );
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
