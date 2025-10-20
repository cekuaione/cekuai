"use client";

import { useMemo } from "react";

import type { FeatureModalConfig, AITipConfig, AITipContext } from "@/lib/types/modal";

const TYPE_COLOR: Record<AITipConfig["type"], string> = {
  tip: "border-surface-muted bg-surface-muted/60 text-text-primary",
  info: "border-link/30 bg-link/10 text-link",
  warning: "border-destructive/30 bg-destructive/10 text-destructive",
  success: "border-investing/30 bg-investing-soft text-investing",
};

const TYPE_ICON: Record<AITipConfig["type"], string> = {
  tip: "💡",
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
};

interface AIAssistantProps {
  config: FeatureModalConfig;
  formData: Record<string, unknown>;
  context: AITipContext & { validationErrors: Record<string, string> };
  view: "form" | "loading" | "success" | "error";
}

export function AIAssistant({ config, formData, context, view }: AIAssistantProps) {
  const tips = useMemo(() => {
    if (view === "loading") {
      return [
        {
          id: "loading",
          type: "info" as const,
          icon: "⏳",
          content: "İşlemin tamamlanmasını beklerken tarayıcıyı kapatma.",
        },
      ];
    }

    if (view === "success") {
      return [
        {
          id: "success",
          type: "success" as const,
          icon: "🎉",
          content: "İşlem başarıyla tamamlandı! Sonuçlarına göz atabilirsin.",
        },
      ];
    }

    if (view === "error") {
      return [
        {
          id: "error",
          type: "warning" as const,
          icon: "⚠️",
          content: "Bir hata oluştu. Alanları kontrol ederek tekrar dene.",
        },
      ];
    }

    return config.aiTips.filter((tip) => evaluateTip(tip, formData, context));
  }, [config.aiTips, context, formData, view]);

  return (
    <aside className="flex h-full flex-col border-t border-border bg-background/80 lg:border-l lg:border-t-0">
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
          AI Asistanı
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Form adımlarına göre canlı öneriler
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {tips.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface-muted/60 px-3 py-3 text-sm text-text-secondary">
            Şu an için özel bir öneri yok. Alanları doldurmaya devam ettiğinde yeni ipuçları burada belirecek.
          </p>
        ) : (
          tips.map((tip) => {
            const type = "type" in tip ? tip.type : "info";
            const icon = "icon" in tip && tip.icon ? tip.icon : TYPE_ICON[type];
            const content = typeof tip.content === "function" ? tip.content(formData, context) : tip.content;
            return (
              <div
                key={tip.id}
                className={`rounded-xl border px-3 py-3 text-sm shadow-sm ${TYPE_COLOR[type]}`}
              >
                <div className="flex items-start gap-2">
                  <span aria-hidden className="text-lg leading-none">{icon}</span>
                  <p className="text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

function evaluateTip(
  tip: AITipConfig,
  formData: Record<string, unknown>,
  context: AITipContext & { validationErrors: Record<string, string> }
) {
  const triggered = (() => {
    switch (tip.trigger) {
      case "field_focus": {
        if (!context.currentField) return false;
        if (tip.fieldId) {
          return context.currentField === tip.fieldId;
        }
        return true;
      }
      case "field_value": {
        if (tip.fieldId) {
          const value = formData[tip.fieldId];
          return hasValue(value);
        }
        return true;
      }
      case "validation":
        return Object.keys(context.validationErrors ?? {}).length > 0;
      case "step_change": {
        if (!context.currentStepId) return false;
        if (tip.stepId) {
          return context.currentStepId === tip.stepId;
        }
        return true;
      }
      default:
        return true;
    }
  })();

  if (!triggered) {
    return false;
  }

  if (tip.condition) {
    return tip.condition(formData, context);
  }

  return true;
}

export default AIAssistant;

function hasValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}
