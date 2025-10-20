"use client";

import { useState, type HTMLAttributes } from "react";
import { motion } from "framer-motion";

interface ChatTextInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  inputMode?: HTMLAttributes<HTMLTextAreaElement>["inputMode"];
}

export function ChatTextInput({
  onSubmit,
  placeholder = "Mesajını yaz...",
  maxLength = 500,
  disabled = false,
  inputMode,
}: ChatTextInputProps) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText("");
    }
  };

  const remainingChars = maxLength - text.length;

  return (
    <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-800/80 bg-[#0b0b0b] px-4 py-4 shadow-lg shadow-black/40"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              rows={1}
              inputMode={inputMode}
              className="w-full resize-none rounded-2xl border border-neutral-700 bg-[#090909] px-4 py-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                minHeight: "52px",
                maxHeight: "120px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {isFocused && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {remainingChars}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={!text.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gönder
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
