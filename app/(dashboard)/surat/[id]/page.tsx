import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SuratDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/data-surat/${id}`);
}
