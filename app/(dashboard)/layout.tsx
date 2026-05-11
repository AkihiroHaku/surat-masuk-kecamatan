import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/services/users";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
