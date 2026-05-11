"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LetterSummary } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTanggalIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function truncate(str: string, max: number): string {
  if (!str) return "-";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ── Main component ─────────────────────────────────────────────────────────
interface Props {
  letters: LetterSummary[];
  activeFilters?: { query?: string; status?: string; category?: string };
}

export function LettersPrintButton({ letters, activeFilters }: Props) {
  async function handlePrintPDF() {
    // Dynamic import agar tidak masuk ke server bundle
    const { jsPDF } = await import("jspdf");
    const { autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();   // 297 mm
    const pageH = doc.internal.pageSize.getHeight();  // 210 mm
    const marginX = 14;
    const now = new Date();
    const tanggalCetak = formatTanggalIndo(now.toISOString());

    // ── Fungsi header yang dipanggil di tiap halaman ──────────────────────
    function drawHeader(pageNumber: number) {
      // Background strip tipis di atas
      doc.setFillColor(37, 99, 235); // primary blue
      doc.rect(0, 0, pageW, 6, "F");

      // Nama instansi
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("KECAMATAN KEDUNGWUNI", marginX, 18);

      // Sub-instansi
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Kabupaten Pekalongan, Jawa Tengah", marginX, 23);

      // Judul laporan (kanan)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("LAPORAN DATA SURAT MASUK", pageW - marginX, 15, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tanggal Cetak: ${tanggalCetak}`, pageW - marginX, 20, { align: "right" });
      doc.text(`Hal. ${pageNumber}`, pageW - marginX, 25, { align: "right" });

      // Garis pembatas bawah header
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.line(marginX, 28, pageW - marginX, 28);

      // Info filter (opsional)
      let infoY = 32;
      const infoParts: string[] = [];
      if (activeFilters?.query) infoParts.push(`Pencarian: "${activeFilters.query}"`);
      if (activeFilters?.status) infoParts.push(`Status: ${activeFilters.status}`);
      if (activeFilters?.category) infoParts.push(`Kategori: ${activeFilters.category}`);

      if (infoParts.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Filter aktif: ${infoParts.join(" | ")}`, marginX, infoY);
        infoY += 5;
      }

      // Info total
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(`Total data: ${letters.length} surat`, marginX, infoY);
    }

    // ── Halaman pertama: gambar header ────────────────────────────────────
    drawHeader(1);

    // ── Tabel data ────────────────────────────────────────────────────────
    const tableStartY = (activeFilters?.query || activeFilters?.status || activeFilters?.category)
      ? 42
      : 38;

    const rows = letters.map((item, idx) => [
      String(idx + 1),
      truncate(item.nomor_surat, 24),
      truncate(item.pengirim, 20),
      truncate(item.instansi_pengirim, 22),
      truncate(item.perihal, 38),
      formatTanggalIndo(item.tanggal_surat),
      formatTanggalIndo(item.tanggal_diterima),
      item.kategori ?? "-",
      item.prioritas ?? "-",
      item.status ?? "-",
    ]);

    autoTable(doc, {
      startY: tableStartY,
      margin: { left: marginX, right: marginX },
      head: [[
        "No",
        "Nomor Surat",
        "Pengirim",
        "Instansi",
        "Perihal",
        "Tgl Surat",
        "Tgl Diterima",
        "Kategori",
        "Prioritas",
        "Status",
      ]],
      body: rows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
        valign: "middle",
        overflow: "linebreak",
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [241, 245, 249],   // slate-100
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],   // slate-50
      },
      columnStyles: {
        0:  { halign: "center", cellWidth: 8 },   // No
        1:  { cellWidth: 30 },                     // Nomor Surat
        2:  { cellWidth: 26 },                     // Pengirim
        3:  { cellWidth: 28 },                     // Instansi
        4:  { cellWidth: 46 },                     // Perihal (terlebar)
        5:  { halign: "center", cellWidth: 22 },   // Tgl Surat
        6:  { halign: "center", cellWidth: 22 },   // Tgl Diterima
        7:  { halign: "center", cellWidth: 18 },   // Kategori
        8:  { halign: "center", cellWidth: 18 },   // Prioritas
        9:  { halign: "center", cellWidth: 18 },   // Status
      },
      // Header ulang di tiap halaman + re-draw header instansi
      didDrawPage: (data) => {
        const pageNum = doc.getNumberOfPages();
        if (data.pageNumber > 1) {
          drawHeader(data.pageNumber);
        }
        // ── Footer di bawah setiap halaman ──────────────────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          `Dicetak oleh: Admin Kecamatan Kedungwuni  •  ${tanggalCetak}  •  SIPERSUM AI`,
          pageW / 2,
          pageH - 6,
          { align: "center" },
        );
        // Garis footer
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, pageH - 9, pageW - marginX, pageH - 9);
      },
    });

    // ── Simpan ────────────────────────────────────────────────────────────
    const timestamp = now.toISOString().slice(0, 10);
    doc.save(`laporan-surat-${timestamp}.pdf`);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handlePrintPDF()}
    >
      <Printer className="mr-2 h-4 w-4" />
      Cetak Data
    </Button>
  );
}
