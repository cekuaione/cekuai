import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth-helpers";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?redirect=${encodeURIComponent("/dashboard")}`);
  }

  const userName = session.user.name ?? session.user.email ?? undefined;

  return <DashboardShell userName={userName}>{children}</DashboardShell>;
}
