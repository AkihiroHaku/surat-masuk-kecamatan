"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { LetterStatus } from "@/types";

export function LetterRowActions({
  id,
  fileUrl,
  currentStatus,
}: {
  id: string;
  fileUrl: string;
  currentStatus: LetterStatus;
}) {
  const router = useRouter();

  async function handleDelete() {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus surat?",
      text: "Data surat yang dihapus tidak bisa dikembalikan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    const response = await fetch(`/api/letters/${id}`, { method: "DELETE" });
    if (!response.ok) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: "Data surat belum berhasil dihapus.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    router.refresh();
  }

  async function handleStatusChange(nextStatus: string) {
    const response = await fetch(`/api/letters/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      await Swal.fire({
        icon: "error",
        title: "Status gagal diperbarui",
        text: "Silakan coba lagi.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        className="h-9 w-[132px] text-xs"
        defaultValue={currentStatus}
        onChange={(event) => void handleStatusChange(event.target.value)}
      >
        <option value="Baru">Baru</option>
        <option value="Diproses">Diproses</option>
        <option value="Selesai">Selesai</option>
      </Select>
      <Link href={`/data-surat/${id}`}>
        <Button size="sm" variant="outline">
          Detail
        </Button>
      </Link>
      <Link href={`/data-surat/${id}/edit`}>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </Link>
      <a href={fileUrl} target="_blank" rel="noreferrer">
        <Button size="sm" variant="ghost">
          Preview
        </Button>
      </a>
      <a href={fileUrl} download>
        <Button size="sm" variant="ghost">
          Unduh
        </Button>
      </a>
      <Button size="sm" variant="danger" onClick={() => void handleDelete()} type="button">
        Hapus
      </Button>
    </div>
  );
}
