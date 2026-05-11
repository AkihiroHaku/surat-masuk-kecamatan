import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/token";

const protectedPrefixes = [
  "/dashboard",
  "/surat",
  "/laporan",
  "/beranda",
  "/tambah-surat",
  "/data-surat",
  "/tindak-lanjut",
  "/pengguna",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const cookie = request.cookies.get("sipersum_session")?.value;
  const session = cookie ? await decrypt(cookie) : null;

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/surat/:path*",
    "/laporan/:path*",
    "/beranda/:path*",
    "/tambah-surat/:path*",
    "/data-surat/:path*",
    "/tindak-lanjut/:path*",
    "/pengguna/:path*",
    "/login",
  ],
};
