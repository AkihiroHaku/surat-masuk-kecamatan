"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LetterStatus } from "@/types";

export function FollowUpForm({ suratId }: { suratId: string }) {
  const router = useRouter();
  const [toUser, setToUser] = useState("Kasi Pemerintahan");
  const [status, setStatus] = useState<LetterStatus>("Diproses");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/letters/${suratId}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_user: toUser,
          status,
          note,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      await Swal.fire({
        icon: "success",
        title: "Tindak lanjut tersimpan",
        text: "Catatan tindak lanjut berhasil dicatat.",
        confirmButtonColor: "#2563eb",
      });

      setNote("");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error instanceof Error ? error.message : "Terjadi kesalahan.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Diteruskan kepada</label>
          <Input value={toUser} onChange={(event) => setToUser(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status proses</label>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as LetterStatus)}
          >
            <option value="Baru">Baru</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Catatan tindak lanjut</label>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Contoh: Kepada Kasi Pemerintahan untuk diproses dan dilaporkan kembali."
        />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving} type="submit">
          {saving ? "Menyimpan..." : "Simpan Tindak Lanjut"}
        </Button>
      </div>
    </form>
  );
}
