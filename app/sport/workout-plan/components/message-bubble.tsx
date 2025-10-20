"use client";

import { motion } from "framer-motion";

interface MessageBubbleProps {
  type: "ai" | "user";
  content: string;
  showAvatar?: boolean;
}

export function MessageBubble({ type, content, showAvatar = true }: MessageBubbleProps) {
  const isAI = type === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAI ? "justify-start pl-1" : "justify-end pr-1"}`}
    >
      {isAI && showAvatar && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sport-soft text-lg text-sport shadow-lg shadow-sport/30">
          💪
        </div>
      )}

      {/* Spacer for alignment when avatar is hidden */}
      {isAI && !showAvatar && (
        <div className="h-9 w-9 shrink-0" />
      )}

      <div
        className={`max-w-[82%] rounded-[26px] border-none ring-0 px-6 py-4 text-sm leading-relaxed shadow-lg md:text-base md:leading-relaxed ${
          isAI
            ? "bg-sport-soft text-sport shadow-sport/30"
            : "bg-surface-strong text-text-primary shadow-surface-muted/40"
        } ${isAI ? "rounded-tl-sm" : "rounded-tr-sm"}`}
      >
        <p className="whitespace-pre-line">{content}</p>
      </div>

      {!isAI && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-education-soft text-lg text-education shadow-lg shadow-education/30">
          👤
        </div>
      )}
    </motion.div>
  );
}
