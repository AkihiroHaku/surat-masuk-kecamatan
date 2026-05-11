import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FollowUpForm } from "@/features/letters/follow-up-form";
import { formatDate } from "@/lib/utils";
import { getFollowUpLogsByLetterId, getLetterById } from "@/services/letters";

export async function LetterDetailPageView({ id }: { id: string }) {
  const letter = await getLetterById(id);
  if (!letter) notFound();

  const logs = await getFollowUpLogsByLetterId(id);
  const isPdf = letter.file_url.toLowerCase().includes(".pdf");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{letter.nomor_agenda}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">{letter.perihal}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {letter.nomor_surat} • {letter.pengirim}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{letter.kategori}</Badge>
            <Badge
              variant={
                letter.status === "Selesai"
                  ? "success"
                  : letter.status === "Diproses"
                    ? "warning"
                    : "default"
              }
            >
              {letter.status}
            </Badge>
            <Link href={`/data-surat/${id}/edit`}>
              <Button size="sm" variant="outline">
                Edit Data
              </Button>
            </Link>
            <a href={letter.file_url} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost">
                Preview File
              </Button>
            </a>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Detail Surat</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["Nomor Surat", letter.nomor_surat],
              ["Pengirim", letter.pengirim],
              ["Instansi", letter.instansi_pengirim],
              ["Tanggal Surat", formatDate(letter.tanggal_surat)],
              ["Tanggal Diterima", formatDate(letter.tanggal_diterima)],
              ["Kategori", letter.kategori],
              ["Prioritas", letter.prioritas],
              ["Status", letter.status],
              ["Ringkasan AI", letter.ringkasan_ai],
              ["Rekomendasi Tindak Lanjut", letter.rekomendasi_ai],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-background/70 p-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-2 text-sm leading-6">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Preview File</h2>
          <div className="mt-5">
            {isPdf ? (
              <iframe
                src={letter.file_url}
                title="Preview Surat"
                className="h-[460px] w-full rounded-2xl border border-border bg-white"
              />
            ) : (
              <img
                src={letter.file_url}
                alt={letter.file_name}
                className="w-full rounded-2xl border border-border bg-white object-contain"
              />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Hasil OCR</h2>
          <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {letter.ocr_text || "Belum ada hasil OCR tersimpan."}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Tindak Lanjut Baru</h2>
          <div className="mt-5">
            <FollowUpForm suratId={id} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold">Riwayat Tindak Lanjut</h2>
        <div className="mt-5 space-y-4">
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              Belum ada catatan tindak lanjut untuk surat ini.
            </div>
          ) : null}
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-sm font-semibold">
                {log.from_user} → {log.to_user}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{log.note}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={
                    log.status === "Selesai"
                      ? "success"
                      : log.status === "Diproses"
                        ? "warning"
                        : "default"
                  }
                >
                  {log.status}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDate(log.created_at, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
