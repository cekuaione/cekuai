import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth-helpers";
import { DashboardLayoutShell } from "@/components/dashboard/DashboardLayoutShell";

export default async function NewDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?redirect=${encodeURIComponent("/new-dashboard")}`);
  }

  const userName = session.user.name ?? session.user.email ?? undefined;

  return <DashboardLayoutShell userName={userName}>{children}</DashboardLayoutShell>;
}
