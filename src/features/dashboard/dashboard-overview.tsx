import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileSearch2,
  FolderArchive,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/utils";
import { getLetterStats, listLetters } from "@/services/letters";

export async function DashboardOverview() {
  const letters = await listLetters();
  const stats = await getLetterStats();

  const metrics = [
    {
      label: "Total Surat Masuk",
      value: stats.total,
      icon: Inbox,
      tone: "default" as const,
    },
    {
      label: "Surat Hari Ini",
      value: stats.today,
      icon: Clock3,
      tone: "warning" as const,
    },
    {
      label: "Surat Bulan Ini",
      value: stats.month,
      icon: FolderArchive,
      tone: "success" as const,
    },
    {
      label: "Belum Diproses",
      value: stats.pending,
      icon: FileSearch2,
      tone: "neutral" as const,
    },
    {
      label: "Surat Selesai",
      value: stats.completed,
      icon: CheckCircle2,
      tone: "success" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.6fr,1fr]">
        <Card className="overflow-hidden p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge>Kecamatan Kedungwuni</Badge>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold">
                Database surat masuk kecamatan yang rapi, mudah dicari, dan siap dipantau.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Admin cukup upload scan surat, sistem membaca isi surat, membantu isi data, lalu menyimpan arsip digital untuk tindak lanjut dan laporan.
              </p>
            </div>
            <Link href="/tambah-surat">
              <Button>
                Tambah Surat
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Aktivitas terbaru</p>
          <div className="mt-4 space-y-4">
            {letters.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.perihal}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.pengirim}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === "Selesai"
                        ? "success"
                        : item.status === "Diproses"
                          ? "warning"
                          : "default"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatDate(item.tanggal_diterima)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <Badge variant={tone}>{label}</Badge>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-6 font-display text-4xl font-semibold">
              {formatNumber(value)}
            </p>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Surat Terbaru</h2>
        </div>
        <div className="divide-y divide-border">
          {letters.map((item) => (
            <Link
              key={item.id}
              href={`/data-surat/${item.id}`}
              className="flex flex-col gap-2 px-6 py-4 transition hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">{item.perihal}</p>
                <p className="text-sm text-muted-foreground">
                  {item.nomor_surat} • {item.pengirim}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{item.kategori}</Badge>
                <Badge
                  variant={
                    item.status === "Selesai"
                      ? "success"
                      : item.status === "Diproses"
                        ? "warning"
                        : "default"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
