"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Sport",
    icon: "💪",
    items: [
      {
        label: "Workout Plans",
        href: "/dashboard/sport/workout-plan",
      },
      {
        label: "Nutrition",
        href: "/dashboard/sport/nutrition",
        disabled: true,
        badge: "Yakında",
      },
    ],
  },
  {
    label: "Food",
    icon: "🍽️",
    items: [],
    disabled: true,
    badge: "Yakında",
  },
  {
    label: "Business",
    icon: "💼",
    items: [],
    disabled: true,
    badge: "Yakında",
  },
  {
    label: "Education",
    icon: "📚",
    items: [],
    disabled: true,
    badge: "Yakında",
  },
] as const;

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-[#0b0b0b] text-slate-200">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-xl">
          ⚡️
        </div>
        <div>
          <p className="text-lg font-semibold text-white">ceku.ai</p>
          <p className="text-xs text-slate-400">AI Wellness Studio</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-slate-800 px-2 py-1 text-xs text-slate-400 transition hover:text-white"
          >
            Kapat
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Kategoriler</p>
        <div className="space-y-4">
          {NAV_ITEMS.map((category) => {
            const isActiveCategory = category.items.some((item) => pathname?.startsWith(item.href));
            const isDisabled = "disabled" in category && Boolean(category.disabled);
            const categoryBadge = "badge" in category ? category.badge : undefined;

            return (
              <div
                key={category.label}
                className={`rounded-2xl border px-3 py-3 transition-colors ${
                  isActiveCategory
                    ? "border-purple-500/40 bg-purple-500/10"
                    : "border-transparent bg-transparent"
                } ${isDisabled ? "opacity-60" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-semibold text-white">{category.label}</span>
                  </div>
                  {categoryBadge && (
                    <span className="rounded-full border border-purple-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-300">
                      {categoryBadge}
                    </span>
                  )}
                </div>

                {category.items.length > 0 ? (
                  <ul className="ml-6 space-y-2 border-l border-slate-800/60 pl-4">
                    {category.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      const itemDisabled = "disabled" in item && Boolean(item.disabled);
                      return (
                        <li key={item.label}>
                          {itemDisabled ? (
                            <span className="text-xs text-slate-600">• {item.label}</span>
                          ) : (
                            <Link
                              href={item.href}
                              className={`text-sm transition ${
                                isItemActive ? "text-white" : "text-slate-400 hover:text-white"
                              }`}
                              onClick={onClose}
                            >
                              • {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="ml-6 text-xs text-slate-600">Yakında</p>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-900/70 px-4 py-4">
        <Link
          href="/dashboard/sport/workout-plan"
          className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-purple-500"
          onClick={onClose}
        >
          + Yeni Plan
        </Link>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <Link href="/dashboard/settings" className="rounded-lg px-3 py-2 transition hover:text-white" onClick={onClose}>
            Ayarlar
          </Link>
          <Link href="/support" className="rounded-lg px-3 py-2 transition hover:text-white">
            Destek
          </Link>
        </div>
      </div>
    </div>
  );
}

interface DashboardShellProps {
  children: ReactNode;
  userName?: string;
}

export function DashboardShell({ children, userName }: DashboardShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-slate-100">
      <aside className="hidden h-full lg:flex">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="h-full w-64 shadow-2xl shadow-black/60">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black/70 backdrop-blur-sm"
            aria-label="Menüyü kapat"
          />
        </div>
      )}

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-neutral-900 bg-black px-4 py-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            aria-label="Menüyü aç"
          >
            ☰ Menü
          </button>
          <span className="text-sm font-semibold text-slate-300">Sport · Workout Plans</span>
          <span className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 text-xs text-white">
            {userName ? userName : "ceku.ai"}
          </span>
        </div>

        <div className="flex flex-1 flex-col bg-black overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
