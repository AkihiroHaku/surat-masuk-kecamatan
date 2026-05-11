import { ReportsPageView } from "@/features/reports/reports-page-view";
import { listLettersWithUsers } from "@/services/letters";

export default async function LaporanPage() {
  const letters = await listLettersWithUsers();
  return <ReportsPageView letters={letters} />;
}
