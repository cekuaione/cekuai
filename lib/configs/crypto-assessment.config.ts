import type { FeatureModalConfig } from "@/lib/types/modal";

type CryptoModalFormData = {
  cryptoSymbol?: string;
  investmentAmount?: number;
  riskTolerance?: string;
  timeHorizon?: string;
  notes?: string;
};

type CryptoSubmitResult = {
  success?: boolean;
  assessmentId?: string;
  status?: string;
  error?: string;
};

async function submitCryptoAssessment(formData: Record<string, unknown>) {
  const data = formData as CryptoModalFormData;

  const investmentAmountRaw =
    typeof data.investmentAmount === "number"
      ? data.investmentAmount
      : Number(data.investmentAmount);

  const payload = {
    cryptoSymbol: typeof data.cryptoSymbol === "string" ? data.cryptoSymbol : "",
    investmentAmount: Number.isFinite(investmentAmountRaw) ? investmentAmountRaw : 0,
    riskTolerance: typeof data.riskTolerance === "string" ? data.riskTolerance : "medium",
    timeHorizon: typeof data.timeHorizon === "string" ? data.timeHorizon : "medium",
    ...(data.notes && typeof data.notes === "string" && data.notes.trim().length
      ? { notes: data.notes.trim() }
      : {}),
  };

  const response = await fetch("/api/crypto-assessment/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let body: CryptoSubmitResult | null = null;
  try {
    body = (await response.json()) as CryptoSubmitResult;
  } catch {
    // ignore JSON parse errors for consistent error handling below
  }

  if (!response.ok || !body?.success || !body.assessmentId) {
    const message =
      body?.error ??
      (response.status === 401
        ? "Lütfen giriş yaptıktan sonra tekrar deneyin."
        : "Kripto analizi başlatılamadı. Lütfen tekrar deneyin.");
    throw new Error(message);
  }

  return {
    assessmentId: body.assessmentId,
    status: body.status ?? "generating",
  };
}

export const cryptoAssessmentConfig: FeatureModalConfig = {
  id: "crypto-assessment",
  category: "investing",
  title: "Crypto Risk Assessment",
  description: "Kripto portföyündeki varlıklar için risk ve fırsat analizi yap.",
  creditCost: 2,
  formSteps: [
    {
      id: "crypto-selection",
      title: "Kripto seç",
      description: "Analiz etmek istediğin kripto varlığı seç.",
      fields: [
        {
          id: "cryptoSymbol",
          type: "cards",
          label: "Hangi kripto varlığı analiz etmek istiyorsun?",
          required: true,
          options: [
            { value: "BTC/USDT", label: "Bitcoin", icon: "₿" },
            { value: "ETH/USDT", label: "Ethereum", icon: "Ξ" },
            { value: "SOL/USDT", label: "Solana", icon: "◎" },
            { value: "XRP/USDT", label: "Ripple", icon: "✦" },
          ],
        },
      ],
    },
    {
      id: "investment-details",
      title: "Yatırım detayları",
      description: "Yatırım tutarını ve risk seviyeni belirt.",
      fields: [
        {
          id: "investmentAmount",
          type: "slider",
          label: "Yatırım tutarı (TL)",
          min: 500,
          max: 200000,
          step: 500,
          defaultValue: 5000,
          required: true,
        },
        {
          id: "riskTolerance",
          type: "radio",
          label: "Risk toleransın",
          required: true,
          options: [
            { value: "low", label: "Düşük", icon: "🛡️" },
            { value: "medium", label: "Orta", icon: "⚖️" },
            { value: "high", label: "Yüksek", icon: "🚀" },
          ],
        },
        {
          id: "timeHorizon",
          type: "radio",
          label: "Yatırım ufkun",
          required: true,
          options: [
            { value: "short", label: "Kısa vade", icon: "⏱" },
            { value: "medium", label: "Orta vade", icon: "🗓" },
            { value: "long", label: "Uzun vade", icon: "📈" },
          ],
        },
      ],
    },
    {
      id: "notes",
      title: "Not ekle",
      description: "Opsiyonel olarak stratejini veya notlarını paylaş.",
      fields: [
        {
          id: "notes",
          type: "textarea",
          label: "Notlar",
          placeholder: "Portföy dağılımın, hedef seviyelerin vb.",
        },
      ],
    },
  ],
  aiTips: [
    {
      id: "crypto-popularity",
      trigger: "field_focus",
      fieldId: "cryptoSymbol",
      condition: (_, context) => context.currentField === "cryptoSymbol",
      content: "💡 BTC ve ETH en çok analiz edilen varlıklardır; portföyün için iyi başlangıç noktaları olabilir.",
      type: "tip",
    },
    {
      id: "amount-suggestion",
      trigger: "field_value",
      fieldId: "investmentAmount",
      condition: (data) => (data.investmentAmount as number | undefined) !== undefined && (data.investmentAmount as number) < 1000,
      content: "ℹ️ Daha sağlıklı sonuçlar için minimum 1000 TL yatırım önerilir.",
      type: "info",
    },
    {
      id: "risk-warning",
      trigger: "field_value",
      fieldId: "riskTolerance",
      condition: (data) => data.riskTolerance === "high",
      content: "⚠️ Yüksek risk toleransı seçildi. Portföyünü çeşitlendirmeyi unutma.",
      type: "warning",
    },
  ],
  onSubmit: async (formData) => {
    return submitCryptoAssessment(formData);
  },
  onSuccess: (result) => {
    console.info("Crypto assessment created", result);
  },
  onError: (error) => {
    console.error("Crypto assessment failed", error);
  },
};

export default cryptoAssessmentConfig;
