"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { CheckCircle2, FileText, FileUp, Sparkles, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractTextFromPdfWithOcr } from "@/lib/pdf-client-ocr";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { suratFormSchema, type SuratFormValues } from "@/validators/surat";

const createDefaults: SuratFormValues = {
  nomor_surat: "",
  tanggal_surat: new Date().toISOString().slice(0, 10),
  tanggal_diterima: new Date().toISOString().slice(0, 10),
  pengirim: "",
  instansi_pengirim: "",
  perihal: "",
  kategori: "Dinas",
  prioritas: "Normal",
  status: "Baru",
  ringkasan_ai: "",
  rekomendasi_ai: "",
  disposisi: "Kepada unit terkait untuk ditindaklanjuti.",
  file_url: "",
  file_name: "",
  ocr_text: "",
};

export function LetterForm({
  mode,
  initialValues,
  letterId,
}: {
  mode: "create" | "edit";
  initialValues?: SuratFormValues;
  letterId?: string;
}) {
  const router = useRouter();
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialValues?.file_url ?? "");
  const [ocrInfo, setOcrInfo] = useState<string>(
    initialValues?.ocr_text
      ? "Data OCR sudah tersedia untuk surat ini."
      : "Belum ada file diproses.",
  );

  const defaults = {
    ...createDefaults,
    ...initialValues,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SuratFormValues>({
    resolver: zodResolver(suratFormSchema),
    defaultValues: defaults,
  });

  // ── File handler yang dipakai oleh klik maupun drag & drop ──────────────
  function handleFileChange(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setValue("file_name", selected.name);
  }

  // ── Drag & drop event handlers ────────────────────────────────────────────
  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    // Pastikan efek drop terlihat
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    // Hanya reset jika benar-benar keluar dari elemen (bukan ke child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (!dropped) return;

    // Validasi tipe file
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(dropped.type)) {
      void Swal.fire({
        icon: "warning",
        title: "Tipe file tidak didukung",
        text: "Hanya PDF, JPG, dan PNG yang diperbolehkan.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    handleFileChange(dropped);
    // Sync ke native input supaya form tetap valid
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      fileInputRef.current.files = dt.files;
    }
  }

  // ── Format ukuran file ────────────────────────────────────────────────────
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function uploadFile(selected: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selected);
      formData.append("nomor_surat", getValues("nomor_surat"));

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      setValue("file_url", result.data.fileUrl);
      setValue("file_name", result.data.fileName);
      setPreviewUrl(result.data.fileUrl);
      return result.data as { fileUrl: string; fileName: string };
    } finally {
      setUploading(false);
    }
  }

  function applyAutofillFields(
    fields: Partial<SuratFormValues>,
    extractedText: string,
    infoMessage: string,
  ) {
    (Object.keys(fields) as Array<keyof SuratFormValues>).forEach((key) => {
      if (key in fields) {
        setValue(key, (fields[key] as string) ?? "");
      }
    });

    setValue("ocr_text", extractedText);
    setOcrInfo(infoMessage);
  }

  async function runSmartAutofill() {
    if (!file) {
      await Swal.fire({
        icon: "warning",
        title: "File belum dipilih",
        text: "Unggah file surat terlebih dahulu.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setLoadingOCR(true);

    try {
      const isPdfFile = file.type === "application/pdf";
      let extractedText = "";

      if (isPdfFile) {
        // ── PDF: kirim file ke backend, ekstraksi teks dilakukan di server ──
        setOcrInfo("Mengekstrak teks dari PDF...");
        const formData = new FormData();
        formData.append("file", file);
        let parsedFromTextLayer = false;

        const ocrResponse = await fetch("/api/ingestion", {
          method: "POST",
          body: formData, // multipart/form-data, bukan JSON
        });

        const ocrResult = await ocrResponse.json();

        if (!ocrResponse.ok) {
          extractedText = "";
        } else if (ocrResult.data?.fields && ocrResult.data?.extractedText?.trim()) {
          applyAutofillFields(
            ocrResult.data.fields as Partial<SuratFormValues>,
            ocrResult.data.extractedText,
            "PDF berhasil dibaca dan dianalisis AI.",
          );
          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data surat berhasil diisi otomatis.",
            confirmButtonColor: "#2563eb",
          });
          return;
        } else {
          extractedText = ocrResult.data?.extractedText || "";
          parsedFromTextLayer = extractedText.trim().length >= 10;
        }

        if (!parsedFromTextLayer) {
          setOcrInfo("PDF scan terdeteksi. Menjalankan OCR halaman PDF...");
          const fallback = await extractTextFromPdfWithOcr(file, (message) => {
            setOcrInfo(message);
          });

          extractedText = fallback.text;

          if (fallback.truncated && extractedText.trim()) {
            setOcrInfo(
              `OCR selesai untuk ${fallback.processedPages} halaman pertama dari ${fallback.totalPages} halaman PDF.`,
            );
          }
        }
      } else {
        // ── Gambar (JPG/PNG): OCR di frontend pakai Tesseract ──
        setOcrInfo("Sedang membaca teks dari gambar (Tesseract OCR)...");
        const {
          data: { text },
        } = await Tesseract.recognize(file, "ind+eng");
        extractedText = text;
      }

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error(
          "Teks tidak berhasil dibaca dari file. Coba file dengan kualitas lebih baik.",
        );
      }

      // ── Kirim teks ke AI untuk parsing otomatis ──
      setOcrInfo("Menganalisis isi surat dengan AI...");
      const response = await fetch("/api/ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "AI gagal memproses teks");
      }

      applyAutofillFields(
        result.data.fields as Partial<SuratFormValues>,
        extractedText,
        "OCR + AI berhasil membaca dan mengisi data surat.",
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data surat berhasil diisi otomatis. Silakan review sebelum menyimpan.",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error("SmartAutofill error:", error);

      await Swal.fire({
        icon: "error",
        title: "Gagal membaca surat",
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat OCR atau AI.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoadingOCR(false);
    }
  }

  async function onSubmit(values: SuratFormValues) {
    setSaving(true);

    try {
      let payload = values;

      if (file) {
        const uploaded = await uploadFile(file);
        payload = {
          ...payload,
          file_url: uploaded.fileUrl,
          file_name: uploaded.fileName,
        };
      }

      const response = await fetch(
        mode === "create" ? "/api/letters" : `/api/letters/${letterId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      await Swal.fire({
        icon: "success",
        title: mode === "create" ? "Surat tersimpan" : "Perubahan tersimpan",
        text:
          mode === "create"
            ? "Surat berhasil masuk ke database surat."
            : "Data surat berhasil diperbarui.",
        confirmButtonColor: "#2563eb",
      });

      router.push(`/data-surat/${result.data.id}`);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan surat",
        text: error instanceof Error ? error.message : "Terjadi kesalahan.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  }

  // Cek tipe PDF: gunakan MIME type file lokal dulu, lalu fallback ke ekstensi URL
  // (blob: URL tidak mengandung ".pdf" sehingga cek ekstensi saja selalu gagal)
  const isPdf =
    file?.type === "application/pdf" ||
    previewUrl.toLowerCase().endsWith(".pdf") ||
    previewUrl.toLowerCase().includes(".pdf?");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,1.45fr]">
      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold">
          {mode === "create" ? "Upload Surat & Smart Input" : "Perbarui Berkas Surat"}
        </h2>
        {/* ── Drop Zone ─────────────────────────────────────────────────── */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={[
            "mt-5 rounded-[1.75rem] border-2 border-dashed transition-all duration-200",
            "select-none",
            file
              ? "cursor-default border-green-400/60 bg-green-50/60"
              : isDragging
                ? "cursor-copy border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]"
                : "cursor-pointer border-primary/20 bg-slate-50 hover:border-primary/50 hover:bg-primary/5",
          ].join(" ")}
        >
          {/* Hidden native file input */}
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {file ? (
            /* ── State: File sudah dipilih ── */
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-2xl bg-green-100 p-4 text-green-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-green-700">File siap diunggah</p>
                <p className="mt-1 max-w-xs truncate text-sm font-medium text-slate-700">
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(file.size)} &middot; {file.type.split("/")[1]?.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreviewUrl("");
                  setValue("file_name", "");
                  setValue("file_url", "");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                Hapus file
              </button>
            </div>
          ) : isDragging ? (
            /* ── State: Sedang drag di atas area ── */
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="animate-bounce rounded-2xl bg-primary/15 p-4 text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-primary">Lepaskan untuk mengunggah</p>
                <p className="mt-1 text-sm text-primary/70">File akan langsung dibaca</p>
              </div>
            </div>
          ) : (
            /* ── State: Default / idle ── */
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                <FileUp className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold">Seret file ke sini atau klik untuk memilih</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mendukung PDF, JPG, dan PNG &middot; Maks. 10 MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Pilih File Surat
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileText className="h-4 w-4 text-primary" />
            Preview berkas
          </div>
          {previewUrl ? (
            isPdf ? (
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                {/* <object> lebih reliable dari <iframe> untuk PDF di berbagai browser */}
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="h-96 w-full"
                  aria-label="Preview Surat PDF"
                >
                  {/* Fallback jika browser memblokir inline PDF */}
                  <div className="flex h-40 flex-col items-center justify-center gap-3 p-4 text-center">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Browser Anda tidak mendukung preview PDF inline.
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
                    >
                      Buka PDF di tab baru
                    </a>
                  </div>
                </object>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <img
                  src={previewUrl}
                  alt="Preview surat"
                  className="h-auto w-full object-contain"
                />
              </div>
            )
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Preview file akan tampil di sini setelah file dipilih.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
          {ocrInfo}
        </div>
        <Button
          className="mt-5 w-full"
          type="button"
          size="lg"
          onClick={() => void runSmartAutofill()}
          disabled={loadingOCR || uploading}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {loadingOCR ? "Memproses OCR + AI..." : "Baca Surat Otomatis"}
        </Button>
      </Card>

      <Card className="p-6">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nomor Surat" error={errors.nomor_surat?.message}>
              <Input {...register("nomor_surat")} />
            </Field>
            <Field label="Pengirim" error={errors.pengirim?.message}>
              <Input {...register("pengirim")} />
            </Field>
            <Field label="Tanggal Surat" error={errors.tanggal_surat?.message}>
              <Input {...register("tanggal_surat")} type="date" />
            </Field>
            <Field label="Tanggal Diterima" error={errors.tanggal_diterima?.message}>
              <Input {...register("tanggal_diterima")} type="date" />
            </Field>
            <Field label="Instansi Pengirim" error={errors.instansi_pengirim?.message}>
              <Input {...register("instansi_pengirim")} />
            </Field>
            <Field label="Status Surat" error={errors.status?.message}>
              <Select {...register("status")}>
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </Select>
            </Field>
            <Field label="Kategori" error={errors.kategori?.message}>
              <Select {...register("kategori")}>
                <option value="Undangan">Undangan</option>
                <option value="Permohonan">Permohonan</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="Dinas">Dinas</option>
                <option value="Internal">Internal</option>
              </Select>
            </Field>
            <Field label="Prioritas" error={errors.prioritas?.message}>
              <Select {...register("prioritas")}>
                <option value="Normal">Normal</option>
                <option value="Penting">Penting</option>
                <option value="Sangat Penting">Sangat Penting</option>
              </Select>
            </Field>
          </div>

          <Field label="Perihal" error={errors.perihal?.message}>
            <Input {...register("perihal")} />
          </Field>
          <Field label="Ringkasan AI" error={errors.ringkasan_ai?.message}>
            <Textarea {...register("ringkasan_ai")} />
          </Field>
          <Field
            label="Rekomendasi Tindak Lanjut"
            error={errors.rekomendasi_ai?.message}
          >
            <Textarea {...register("rekomendasi_ai")} />
          </Field>
          <Field label="Catatan Tindak Lanjut" error={errors.disposisi?.message}>
            <Textarea {...register("disposisi")} />
          </Field>
          <Field label="Hasil OCR" error={errors.ocr_text?.message}>
            <Textarea {...register("ocr_text")} />
          </Field>

          <input type="hidden" {...register("file_url")} />
          <input type="hidden" {...register("file_name")} />

          <div className="flex justify-end">
            <Button size="lg" type="submit" disabled={saving || uploading}>
              {saving
                ? "Menyimpan..."
                : mode === "create"
                  ? "Simpan Surat"
                  : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
