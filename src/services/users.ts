import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { mockUsers } from "@/data/mock";
import type { AppUser, SessionUser, UserRole } from "@/types";

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  return mockUsers.find((user) => user.email === email) ?? null;
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
  return mockUsers.map(({ password_hash: _passwordHash, ...user }) => user);
}

export function getUserNameById(userId: string) {
  return mockUsers.find((user) => user.id === userId)?.name ?? "Admin";
}
