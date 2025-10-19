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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-lg shadow-lg shadow-blue-900/40">
          💪
        </div>
      )}

      {/* Spacer for alignment when avatar is hidden */}
      {isAI && !showAvatar && (
        <div className="h-9 w-9 shrink-0" />
      )}

      <div
        className={`max-w-[82%] rounded-[26px] border-none ring-0 px-6 py-4 text-sm leading-relaxed text-white shadow-lg backdrop-blur md:text-base md:leading-relaxed ${
          isAI
            ? "bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 shadow-cyan-500/30"
            : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 shadow-fuchsia-500/30"
        } ${isAI ? "rounded-tl-sm" : "rounded-tr-sm"}`}
      >
        <p className="whitespace-pre-line">{content}</p>
      </div>

      {!isAI && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg shadow-lg shadow-purple-900/40">
          👤
        </div>
      )}
    </motion.div>
  );
}
