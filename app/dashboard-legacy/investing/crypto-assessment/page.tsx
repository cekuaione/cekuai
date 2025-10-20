"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { ChatContainer } from "@/app/investing/crypto-assessment/components/chat-container";
import { MessageBubble } from "@/app/investing/crypto-assessment/components/message-bubble";
import { TypingIndicator } from "@/app/investing/crypto-assessment/components/typing-indicator";
import { QuickReplies } from "@/app/investing/crypto-assessment/components/quick-replies";
import { SummaryCard } from "@/app/investing/crypto-assessment/components/summary-card";
import { ChatTextInput } from "@/app/investing/crypto-assessment/components/chat-text-input";
import { useCryptoChatFlow } from "@/app/investing/crypto-assessment/hooks/use-crypto-chat-flow";
import {
  CRYPTO_OPTIONS,
  INVESTMENT_AMOUNT_SUGGESTIONS,
  LOADING_MESSAGES,
  RISK_TOLERANCE_OPTIONS,
  TIME_HORIZON_OPTIONS,
} from "@/app/investing/crypto-assessment/constants/ai-messages";
import { RiskTolerance, TimeHorizon } from "@/lib/types/investing";

const RISK_MAP: Record<string, RiskTolerance> = {
  "🛡️ Düşük - Güvenli ve istikrarlı": RiskTolerance.LOW,
  "⚖️ Orta - Dengeli yaklaşım": RiskTolerance.MEDIUM,
  "🚀 Yüksek - Agresif büyüme": RiskTolerance.HIGH,
};

const TIME_MAP: Record<string, TimeHorizon> = {
  "⚡ Kısa Vade (1-3 ay)": TimeHorizon.SHORT,
  "📅 Orta Vade (3-12 ay)": TimeHorizon.MEDIUM,
  "🎯 Uzun Vade (1+ yıl)": TimeHorizon.LONG,
};

const AMOUNT_MAP: Record<string, number> = {
  "1,000 TL": 1000,
  "5,000 TL": 5000,
  "10,000 TL": 10000,
  "25,000 TL": 25000,
};

const CUSTOM_AMOUNT_OPTION = "💵 Özel Tutar Gir";

const LOADING_SEQUENCE = LOADING_MESSAGES.length > 0
  ? LOADING_MESSAGES
  : [
      "Piyasa verileri analiz ediliyor...",
      "Teknik göstergeler hesaplanıyor...",
      "Risk profili değerlendiriliyor...",
      "Sonuçlar hazırlanıyor...",
    ];

const sanitizeCryptoSelection = (value: string) => {
  const cleaned = value.replace(/^[^\s]*\s*/, "").trim();
  if (!cleaned) return value.trim();
  return cleaned;
};

