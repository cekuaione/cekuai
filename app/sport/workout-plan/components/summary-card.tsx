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
      className="mt-2 rounded-2xl border-2 border-purple-600/30 bg-slate-800/40 p-4 shadow-lg shadow-purple-900/30"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold text-purple-200">Seçimlerinin Özeti</h3>
        </div>
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className="rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-800/40 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Hazırlanıyor..." : "AI Planını Oluştur"}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-2"
          >
            <div className="flex flex-1 items-start gap-2">
              <span className="text-gray-400">{field.icon}</span>
              <div>
                <span className="text-gray-400">{field.label}: </span>
                <span className="text-white">{field.value}</span>
              </div>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => handleEdit(field.key)}
                className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-100 transition hover:border-purple-400 hover:bg-purple-500/20"
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
