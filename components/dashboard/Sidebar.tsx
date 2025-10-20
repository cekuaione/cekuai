"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CreditBadge } from "./CreditBadge";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  comingSoon?: boolean;
}

interface SidebarProps {
  activeCategory?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const NAVIGATION: { main: NavItem[]; footer: NavItem[] } = {
  main: [
    { icon: "🏠", label: "Ana Sayfa", href: "/new-dashboard", id: "home" },
    { icon: "🏋️", label: "Sport", href: "/new-dashboard/sport", id: "sport" },
    { icon: "💰", label: "Investing", href: "/new-dashboard/investing", id: "investing" },
    { icon: "📊", label: "Business", href: "/new-dashboard/business", id: "business", comingSoon: true },
    { icon: "🎓", label: "Education", href: "/new-dashboard/education", id: "education", comingSoon: true },
  ],
  footer: [
    { icon: "⚙️", label: "Ayarlar", href: "/new-dashboard/settings", id: "settings" },
    { icon: "👤", label: "Profil", href: "/new-dashboard/profile", id: "profile" },
  ],
};

const CATEGORY_ACCENTS: Record<
  string,
  {
    activeBg: string;
    activeText: string;
    border: string;
    badgeBg?: string;
    badgeBorder?: string;
    badgeText?: string;
  }
> = {
  home: {
    activeBg: "bg-surface-muted",
    activeText: "text-text-primary",
    border: "border-primary",
  },
  sport: {
    activeBg: "bg-sport-soft",
    activeText: "text-sport",
    border: "border-sport",
    badgeBg: "bg-sport-soft",
    badgeBorder: "border-sport/40",
    badgeText: "text-sport",
  },
  investing: {
    activeBg: "bg-investing-soft",
    activeText: "text-investing",
    border: "border-investing",
    badgeBg: "bg-investing-soft",
    badgeBorder: "border-investing/40",
    badgeText: "text-investing",
  },
  business: {
    activeBg: "bg-business-soft",
    activeText: "text-business",
    border: "border-business",
    badgeBg: "bg-business-soft",
    badgeBorder: "border-business/40",
    badgeText: "text-business",
  },
  education: {
    activeBg: "bg-education-soft",
    activeText: "text-education",
    border: "border-education",
    badgeBg: "bg-education-soft",
    badgeBorder: "border-education/40",
    badgeText: "text-education",
  },
  settings: {
    activeBg: "bg-surface-muted",
    activeText: "text-text-primary",
    border: "border-primary",
  },
  profile: {
    activeBg: "bg-surface-muted",
    activeText: "text-text-primary",
    border: "border-primary",
  },
};

const DEFAULT_ACCENT = {
  activeBg: "bg-surface-muted",
  activeText: "text-text-primary",
  border: "border-primary",
  badgeBg: "bg-surface-muted",
  badgeBorder: "border-border",
  badgeText: "text-text-secondary",
};

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/new-dashboard") {
    return pathname === href;
  }
  const normalized = href.endsWith("/") ? href.slice(0, -1) : href;
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

export function Sidebar({ activeCategory, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  console.log("Sidebar rendering", { pathname, activeCategory, isMobile });

  const derivedActiveId =
    NAVIGATION.main.find((item) => isActivePath(pathname, item.href))?.id ?? undefined;
  const activeId = activeCategory ?? derivedActiveId;

  return (
    <aside className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-colors">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-investing-soft text-xl text-investing">
          ⚡️
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-text-primary">
            Ceku.ai
          </span>
          <span className="text-xs text-text-secondary">AI Lifestyle Studio</span>
        </div>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-base transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Menüyü kapat"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-text-secondary">Kategoriler</p>
        <ul className="space-y-1">
          {NAVIGATION.main.map((item) => {
            const isActive = activeId ? activeId === item.id : isActivePath(pathname, item.href);
            const accent = CATEGORY_ACCENTS[item.id] ?? DEFAULT_ACCENT;
            const classes = clsx(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-l-[3px] border-transparent",
              isActive
                ? clsx(accent.border, accent.activeBg, accent.activeText, "font-semibold shadow-sm")
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            );

            if (item.comingSoon) {
              const badgeClasses = clsx(
                "ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                accent.badgeBorder ?? DEFAULT_ACCENT.badgeBorder,
                accent.badgeBg ?? DEFAULT_ACCENT.badgeBg,
                accent.badgeText ?? DEFAULT_ACCENT.badgeText
              );

              return (
                <li key={item.id}>
                  <div
                    className={clsx(
                      classes,
                      "cursor-not-allowed border-dashed text-text-secondary/70"
                    )}
                    role="button"
                    aria-disabled="true"
                  >
                    <span aria-hidden className="text-base leading-none">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <span className={badgeClasses}>Yakında</span>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={classes}
                  {...(isActive ? { "aria-current": "page" } : {})}
                  onClick={onClose}
                >
                  <span aria-hidden className="text-base leading-none">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 space-y-4 px-4 pb-6">
        <CreditBadge />
        <div className="space-y-1 text-sm">
          {NAVIGATION.footer.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            const accent = CATEGORY_ACCENTS[item.id] ?? DEFAULT_ACCENT;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-l-[3px] border-transparent",
                  isActive
                    ? clsx(accent.border, accent.activeBg, accent.activeText, "font-medium shadow-sm")
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                )}
                {...(isActive ? { "aria-current": "page" } : {})}
                onClick={onClose}
              >
                <span aria-hidden className="text-base leading-none">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
