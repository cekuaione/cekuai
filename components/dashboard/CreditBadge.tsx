"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const DEFAULT_CREDITS = 50;

function formatCredits(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function CreditBadge() {
  const { data: session } = useSession();

  const credits = useMemo(() => {
    const rawCredits = (session?.user as { credits?: number } | undefined)?.credits;
    return typeof rawCredits === "number" ? rawCredits : DEFAULT_CREDITS;
  }, [session]);

  const formattedCredits = formatCredits(credits);

  return (
    <button
      type="button"
      onClick={() => toast.info("Bakiye yükleme yakında hazır olacak.")}
      className="group flex w-full items-center gap-2 rounded-xl bg-investing-soft px-4 py-3 text-sm font-medium text-investing shadow-sm transition hover:bg-investing-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-investing focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Kredi bakiyesi: bakiye yüklemek için tıklayın"
    >
      <span aria-hidden className="text-lg leading-none">
        💳
      </span>
      <div className="flex flex-1 flex-col items-start">
        <span className="text-xs uppercase tracking-wide text-investing/80">
          Bakiye
        </span>
        <span className="text-base font-semibold text-text-primary">
          {formattedCredits} kredi
        </span>
      </div>
      <span
        aria-hidden
        className="rounded-full border border-investing/40 bg-investing-soft px-2 py-0.5 text-[10px] uppercase tracking-wide text-investing transition group-hover:border-investing/60 group-hover:bg-investing-soft/80"
      >
        Ekle
      </span>
    </button>
  );
}
