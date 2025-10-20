"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Genel Bakış", icon: "🏠" },
  { href: "/dashboard/plans", label: "Planlarım", icon: "📋" },
  { href: "/dashboard/settings", label: "Ayarlar", icon: "⚙️" },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:border-surface-strong hover:text-text-primary"
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
