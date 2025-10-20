"use client";

import { motion } from "framer-motion";

type SummaryFieldKey = "goal" | "level" | "days" | "duration" | "equipment" | "notes";

interface SummaryCardProps {
  goal: string;
  level: string;
  daysPerWeek: string;
  duration: string;
  equipment: string[];
  notes?: string;
  onConfirm?: () => void;
  onEdit?: (field: SummaryFieldKey) => void;
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

export function SummaryCard({
  goal,
  level,
  daysPerWeek,
  duration,
  equipment,
  notes,
  onConfirm,
  onEdit,
  isLoading = false,
  confirmDisabled = false,
}: SummaryCardProps) {
  const fields: Array<{
    key: SummaryFieldKey;
    icon: string;
    label: string;
    value: string;
  }> = [
    { key: "goal", icon: "🎯", label: "Hedef", value: goal || "Belirtilmedi" },
    { key: "level", icon: "📊", label: "Seviye", value: level || "Belirtilmedi" },
    { key: "days", icon: "📅", label: "Hafta", value: daysPerWeek ? `${daysPerWeek} gün` : "Belirtilmedi" },
    { key: "duration", icon: "⏱️", label: "Süre", value: duration ? `${duration} dakika` : "Belirtilmedi" },
    {
      key: "equipment",
      icon: "🏋️",
      label: "Ekipman",
      value: equipment.length > 0 ? equipment.join(", ") : "Ekipman gerekmez",
    },
    { key: "notes", icon: "📝", label: "Not", value: notes?.trim() ? notes : "Yok" },
  ];

  const handleEdit = (field: SummaryFieldKey) => {
    if (isLoading) return;
    onEdit?.(field);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 rounded-2xl border-2 border-sport/50 bg-sport-soft p-4 shadow-lg shadow-sport/30"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold text-sport">Seçimlerinin Özeti</h3>
        </div>
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className="rounded-xl bg-sport px-4 py-2 text-sm font-semibold text-background shadow-lg shadow-sport/30 transition hover:bg-sport/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Hazırlanıyor..." : "AI Planını Oluştur"}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-3 py-2"
          >
            <div className="flex flex-1 items-start gap-2">
              <span className="text-sport">{field.icon}</span>
              <div>
                <span className="text-text-secondary">{field.label}: </span>
                <span className="text-text-primary">{field.value}</span>
              </div>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => handleEdit(field.key)}
                className="rounded-lg border border-sport/40 bg-sport-soft px-2 py-1 text-xs font-medium text-sport transition hover:border-sport hover:bg-sport-soft/80"
              >
                Düzenle
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