const parseAmountInput = (value: string) => {
  const normalized = value.replace(/[^\d.,]/g, "").replace(",", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function CryptoAssessmentDashboardPage() {
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
  } = useCryptoChatFlow();

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

    const pollAssessment = (assessmentId: string) => {
      clearTimers();
      pollIntervalRef.current = setInterval(async () => {
        if (!isActive) return;

        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_SEQUENCE.length);

        try {
          const response = await fetch(`/api/crypto-assessments/${assessmentId}`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

          if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error ?? "Değerlendirme alınamadı");
          }

          const data = (await response.json()) as {
            assessment?: {
              status?: string;
              assessment_data?: unknown;
              id?: string;
            };
          };

          const status = String(data.assessment?.status ?? "").toLowerCase();
          const isReady = ["ready", "completed", "success"].includes(status);
          const isFailed = ["failed", "error"].includes(status);

          if (isReady) {
            clearTimers();
            if (!isActive) return;
            setLoading(false);
            toast.success("Analiz hazır! Sonuçlara gidiyoruz. 🚀");
            router.push(`/dashboard/investing/crypto-assessment/result?id=${assessmentId}`);
            return;
          }

          if (isFailed) {
            clearTimers();
            if (!isActive) return;
            setLoading(false);
            setErrorMessage("Analiz tamamlanamadı. Lütfen tekrar dene.");
            resetToSummary();
            return;
          }
        } catch (error) {
          if (!isActive) return;
          console.error("❌ [POLL] Assessment polling error:", error);
          clearTimers();
          setLoading(false);
          setErrorMessage("Analiz durumu alınamadı. Lütfen tekrar dene.");
          resetToSummary();
        }
      }, 2000);

      pollTimeoutRef.current = setTimeout(() => {
        clearTimers();
        if (!isActive) return;
        setLoading(false);
        setErrorMessage("Analiz beklenenden uzun sürdü. Lütfen daha sonra tekrar dene.");
        resetToSummary();
      }, 60_000);
    };

    const submitAssessment = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const normalizedCrypto = sanitizeCryptoSelection(formData.cryptoSymbol);
        const normalizedAmountLabel =
          formData.investmentAmount === CUSTOM_AMOUNT_OPTION ? "" : formData.investmentAmount;
        const normalizedAmount = normalizedAmountLabel
          ? AMOUNT_MAP[normalizedAmountLabel] ?? parseAmountInput(normalizedAmountLabel)
          : parseAmountInput(formData.investmentAmount);

        if (!normalizedCrypto || !normalizedAmount) {
          throw new Error("Lütfen tüm alanları doldur.");
        }

        const payload = {
          cryptoSymbol: normalizedCrypto,
          investmentAmount: normalizedAmount,
          riskTolerance: RISK_MAP[formData.riskTolerance] ?? RiskTolerance.MEDIUM,
          timeHorizon: TIME_MAP[formData.timeHorizon] ?? TimeHorizon.MEDIUM,
          notes: formData.notes === "Yok" ? "" : formData.notes?.trim() ?? "",
        };

        const response = await fetch("/api/crypto-assessment/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Analiz oluşturulamadı.");
        }

        const { assessmentId } = (await response.json()) as { assessmentId?: string };

        if (!assessmentId) {
          throw new Error("Analiz kimliği alınamadı.");
        }

        pollAssessment(assessmentId);
      } catch (error) {
        clearTimers();
        console.error("❌ [GENERATE] Crypto assessment failed:", error);
        setErrorMessage((error as Error).message ?? "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        resetToSummary();
      }
    };

    void submitAssessment();

    return () => {
      isActive = false;
      clearTimers();
    };
  }, [currentStep, formData, resetToSummary, router]);

  const handleCryptoSelect = (value: string) => {
    const normalized = value === "➕ Diğer..." ? "BTC/USDT" : sanitizeCryptoSelection(value);
    addMessage("user", value === "➕ Diğer..." ? "BTC/USDT" : value);
    selectOption("cryptoSymbol", normalized);
  };

  const handleAmountSelect = (value: string) => {
    addMessage("user", value);
    selectOption("investmentAmount", value);
  };

  const handleAmountInput = (value: string) => {
    const formatted = value.trim() ? `${value.trim()} TL` : value.trim();
    addMessage("user", formatted || value);
    selectOption("investmentAmount", formatted || value);
  };

  const handleRiskSelect = (value: string) => {
    addMessage("user", value);
    selectOption("riskTolerance", value);
  };

  const handleTimeSelect = (value: string) => {
    addMessage("user", value);
    selectOption("timeHorizon", value);
  };

  const handleNotesSelect = (value: string) => {
    addMessage("user", value);
    const normalized = value === "Devam Et" ? "Yok" : "Not Ekle";
    selectOption("notes", normalized);
  };

  const handleNotesSubmit = (value: string) => {
    addMessage("user", value);
    selectOption("notes", value);
  };

  const loadingMessage = useMemo(
    () => LOADING_SEQUENCE[loadingMessageIndex],
    [loadingMessageIndex],
  );

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

          {currentStep === "crypto" && !formData.cryptoSymbol && (
            <QuickReplies options={CRYPTO_OPTIONS} onSelect={handleCryptoSelect} />
          )}

          {currentStep === "amount" && !formData.investmentAmount && (
            <QuickReplies options={INVESTMENT_AMOUNT_SUGGESTIONS} onSelect={handleAmountSelect} />
          )}

          {currentStep === "amount_input" && (
            <ChatTextInput
              onSubmit={handleAmountInput}
              placeholder="Örn. 7500"
              maxLength={10}
              inputMode="numeric"
            />
          )}

          {currentStep === "risk" && !formData.riskTolerance && (
            <QuickReplies options={RISK_TOLERANCE_OPTIONS} onSelect={handleRiskSelect} />
          )}

          {currentStep === "time" && !formData.timeHorizon && (
            <QuickReplies options={TIME_HORIZON_OPTIONS} onSelect={handleTimeSelect} />
          )}

          {currentStep === "notes" && (
            <QuickReplies options={["Devam Et", "Not Ekle"]} onSelect={handleNotesSelect} />
          )}

          {currentStep === "notes_input" && (
            <ChatTextInput
              onSubmit={handleNotesSubmit}
              placeholder="Analiz için ek not gir..."
              maxLength={500}
            />
          )}

          {currentStep === "summary" && (
            <SummaryCard
              cryptoSymbol={formData.cryptoSymbol}
              investmentAmount={formData.investmentAmount}
              riskTolerance={formData.riskTolerance}
              timeHorizon={formData.timeHorizon}
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
            <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/30 px-4 py-3 text-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
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
