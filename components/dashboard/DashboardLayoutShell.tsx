"use client";

import { ReactNode, useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

const drawerVariants: Variants = {
  open: { x: 0, transition: { type: "spring" as const, stiffness: 260, damping: 30 } },
  closed: { x: "-100%", transition: { duration: 0.2 } },
};

interface DashboardLayoutShellProps {
  children: ReactNode;
  userName?: string;
}

export function DashboardLayoutShell({ children, userName }: DashboardLayoutShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusableElements?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const isShift = event.shiftKey;

      if (document.activeElement === firstElement && isShift) {
        event.preventDefault();
        lastElement.focus();
      } else if (document.activeElement === lastElement && !isShift) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (isMobileNavOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobileNavOpen]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    if (touchStartXRef.current - endX > 60) {
      closeMobileNav();
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <div className="hidden lg:flex">
        <div className="fixed inset-y-0 left-0 z-40 flex w-[240px] bg-background shadow-sm">
          <Sidebar />
        </div>
      </div>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-lg transition hover:bg-gray-100 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            aria-label="Menüyü aç"
          >
            ☰
          </button>
          <div className="flex flex-1 flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Ceku.ai</span>
            <span className="text-sm font-semibold text-foreground">Kontrol Paneli</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            <span aria-hidden>👋</span>
            <span>{userName ?? "Misafir"}</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col bg-background">
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Arka planı kapat"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileNav}
            />
            <motion.div
              ref={drawerRef}
              className="fixed inset-y-0 left-0 z-50 flex h-full w-[80vw] max-w-[320px] flex-col border-r border-border bg-background shadow-lg"
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              role="dialog"
              aria-modal="true"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Sidebar isMobile onClose={closeMobileNav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
