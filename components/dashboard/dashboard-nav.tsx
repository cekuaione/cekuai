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
    <div className="border-b border-slate-800 bg-slate-900/50">
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
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300"
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

