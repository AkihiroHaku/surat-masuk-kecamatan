import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mockUsers } from "@/data/mock";
import type { AppUser, SessionUser, UserRole } from "@/types";

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return mockUsers.find((user) => user.email === email) ?? null;
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return (data as AppUser | null) ?? null;
}

export async function verifySession(role?: UserRole): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (role && session.role !== role) {
    redirect("/beranda");
  }

  return session;
}

export async function getCurrentUser() {
  return verifySession();
}

export async function listUsers() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return mockUsers.map(({ password_hash: _passwordHash, ...user }) => user);
  }

  const { data } = await supabase
    .from("users")
    .select("id, name, username, email, role, created_at")
    .order("created_at", { ascending: true });

  return data ?? [];
}

export function getUserNameById(userId: string) {
  return mockUsers.find((user) => user.id === userId)?.name ?? "Admin";
}
