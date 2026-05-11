"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Swal from "sweetalert2";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (!response.ok) {
      await Swal.fire({
        icon: "error",
        title: "Logout gagal",
        text: "Sesi belum berhasil ditutup.",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
      onClick={handleLogout}
      type="button"
    >
      <LogOut className="h-4 w-4 text-primary" />
      Keluar
    </button>
  );
}
