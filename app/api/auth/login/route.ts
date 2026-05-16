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

  console.log(`[AUTH DEBUG] Attempting login for email: ${parsed.data.email}`);
  console.log(`[AUTH DEBUG] Auth Provider: Local/Mock`);

  if (!user) {
    console.log(`[AUTH DEBUG] 401 Unauthorized: User not found in mock data.`);
    return NextResponse.json(
      { message: "Email atau kata sandi tidak sesuai." },
      { status: 401 },
    );
  }

  const passwordMatch = await compare(parsed.data.password, user.password_hash);
  
  if (!passwordMatch) {
    console.log(`[AUTH DEBUG] 401 Unauthorized: Password mismatch for ${user.email}.`);
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

  console.log(`[AUTH DEBUG] Login successful for: ${user.email} (Role: ${user.role})`);
  return NextResponse.json({ ok: true });
}
