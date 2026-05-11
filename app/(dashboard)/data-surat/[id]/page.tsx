import { LetterDetailPageView } from "@/features/letters/letter-detail-page-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetailSuratPage({ params }: PageProps) {
  const { id } = await params;
  return <LetterDetailPageView id={id} />;
}
