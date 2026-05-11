import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { LetterRowActions } from "@/features/letters/letter-row-actions";
import { LettersPrintButton } from "@/features/letters/letters-print-button";
import { formatDate } from "@/lib/utils";
import { listLettersWithUsers } from "@/services/letters";

export async function LettersPageView({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "";
  const category =
    typeof searchParams?.category === "string" ? searchParams.category : "";

  const letters = await listLettersWithUsers({
    query: query || undefined,
    status: status || undefined,
    category: category || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Data Surat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pusat database surat masuk kecamatan untuk pencarian, pembaruan data, dan arsip digital.
          </p>
        </div>
        <Link href="/tambah-surat">
          <Button>Tambah Surat</Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,auto]">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Cari nomor surat, pengirim, instansi, atau perihal"
          />
          <Select name="status" defaultValue={status}>
            <option value="">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </Select>
          <Select name="category" defaultValue={category}>
            <option value="">Semua Kategori</option>
            <option value="Undangan">Undangan</option>
            <option value="Permohonan">Permohonan</option>
            <option value="Pemberitahuan">Pemberitahuan</option>
            <option value="Dinas">Dinas</option>
            <option value="Internal">Internal</option>
          </Select>
          <div className="flex gap-2">
            <Button type="submit">Filter</Button>
            <Link href="/data-surat">
              <Button type="button" variant="outline">
                Reset
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {/* Hanya wrapper tabel yang bisa scroll horizontal — bukan seluruh halaman */}
      <Card className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1400px]">
            <Table>
              <thead className="bg-muted/40">
                <tr>
                  <TableHead>Nomor Agenda</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Pengirim</TableHead>
                  <TableHead>Instansi</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Tgl Surat</TableHead>
                  <TableHead>Tgl Diterima</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Input</TableHead>
                  <TableHead>Aksi</TableHead>
                </tr>
              </thead>
              <tbody>
                {letters.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link href={`/data-surat/${item.id}`}>{item.nomor_agenda}</Link>
                    </TableCell>
                    <TableCell>{item.nomor_surat}</TableCell>
                    <TableCell>{item.pengirim}</TableCell>
                    <TableCell>{item.instansi_pengirim}</TableCell>
                    <TableCell className="max-w-72">{item.perihal}</TableCell>
                    <TableCell>{formatDate(item.tanggal_surat)}</TableCell>
                    <TableCell>{formatDate(item.tanggal_diterima)}</TableCell>
                    <TableCell>
                      <Badge variant="neutral">{item.kategori}</Badge>
                    </TableCell>
                    <TableCell>{item.prioritas}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{item.admin_input}</TableCell>
                    <TableCell>
                      <LetterRowActions
                        id={item.id}
                        fileUrl={item.file_url}
                        currentStatus={item.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>

      <Card className="flex items-center justify-between p-4">
        <p className="text-sm text-muted-foreground">
          Total data tampil:{" "}
          <span className="font-semibold text-foreground">{letters.length}</span>
        </p>
        <LettersPrintButton
          letters={letters}
          activeFilters={{ query, status, category }}
        />
      </Card>
    </div>
  );
}
