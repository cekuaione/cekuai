"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  messages: ReactNode;
  footer?: ReactNode;
  input?: ReactNode;
  autoScrollDeps: unknown[];
  className?: string;
}

export function ChatContainer({ messages, footer, input, autoScrollDeps, className = "" }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [autoScrollDeps]);

  const userDisplayName = session?.user?.name || session?.user?.email || "Profil";
  const avatarFallback = (userDisplayName.trim().charAt(0) || "?").toUpperCase();

  return (
    <div className={cn("flex h-full flex-col bg-background text-text-primary", className)}>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-2xl items-start justify-between px-4 py-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-text-primary md:text-xl">
              Antrenman Planı Asistanı
            </h1>
            <p className="text-sm text-text-secondary">
              Kişiselleştirilmiş antrenman planları oluştur
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-sport hover:bg-sport-soft/70"
            aria-label="Dashboard'a dön"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-text-primary">{userDisplayName}</p>
              <span className="text-xs text-text-secondary">Dashboard</span>
            </div>
            <Avatar className="h-10 w-10 border border-border bg-surface-muted">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={userDisplayName} />
              ) : null}
              <AvatarFallback className="bg-sport-soft text-sm font-semibold text-sport">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </motion.header>

      <div className="flex flex-1 flex-col bg-background">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{ scrollBehavior: "smooth", overscrollBehaviorY: "contain" }}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-text-primary">
            {messages}
            <div ref={endRef} />
          </div>
        </div>

        {(footer || input) && (
          <div className="flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-4">
            {footer && <div className="mx-auto w-full max-w-2xl">{footer}</div>}
            {input && <div className="mx-auto w-full max-w-2xl">{input}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
