import { EditLetterPageView } from "@/features/letters/edit-letter-page-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSuratPage({ params }: PageProps) {
  const { id } = await params;
  return <EditLetterPageView id={id} />;
}
