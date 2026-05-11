import { LettersPageView } from "@/features/letters/letters-page-view";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DataSuratPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <LettersPageView searchParams={params} />;
}
