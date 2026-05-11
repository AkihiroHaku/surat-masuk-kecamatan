import Link from "next/link";
import Image from "next/image";
import { Bell, FilePlus2, LayoutDashboard, Search, Users, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/layout/logout-button";
import type { SessionUser } from "@/types";

const navItems = [
  { href: "/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/tambah-surat", label: "Tambah Surat", icon: FilePlus2 },
  { href: "/data-surat", label: "Data Surat", icon: Search },
  { href: "/tindak-lanjut", label: "Tindak Lanjut", icon: Workflow },
  { href: "/laporan", label: "Laporan", icon: Bell },
  { href: "/pengguna", label: "Pengguna", icon: Users },
];

export async function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Sidebar: fixed, full-height, tidak ikut scroll horizontal ── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 lg:block">
        <Card className="flex h-full overflow-hidden bg-sidebar text-sidebar-foreground shadow-xl shadow-slate-200/70">
          <div className="flex w-full flex-col">
            <div className="border-b border-border bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Kecamatan Kedungwuni
              </p>
              <h1 className="mt-3 font-display text-2xl font-semibold">SIPERSUM</h1>
              <div className="mt-4 flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Image
                  src="/Coat_of_arms_of_Pekalongan_Regency.svg.png"
                  alt="Logo Kecamatan"
                  width={90}
                  height={90}
                  className="object-contain"
                />
              </div>
              {/* <p className="mt-2 text-sm leading-6 text-slate-600">
              Sistem informasi surat masuk modern dengan OCR, AI parsing, dan monitoring disposisi.
            </p> */}
            </div>
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t border-border px-4 pb-4 pt-3">
              <LogoutButton />
            </div>
          </div>
        </Card>
      </aside>

      {/* ── Main content: offset ke kanan sesuai lebar sidebar ── */}
      {/* overflow-x-hidden di sini memastikan main area tidak bisa scroll horizontal */}
      <div className="flex min-h-screen flex-col overflow-x-hidden lg:ml-72">
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <Card className="flex flex-col gap-4 border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
              <h2 className="font-display text-2xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                Role: <span className="font-semibold text-foreground">{user.role}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* <div className="hidden rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted-foreground md:block">
                Internal office intelligence workspace
              </div> */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                Sistem administrasi resmi kecamatan Kedungwuni
              </div>
            </div>
          </Card>
          {children}
        </main>
      </div>
    </div>
  );
}
