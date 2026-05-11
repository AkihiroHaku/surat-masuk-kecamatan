import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { decrypt, encrypt, type SessionPayload } from "@/lib/auth/token";

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const store = await cookies();
  store.set("sipersum_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete("sipersum_session");
}

export const getSession = cache(async () => {
  const token = (await cookies()).get("sipersum_session")?.value;
  if (!token) return null;
  return decrypt(token);
});
