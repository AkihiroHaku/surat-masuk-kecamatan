import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getFollowUpLogsByLetterId, listLetters } from "@/services/letters";

export async function FollowUpPageView() {
  const letters = await listLetters();
  const letterLogs = await Promise.all(
    letters.map(async (letter) => ({
      letter,
      logs: await getFollowUpLogsByLetterId(letter.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tindak Lanjut</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pantau arahan, catatan proses, dan perkembangan surat yang sedang ditangani.
        </p>
      </div>

      <div className="grid gap-4">
        {letterLogs.map(({ letter, logs }) => (
          <Card key={letter.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Link href={`/data-surat/${letter.id}`} className="font-semibold text-primary">
                  {letter.perihal}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {letter.nomor_surat} • {letter.pengirim}
                </p>
              </div>
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
            </div>
            <div className="mt-4 space-y-3">
              {logs.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                  Belum ada catatan tindak lanjut.
                </div>
              ) : null}
              {logs.slice(0, 3).map((log) => (
                <div key={log.id} className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold">
                    {log.from_user} → {log.to_user}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{log.note}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(log.created_at, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
