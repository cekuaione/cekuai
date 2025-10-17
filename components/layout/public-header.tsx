"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { Suspense } from "react"

function HeaderContent() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Ceku.ai</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Ana Sayfa
            </Link>
            <Link href="/sport" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Sport
            </Link>
            {session && (
              <Link href="/dashboard" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-slate-800" />
          ) : session ? (
            <UserMenu user={{ name: session.user?.name ?? "Kullanıcı", email: session.user?.email ?? undefined, image: session.user?.image ?? null }} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function PublicHeader() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Ceku.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 animate-pulse rounded-md bg-slate-800" />
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  )
}
