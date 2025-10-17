import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-helpers"
import { PublicLayout } from "@/components/layout/public-layout"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <PublicLayout>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </PublicLayout>
  )
}

