import { notFound } from "next/navigation";
import { LetterForm } from "@/features/letters/letter-form";
import { getLetterById } from "@/services/letters";

export async function EditLetterPageView({ id }: { id: string }) {
  const letter = await getLetterById(id);
  if (!letter) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Edit Data Surat</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Perbarui metadata surat, status, dan berkas arsip sesuai kebutuhan admin.
        </p>
      </div>
      <LetterForm
        mode="edit"
        letterId={id}
        initialValues={{
          nomor_surat: letter.nomor_surat,
          tanggal_surat: letter.tanggal_surat,
          tanggal_diterima: letter.tanggal_diterima,
          pengirim: letter.pengirim,
          instansi_pengirim: letter.instansi_pengirim,
          perihal: letter.perihal,
          kategori: letter.kategori,
          prioritas: letter.prioritas,
          status: letter.status,
          ringkasan_ai: letter.ringkasan_ai,
          rekomendasi_ai: letter.rekomendasi_ai,
          disposisi: letter.disposisi,
          file_url: letter.file_url,
          file_name: letter.file_name,
          ocr_text: letter.ocr_text,
        }}
      />
    </div>
  );
}
