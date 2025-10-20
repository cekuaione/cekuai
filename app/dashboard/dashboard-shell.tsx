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
    label: "Investing",
    icon: "💰",
    items: [
      {
        label: "Crypto Risk Assessment",
        href: "/investing/crypto-assessment",
      },
      {
        label: "Portfolio Analyzer",
        href: "/investing/portfolio",
        disabled: true,
        badge: "Yakında",
      },
      {
        label: "Market Insights",
        href: "/investing/market-insights",
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
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-xl shadow-sm">
          ⚡️
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">ceku.ai</p>
          <p className="text-xs text-muted-foreground">AI Wellness Studio</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground hover:bg-accent"
          >
            Kapat
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Kategoriler</p>
        <div className="space-y-4">
          {NAV_ITEMS.map((category) => {
            const isActiveCategory = category.items.some((item) => pathname?.startsWith(item.href));
            const isDisabled = "disabled" in category && Boolean(category.disabled);
            const categoryBadge = "badge" in category ? category.badge : undefined;
            
            // Use green accent for Investing, purple for others
            const isInvesting = category.label === "Investing";
            const activeBorderColor = isInvesting ? "border-green-500/40" : "border-purple-500/40";
            const activeBgColor = isInvesting ? "bg-green-500/10" : "bg-purple-500/10";
            const badgeBorderColor = isInvesting ? "border-green-500/40" : "border-purple-500/40";
            const badgeTextColor = isInvesting ? "text-green-300" : "text-purple-300";

            return (
              <div
                key={category.label}
                className={`rounded-2xl border px-3 py-3 transition-all ${
                  isActiveCategory
                    ? `${activeBorderColor} ${activeBgColor} shadow-sm`
                    : "border-transparent bg-transparent hover:bg-accent/50"
                } ${isDisabled ? "opacity-50" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{category.label}</span>
                  </div>
                  {categoryBadge && (
                    <span className={`rounded-full border ${badgeBorderColor} px-2 py-0.5 text-[10px] uppercase tracking-wide ${badgeTextColor}`}>
                      {categoryBadge}
                    </span>
                  )}
                </div>

                {category.items.length > 0 ? (
                  <ul className="ml-6 space-y-2 border-l border-border/60 pl-4">
                    {category.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      const itemDisabled = "disabled" in item && Boolean(item.disabled);
                      const itemBadge = "badge" in item ? item.badge : undefined;
                      
                      return (
                        <li key={item.label} className="flex items-center justify-between">
                          {itemDisabled ? (
                            <span className="text-xs text-muted-foreground/60">• {item.label}</span>
                          ) : (
                            <Link
                              href={item.href}
                              className={`text-sm transition ${
                                isItemActive 
                                  ? isInvesting 
                                    ? "text-green-600 dark:text-green-400 font-semibold" 
                                    : "text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={onClose}
                            >
                              • {item.label}
                            </Link>
                          )}
                          {itemBadge && (
                            <span className={`rounded-full border ${badgeBorderColor} px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${badgeTextColor}`}>
                              {itemBadge}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="ml-6 text-xs text-muted-foreground/60">Yakında</p>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border px-4 py-4">
        <Link
          href="/dashboard/sport/workout-plan"
          className="block w-full rounded-xl bg-sport px-4 py-2 text-center text-sm font-semibold text-background shadow-sm shadow-sport/30 transition hover:bg-sport/90"
          onClick={onClose}
        >
          + Yeni Plan
        </Link>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/dashboard/settings" className="rounded-lg px-3 py-2 transition hover:text-foreground hover:bg-accent" onClick={onClose}>
            Ayarlar
          </Link>
          <Link href="/support" className="rounded-lg px-3 py-2 transition hover:text-foreground hover:bg-accent">
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
    <div className="flex h-screen bg-background text-foreground">
      <aside className="hidden h-full lg:flex">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="h-full w-64 shadow-2xl shadow-surface-muted/40">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-background/80 backdrop-blur-sm"
            aria-label="Menüyü kapat"
          />
        </div>
      )}

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-accent"
            aria-label="Menüyü aç"
          >
            ☰ Menü
          </button>
          <span className="text-sm font-semibold text-muted-foreground">Sport · Workout Plans</span>
          <span className="rounded-full bg-sport px-3 py-2 text-xs font-semibold text-background shadow-sm shadow-sport/30">
            {userName ? userName : "ceku.ai"}
          </span>
        </div>

        <div className="flex flex-1 flex-col bg-background overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
