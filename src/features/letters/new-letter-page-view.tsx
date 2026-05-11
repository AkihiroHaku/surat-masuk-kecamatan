import { LetterForm } from "@/features/letters/letter-form";

export function NewLetterPageView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tambah Surat</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Upload scan surat, baca otomatis dengan OCR + AI, lalu simpan ke database surat masuk kecamatan.
        </p>
      </div>
      <LetterForm mode="create" />
    </div>
  );
}
