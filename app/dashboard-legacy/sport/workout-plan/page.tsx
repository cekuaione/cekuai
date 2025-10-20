"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { ChatContainer } from "@/app/sport/workout-plan/components/chat-container";
import { MessageBubble } from "@/app/sport/workout-plan/components/message-bubble";
import { TypingIndicator } from "@/app/sport/workout-plan/components/typing-indicator";
import { QuickReplies } from "@/app/sport/workout-plan/components/quick-replies";
import { SummaryCard } from "@/app/sport/workout-plan/components/summary-card";
import { ChatTextInput } from "@/app/sport/workout-plan/components/chat-text-input";
import { useChatFlow } from "@/app/sport/workout-plan/hooks/use-chat-flow";
import { USER_OPTIONS } from "@/app/sport/workout-plan/constants/ai-messages";
import type { WorkoutEquipment } from "@/lib/workout/types";

const GOAL_MAP: Record<string, "muscle" | "weight_loss" | "endurance" | "general_fitness"> = {
  "💪 Kas Yapma": "muscle",
  "🔥 Yağ Yakma": "weight_loss",
  "🏃 Dayanıklılık": "endurance",
  "⚖️ Genel Fitness": "general_fitness",
};

const LEVEL_MAP: Record<string, "beginner" | "intermediate" | "advanced"> = {
  "🌱 Yeni Başlayan": "beginner",
  "🏋️ Orta Seviye": "intermediate",
  "💪 İleri Seviye": "advanced",
};

const EQUIPMENT_MAP: Record<string, WorkoutEquipment> = {
  "Dambıl": "dumbbell",
  "Barbell": "barbell",
  "Kettlebell": "kettlebell",
  "Direnç Bandı": "resistance_band",
  "Pull-up Bar": "pullup_bar",
  "Sadece Vücut Ağırlığı": "bodyweight",
};

const LOADING_MESSAGES = [
  "🤖 AI analyzing your goals...",
  "💪 Selecting exercises...",
  "📋 Building your program...",
  "✨ Almost ready...",
];

