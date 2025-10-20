"use client";

import { motion } from "framer-motion";

export function ChatInputPlaceholder() {
  return (
    <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card px-4 py-4 shadow-lg shadow-surface-muted/40">
        <div className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2.5">
          <input
            type="text"
            placeholder="Metin girişi yakında eklenecek..."
            disabled
            className="flex-1 cursor-not-allowed bg-transparent text-base text-text-secondary placeholder-muted-foreground outline-none"
          />
          <button
            disabled
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sport-soft text-sport opacity-60 shadow-lg shadow-sport/30"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-text-secondary">
          Bu bir demo arayüzüdür. Mesaj gönderme devre dışı.
        </p>
      </div>
    </motion.div>
  );
}
