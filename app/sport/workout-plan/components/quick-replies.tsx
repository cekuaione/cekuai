"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface QuickRepliesProps {
  options: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  onSubmit?: (selected: string[]) => void;
}

export function QuickReplies({
  options,
  onSelect,
  multiSelect = false,
  selectedValues = [],
  onSubmit,
}: QuickRepliesProps) {
  const [selected, setSelected] = useState<string[]>(selectedValues);

  useEffect(() => {
    if (!multiSelect) return;
    setSelected(selectedValues);
  }, [multiSelect, selectedValues]);

  const handleClick = (option: string) => {
    if (multiSelect) {
      setSelected((prev) => {
        const exists = prev.includes(option);
        const next = exists ? prev.filter((item) => item !== option) : [...prev, option];
        return next;
      });
    } else {
      setSelected([option]);
      onSelect(option);
    }
  };

  const handleSubmit = () => {
    if (onSubmit && selected.length > 0) {
      onSubmit(selected);
    }
  };

  const shouldShowSubmit = multiSelect && selected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-neutral-800/80 bg-[#0b0b0b] p-3 shadow-lg shadow-black/40"
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => handleClick(option)}
              aria-pressed={isSelected}
                className={`relative flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  isSelected
                  ? "border-purple-500/60 bg-gradient-to-r from-purple-600/80 to-fuchsia-600/70 text-white shadow shadow-purple-950/30"
                  : "border-neutral-700 bg-[#111111] text-slate-200 transition-colors hover:border-neutral-500 hover:bg-[#161616]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option}
              {multiSelect && isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {shouldShowSubmit && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-900/40 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ✓ Devam Et ({selected.length} seçildi)
        </motion.button>
      )}
    </motion.div>
  );
}
