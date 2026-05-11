"use client";

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { LetterSummary } from "@/types";

export function ReportsPageView({ letters }: { letters: LetterSummary[] }) {
  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Surat Masuk SIPERSUM", 14, 20);
    letters.forEach((item, index) => {
      doc.setFontSize(10);
      doc.text(
        `${index + 1}. ${item.nomor_surat} | ${item.pengirim} | ${item.perihal}`,
        14,
        36 + index * 10,
      );
    });
    doc.save("laporan-surat-masuk.pdf");
  }

  function exportExcel() {
    const sheet = XLSX.utils.json_to_sheet(
      letters.map((item) => ({
        nomor_agenda: item.nomor_agenda,
        nomor_surat: item.nomor_surat,
        tanggal_diterima: item.tanggal_diterima,
        pengirim: item.pengirim,
        perihal: item.perihal,
        kategori: item.kategori,
        prioritas: item.prioritas,
        status: item.status,
        admin_input: item.admin_input,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Laporan");
    XLSX.writeFile(workbook, "laporan-surat-masuk.xlsx");
  }

  async function printReport() {
    await Swal.fire({
      icon: "info",
      title: "Cetak laporan",
      text: "Gunakan browser print setelah PDF terbuka untuk hasil terbaik.",
      confirmButtonColor: "#2563eb",
    });
    exportPdf();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Laporan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buat ringkasan surat masuk harian, bulanan, atau tahunan lalu ekspor ke PDF atau Excel.
        </p>
      </div>
      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={exportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button type="button" variant="outline" onClick={exportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button type="button" variant="ghost" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print Laporan
          </Button>
        </div>
        <div className="mt-6 space-y-3">
          {letters.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <p className="font-semibold">{item.perihal}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.nomor_surat} • {item.pengirim} • {formatDate(item.tanggal_diterima)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