export default function WorkoutPlanDashboardPage() {
  const router = useRouter();
  const {
    messages,
    currentStep,
    formData,
    isTyping,
    addMessage,
    selectOption,
    isComplete,
    confirmAndGenerate,
    startEdit,
    resetToSummary,
  } = useChatFlow();

  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentStep !== "generating") {
      return;
    }

    let isActive = true;

    const clearTimers = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const treatStatus = (status: unknown) => {
      if (typeof status !== "string") {
        return "unknown";
      }
      return status.toLowerCase();
    };

    const pollPlan = (planId: string) => {
      clearTimers();

      console.log("🔄 [POLL] Started polling for:", planId);

      pollIntervalRef.current = setInterval(async () => {
        if (!isActive) return;

        console.log("⏰ [POLL] Tick");
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);

        try {
          const url = `/api/workout/plans/${planId}`;
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

          console.log("📥 [POLL] Response status:", response.status);

          if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error("❌ [POLL] Non-OK response", errorBody);
            throw new Error(errorBody?.error ?? "Plan sorgulanamadı");
          }

          const data = (await response.json()) as {
            plan?: {
              status?: string;
              plan_data?: unknown;
              id?: string;
            };
          };

          const statusSlug = treatStatus(data.plan?.status);
          const isReady = ["ready", "completed", "complete", "success", "finished"].includes(statusSlug);
          const isFailed = ["failed", "error", "errored", "cancelled"].includes(statusSlug);

          console.log("📊 [POLL] Status snapshot:", {
            status: data.plan?.status,
            normalized: statusSlug,
            hasPlanData: Boolean((data.plan as { planData?: unknown } | undefined)?.planData ?? data.plan?.plan_data),
          });

          if (isReady) {
            console.log("✅ [POLL] Plan ready, clearing timers");
            clearTimers();
            if (!isActive) return;
            setLoading(false);
            toast.success("Planın hazır! Seni plan detayına yönlendiriyorum.");
            router.push(`/dashboard/sport/workout-plan/result?id=${planId}`);
            return;
          }

          if (isFailed) {
            console.error("❌ [POLL] Plan generation failed", { planId, status: data.plan?.status });
            clearTimers();
            if (!isActive) return;
            setLoading(false);
            setErrorMessage("Plan oluşturulamadı. Lütfen tekrar dene.");
            resetToSummary();
            return;
          }

          console.log("⏳ [POLL] Still generating:", statusSlug || "unknown");
        } catch (error) {
          if (!isActive) return;
          console.error("❌ [POLL] Unexpected polling error:", error);
          clearTimers();
          setLoading(false);
          setErrorMessage("Plan durumu alınamadı. Lütfen tekrar dene.");
          resetToSummary();
        }
      }, 2000);

      pollTimeoutRef.current = setTimeout(() => {
        console.warn("⏱️ [POLL] Polling timed out");
        clearTimers();
        if (!isActive) return;
        resetToSummary();
        setLoading(false);
        setErrorMessage("Beklenenden uzun sürdü, lütfen daha sonra tekrar dene.");
      }, 60_000);
    };

    const submitRequest = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const normalizedEquipment = (formData.equipment || [])
          .map((item) => EQUIPMENT_MAP[item])
          .filter((item): item is WorkoutEquipment => Boolean(item));

        const payload = {
          goal: GOAL_MAP[formData.goal] ?? "muscle",
          level: LEVEL_MAP[formData.level] ?? "beginner",
          daysPerWeek: Number(formData.daysPerWeek || 3),
          durationPerDay: Number(formData.duration || 30),
          equipment: normalizedEquipment,
          notes: formData.notes === "Yok" ? "" : formData.notes?.trim() ?? "",
        };

        console.log("📤 [GEN] Sending payload", payload);

        const response = await fetch("/api/workout/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!isActive) return;

        console.log("📥 [GEN] Response status:", response.status);

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Plan oluşturulamadı.");
        }

        const { planId } = (await response.json()) as { planId?: string };
        if (!planId) {
          throw new Error("Plan kimliği alınamadı");
        }

        console.log("✅ [GEN] Plan created, starting poll", { planId });
        pollPlan(planId);
      } catch (error) {
        if (!isActive) return;
        clearTimers();
        console.error("❌ Workout generation failed:", error);
        setErrorMessage((error as Error).message ?? "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        resetToSummary();
      }
    };

    void submitRequest();

    return () => {
      isActive = false;
      clearTimers();
    };
  }, [currentStep, formData, resetToSummary, router]);

  const handleGoalSelect = (goal: string) => {
    addMessage("user", goal);
    selectOption("goal", goal);
  };

  const handleLevelSelect = (level: string) => {
    addMessage("user", level);
    selectOption("level", level);
  };

  const handleDaysSelect = (days: string) => {
    addMessage("user", `${days} gün`);
    selectOption("daysPerWeek", days);
  };

  const handleDurationSelect = (duration: string) => {
    addMessage("user", `${duration} dk`);
    selectOption("duration", duration);
  };

  const handleEquipmentSubmit = (equipment: string[]) => {
    addMessage("user", equipment.join(", "));
    selectOption("equipment", equipment);
  };

  const handleNotesSelect = (notes: string) => {
    addMessage("user", notes);
    const normalized = notes.includes("Yok") ? "Yok" : "Özel notum var";
    selectOption("notes", normalized);
  };

  const handleNotesSubmit = (text: string) => {
    addMessage("user", text);
    selectOption("notes", text);
  };

  const loadingMessage = useMemo(() => LOADING_MESSAGES[loadingMessageIndex], [loadingMessageIndex]);

  return (
    <ChatContainer
      className="flex-1"
      messages={
        <>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              type={message.type}
              content={message.content}
              showAvatar={index === 0 || messages[index - 1]?.type === "user"}
            />
          ))}

          {isTyping && <TypingIndicator />}

          {currentStep === "goal" && !formData.goal && (
            <QuickReplies options={USER_OPTIONS.goals} onSelect={handleGoalSelect} />
          )}

          {currentStep === "level" && !formData.level && (
            <QuickReplies options={USER_OPTIONS.levels} onSelect={handleLevelSelect} />
          )}

          {currentStep === "days" && !formData.daysPerWeek && (
            <QuickReplies
              options={USER_OPTIONS.daysPerWeek.map((d) => `${d} gün`)}
              onSelect={(value) => handleDaysSelect(value.replace(" gün", ""))}
            />
          )}

          {currentStep === "duration" && !formData.duration && (
            <QuickReplies
              options={USER_OPTIONS.duration.map((d) => `${d} dk`)}
              onSelect={(value) => handleDurationSelect(value.replace(" dk", ""))}
            />
          )}

          {currentStep === "equipment" && (
            <QuickReplies
              options={USER_OPTIONS.equipment}
              onSelect={() => {}}
              multiSelect
              selectedValues={formData.equipment}
              onSubmit={handleEquipmentSubmit}
            />
          )}

          {currentStep === "notes" && (
            <QuickReplies
              options={["❌ Yok", "✍️ Özel notum var"]}
              onSelect={handleNotesSelect}
            />
          )}

          {currentStep === "notes_input" && (
            <ChatTextInput
              onSubmit={handleNotesSubmit}
              placeholder="Notunu buraya yaz..."
              maxLength={500}
            />
          )}

          {currentStep === "summary" && (
            <SummaryCard
              goal={formData.goal}
              level={formData.level}
              daysPerWeek={formData.daysPerWeek}
              duration={formData.duration}
              equipment={formData.equipment}
              notes={formData.notes}
              onConfirm={confirmAndGenerate}
              onEdit={startEdit}
              isLoading={loading}
              confirmDisabled={!isComplete() || loading}
            />
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-800/30 bg-red-900/30 px-4 py-3 text-red-300">
              {errorMessage}
            </div>
          )}

          {loading && currentStep === "generating" && (
            <div className="rounded-2xl border border-blue-800/30 bg-blue-900/30 px-4 py-3 text-blue-200">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div className="h-2 w-2 rounded-full bg-blue-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="h-2 w-2 rounded-full bg-blue-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="h-2 w-2 rounded-full bg-blue-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
                <span>{loadingMessage}</span>
              </div>
            </div>
          )}
        </>
      }
      autoScrollDeps={[messages.length, isTyping, currentStep, loadingMessageIndex, errorMessage]}
    />
  );
}
