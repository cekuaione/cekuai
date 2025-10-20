"use client";

import { motion } from "framer-motion";

type SummaryFieldKey = "crypto" | "amount" | "risk" | "time" | "notes";

interface SummaryCardProps {
  cryptoSymbol: string;
  investmentAmount: string;
  riskTolerance: string;
  timeHorizon: string;
  notes?: string;
  onConfirm?: () => void;
  onEdit?: (field: SummaryFieldKey) => void;
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

const labels: Record<SummaryFieldKey, { icon: string; label: string }> = {
  crypto: { icon: "🪙", label: "Kripto Para" },
  amount: { icon: "💰", label: "Yatırım Tutarı" },
  risk: { icon: "⚖️", label: "Risk Toleransı" },
  time: { icon: "⏳", label: "Zaman Ufku" },
  notes: { icon: "📝", label: "Notlar" },
};

export function SummaryCard({
  cryptoSymbol,
  investmentAmount,
  riskTolerance,
  timeHorizon,
  notes,
  onConfirm,
  onEdit,
  isLoading = false,
  confirmDisabled = false,
}: SummaryCardProps) {
  const fields: Array<{ key: SummaryFieldKey; value: string }> = [
    { key: "crypto", value: cryptoSymbol || "Belirtilmedi" },
    { key: "amount", value: investmentAmount ? `${investmentAmount}` : "Belirtilmedi" },
    { key: "risk", value: riskTolerance || "Belirtilmedi" },
    { key: "time", value: timeHorizon || "Belirtilmedi" },
    { key: "notes", value: notes?.trim() ? notes : "Yok" },
  ];

  const handleEdit = (field: SummaryFieldKey) => {
    if (isLoading) return;
    onEdit?.(field);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 rounded-2xl border-2 border-investing/50 bg-investing-soft p-4 shadow-lg shadow-investing/30"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold text-investing">Analiz Özeti</h3>
        </div>
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className="rounded-xl bg-investing px-4 py-2 text-sm font-semibold text-background shadow-lg shadow-investing/30 transition hover:bg-investing/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Hazırlanıyor..." : "AI Analizini Başlat"}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {fields.map(({ key, value }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-3 py-2"
          >
            <div className="flex flex-1 items-start gap-2">
              <span className="text-investing">{labels[key].icon}</span>
              <div>
                <span className="text-text-secondary">{labels[key].label}: </span>
                <span className="text-text-primary">{value}</span>
              </div>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => handleEdit(key)}
                className="rounded-lg border border-investing/40 bg-investing-soft px-2 py-1 text-xs font-medium text-investing transition hover:border-investing hover:bg-investing-soft/80"
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
