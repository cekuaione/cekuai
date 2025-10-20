import type { FeatureModalConfig } from "@/lib/types/modal";

type WorkoutModalFormData = {
  goal?: string;
  level?: string;
  daysPerWeek?: number;
  durationPerDay?: number;
  equipment?: unknown;
  notes?: string;
};

type WorkoutSubmitResult = {
  success: boolean;
  planId?: string;
  status?: string;
  error?: string;
};

function normalizeDaysPerWeek(value: unknown): 3 | 4 | 5 | 6 {
  const numeric = typeof value === "number" ? value : Number(value);
  const allowed = [3, 4, 5, 6] as const;
  if (allowed.includes(numeric as 3 | 4 | 5 | 6)) {
    return numeric as 3 | 4 | 5 | 6;
  }

  const fallback = 4;
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const nearest = allowed.reduce((prev, current) => {
    return Math.abs(current - numeric) < Math.abs(prev - numeric) ? current : prev;
  }, fallback);

  return nearest;
}

function normalizeDuration(value: unknown): 30 | 45 | 60 | 90 {
  const numeric = typeof value === "number" ? value : Number(value);
  const allowed = [30, 45, 60, 90] as const;
  if (allowed.includes(numeric as 30 | 45 | 60 | 90)) {
    return numeric as 30 | 45 | 60 | 90;
  }

  const fallback = 45;
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const nearest = allowed.reduce((prev, current) => {
    return Math.abs(current - numeric) < Math.abs(prev - numeric) ? current : prev;
  }, fallback);

  return nearest;
}

async function submitWorkoutPlan(formData: Record<string, unknown>) {
  const data = formData as WorkoutModalFormData;

  const payload = {
    goal: typeof data.goal === "string" ? data.goal : "muscle",
    level: typeof data.level === "string" ? data.level : "beginner",
    daysPerWeek: normalizeDaysPerWeek(data.daysPerWeek),
    durationPerDay: normalizeDuration(data.durationPerDay),
    equipment: Array.isArray(data.equipment) ? data.equipment.map((item) => String(item)) : [],
    ...(data.notes && typeof data.notes === "string" && data.notes.trim().length
      ? { notes: data.notes.trim() }
      : {}),
  };

  const response = await fetch("/api/workout/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let body: WorkoutSubmitResult | null = null;
  try {
    body = (await response.json()) as WorkoutSubmitResult;
  } catch {
    // ignore JSON parse errors to handle below
  }

  if (!response.ok || !body?.success || !body.planId) {
    const message =
      body?.error ??
      (response.status === 401
        ? "Lütfen giriş yaptıktan sonra tekrar deneyin."
        : "Antrenman planı oluşturulamadı. Lütfen tekrar deneyin.");
    throw new Error(message);
  }

  return {
    planId: body.planId,
    status: body.status ?? "generating",
  };
}

export const workoutPlanConfig: FeatureModalConfig = {
  id: "workout-plan",
  category: "sport",
  title: "Workout Plan Generator",
  description: "Hedeflerine göre kişisel antrenman planı oluştur.",
  creditCost: 2,
  formSteps: [
    {
      id: "goal",
      title: "Hedefini seç",
      description: "Planın odaklandığı hedefi belirle.",
      fields: [
        {
          id: "goal",
          type: "cards",
          label: "Antrenman hedefin nedir?",
          required: true,
          options: [
            { value: "muscle", label: "Kas Yapımı", icon: "💪" },
            { value: "weight_loss", label: "Kilo Kaybı", icon: "⚖️" },
            { value: "endurance", label: "Dayanıklılık", icon: "🏃" },
            { value: "general_fitness", label: "Genel Fitness", icon: "🌟" },
          ],
        },
      ],
    },
    {
      id: "experience",
      title: "Seviyeni ve zamanı seç",
      fields: [
        {
          id: "level",
          type: "radio",
          label: "Antrenman seviyen",
          required: true,
          options: [
            { value: "beginner", label: "Başlangıç", icon: "🌱" },
            { value: "intermediate", label: "Orta", icon: "🌿" },
            { value: "advanced", label: "İleri", icon: "🌳" },
          ],
        },
        {
          id: "daysPerWeek",
          type: "slider",
          label: "Haftalık gün sayısı",
          min: 3,
          max: 6,
          step: 1,
          defaultValue: 4,
          required: true,
        },
        {
          id: "durationPerDay",
          type: "slider",
          label: "Günlük süre (dk)",
          min: 30,
          max: 90,
          step: 5,
          defaultValue: 45,
          required: true,
        },
      ],
    },
    {
      id: "equipment",
      title: "Ekipman ve notlar",
      fields: [
        {
          id: "equipment",
          type: "cards",
          label: "Kullanabileceğin ekipmanları seç",
          multiple: true,
          options: [
            { value: "bodyweight", label: "Vücut ağırlığı", icon: "🧘" },
            { value: "dumbbell", label: "Dumbbell", icon: "🏋️" },
            { value: "kettlebell", label: "Kettlebell", icon: "🔔" },
            { value: "resistance_band", label: "Direnç bandı", icon: "🎯" },
            { value: "pullup_bar", label: "Barfiks", icon: "🪜" },
          ],
        },
        {
          id: "notes",
          type: "textarea",
          label: "Ek notlar",
          placeholder: "Sakatlıklar, odaklanmak istediğin bölgeler vb.",
        },
      ],
    },
  ],
  aiTips: [
    {
      id: "goal-tip",
      trigger: "field_focus",
      fieldId: "goal",
      condition: (_, context) => context.currentField === "goal",
      content: "💡 Hedefini doğru seçmek, planın içeriğini doğrudan etkiler.",
      type: "tip",
    },
    {
      id: "days-warning",
      trigger: "field_value",
      fieldId: "daysPerWeek",
      condition: (data) => (data.daysPerWeek as number | undefined) !== undefined && (data.daysPerWeek as number) > 5,
      content: "⚠️ Haftada 5 günden fazla antrenman planlıyorsan dinlenme günlerini iyi planla.",
      type: "warning",
    },
    {
      id: "equipment-info",
      trigger: "field_focus",
      fieldId: "equipment",
      condition: (_, context) => context.currentField === "equipment",
      content: "ℹ️ Ekipman seçimini çeşitlendirmek daha zengin antrenman önerileri sağlar.",
      type: "info",
    },
  ],
  onSubmit: async (formData) => {
    return submitWorkoutPlan(formData);
  },
  onSuccess: (result) => {
    console.info("Workout plan generated", result);
  },
  onError: (error) => {
    console.error("Workout plan generation failed", error);
  },
};

export default workoutPlanConfig;
