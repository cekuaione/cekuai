import type { FeatureModalConfig } from "@/lib/types/modal";

type WorkoutModalFormData = {
  ageRange?: string;
  goal?: string;
  level?: string;
  daysPerWeek?: number;
  durationPerDay?: number;
  equipment?: unknown;
  notes?: string;
  // Goal-specific individual fields (from dynamic form)
  targetAreas?: unknown;
  priority?: string;
  phase?: string;
  cardioPreference?: string;
  activityLevel?: string;
  musclePriority?: string;
  sportType?: string;
  currentLevel?: string;
  specificGoal?: string;
  mainFocus?: string;
  lifestyle?: string;
  // Experience & safety fields
  injuries?: unknown;
  injuryDetails?: string;
  compoundMovements?: unknown;
  // Logistics fields
  trainingTime?: string;
  targetWeeks?: number;
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

  console.log("🔍 [FORM] Raw form data:", formData);
  console.log("🔍 [FORM] Parsed data:", data);

  const payload = {
    // Basic fields
    goal: typeof data.goal === "string" ? data.goal : "muscle",
    level: typeof data.level === "string" ? data.level : "beginner",
    daysPerWeek: normalizeDaysPerWeek(data.daysPerWeek),
    durationPerDay: normalizeDuration(data.durationPerDay),
    equipment: Array.isArray(data.equipment) ? data.equipment.map((item) => String(item)) : [],
    
    // Enhanced fields
    ageRange: typeof data.ageRange === "string" ? data.ageRange : "26-35",
    injuries: Array.isArray(data.injuries) ? data.injuries.map((item) => String(item)) : [],
    trainingTime: typeof data.trainingTime === "string" ? data.trainingTime : "flexible",
    compoundMovements: Array.isArray(data.compoundMovements) ? data.compoundMovements.map((item) => String(item)) : [],
    targetWeeks: typeof data.targetWeeks === "number" ? data.targetWeeks : 6,
    
    // Goal-specific details - group individual fields into detail objects
    ...(data.goal === "muscle" && data.targetAreas && data.priority && data.phase ? {
      muscleGoalDetails: {
        targetAreas: Array.isArray(data.targetAreas) ? data.targetAreas : [data.targetAreas],
        priority: data.priority,
        phase: data.phase,
      }
    } : {}),
    ...(data.goal === "weight_loss" && data.cardioPreference && data.activityLevel && data.musclePriority ? {
      weightLossDetails: {
        cardioPreference: data.cardioPreference,
        activityLevel: data.activityLevel,
        musclePriority: data.musclePriority,
      }
    } : {}),
    ...(data.goal === "endurance" && data.sportType && data.currentLevel ? {
      enduranceDetails: {
        sportType: data.sportType,
        currentLevel: data.currentLevel,
        ...(data.specificGoal ? { specificGoal: data.specificGoal } : {}),
      }
    } : {}),
    ...(data.goal === "general_fitness" && data.mainFocus && data.lifestyle ? {
      generalFitnessDetails: {
        mainFocus: data.mainFocus,
        lifestyle: data.lifestyle,
      }
    } : {}),
    
    // Optional fields
    ...(data.notes && typeof data.notes === "string" && data.notes.trim().length
      ? { notes: data.notes.trim() }
      : {}),
    ...(data.injuryDetails && typeof data.injuryDetails === "string" && data.injuryDetails.trim().length
      ? { injuryDetails: data.injuryDetails.trim() }
      : {}),
  };

  console.log("📤 [FORM] Final payload:", payload);

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
    // STEP 1 - Basic Info
    {
      id: "basic-info",
      title: "Temel Bilgiler",
      description: "Yaş aralığın ve antrenman hedefin nedir?",
      fields: [
        {
          id: "ageRange",
          type: "cards",
          label: "Yaş aralığın nedir?",
          required: true,
          options: [
            { value: "18-25", label: "18-25", icon: "🌱" },
            { value: "26-35", label: "26-35", icon: "🌿" },
            { value: "36-45", label: "36-45", icon: "🌳" },
            { value: "46-55", label: "46-55", icon: "🏔️" },
            { value: "56+", label: "56+", icon: "🎖️" },
          ],
        },
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
    // STEP 2 - Goal-specific questions (Dynamic)
    {
      id: "goal-specific",
      title: "Hedef-Özel Sorular",
      description: "Hedefine göre daha detaylı bilgi alalım",
      fields: [
        // This will be populated dynamically based on goal selection
      ],
    },
    // STEP 3 - Experience & Safety
    {
      id: "experience-safety",
      title: "Deneyim & Güvenlik",
      description: "Antrenman deneyimin ve sağlık durumun hakkında bilgi alalım",
      fields: [
        {
          id: "level",
          type: "cards",
          label: "Antrenman seviyen nedir?",
          required: true,
          options: [
            { 
              value: "beginner", 
              label: "Başlangıç", 
              icon: "🌱",
              description: "Squat, deadlift, bench press hiç yapmadım"
            },
            { 
              value: "intermediate", 
              label: "Orta Seviye", 
              icon: "🌿",
              description: "Temel egzersizleri biliyorum, form geliştirmeli"
            },
            { 
              value: "advanced", 
              label: "İleri Seviye", 
              icon: "🌳",
              description: "Compound movements'ı güvenle yapıyorum"
            },
          ],
        },
        {
          id: "injuries",
          type: "cards",
          label: "Mevcut yaralanmaların var mı?",
          multiple: true,
          options: [
            { value: "none", label: "Hiçbiri", icon: "✅" },
            { value: "knee", label: "Diz", icon: "🦵" },
            { value: "lower_back", label: "Alt Sırt", icon: "🫀" },
            { value: "shoulder", label: "Omuz", icon: "💪" },
            { value: "elbow", label: "Dirsek", icon: "🦾" },
            { value: "wrist", label: "Bilek", icon: "✋" },
            { value: "neck", label: "Boyun", icon: "🧠" },
            { value: "ankle", label: "Ayak Bileği", icon: "🦶" },
            { value: "other", label: "Diğer", icon: "⚠️" },
          ],
        },
      ],
    },
    // STEP 4 - Logistics & Equipment
    {
      id: "logistics-equipment",
      title: "Lojistik & Ekipman",
      description: "Antrenman zamanın ve kullanabileceğin ekipmanlar",
      fields: [
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
        {
          id: "trainingTime",
          type: "cards",
          label: "Tercih ettiğin antrenman zamanı nedir?",
          required: true,
          options: [
            { value: "morning", label: "Sabah", icon: "🌅", description: "06-10 arası" },
            { value: "midday", label: "Öğle", icon: "☀️", description: "11-15 arası" },
            { value: "evening", label: "Akşam", icon: "🌆", description: "16-21 arası" },
            { value: "flexible", label: "Esnek", icon: "🕐", description: "Zamanıma göre" },
          ],
        },
        {
          id: "equipment",
          type: "cards",
          label: "Kullanabileceğin ekipmanları seç",
          multiple: true,
          options: [
            { value: "bodyweight", label: "Vücut ağırlığı", icon: "🧘" },
            { value: "dumbbell", label: "Dumbbell", icon: "🏋️" },
            { value: "barbell", label: "Barbell", icon: "🏋️‍♂️" },
            { value: "kettlebell", label: "Kettlebell", icon: "🔔" },
            { value: "resistance_band", label: "Direnç bandı", icon: "🎯" },
            { value: "pullup_bar", label: "Barfiks", icon: "🪜" },
          ],
        },
      ],
    },
    // STEP 5 - Cycle & Preview
    {
      id: "cycle-preview",
      title: "Döngü & Önizleme",
      description: "Son ayarlar ve seçimlerinin özeti",
      fields: [
        {
          id: "targetWeeks",
          type: "cards",
          label: "Kaç haftalık döngü istersin?",
          required: true,
          options: [
            { 
              value: "4", 
              label: "4 Hafta", 
              icon: "📅",
              description: "Hızlı başlangıç"
            },
            { 
              value: "6", 
              label: "6 Hafta", 
              icon: "📆",
              description: "Dengeli gelişim"
            },
            { 
              value: "8", 
              label: "8 Hafta", 
              icon: "🗓️",
              description: "Derinlemesine program"
            },
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
      id: "basic-info-tip",
      trigger: "field_focus",
      fieldId: "ageRange",
      condition: (_, context) => context.currentField === "ageRange",
      content: "💡 Yaş ve hedef, antrenman programını belirleyen en önemli faktörler",
      type: "tip",
    },
    {
      id: "goal-tip",
      trigger: "field_focus",
      fieldId: "goal",
      condition: (_, context) => context.currentField === "goal",
      content: "🎯 Hedefini doğru seçmek, planın içeriğini doğrudan etkiler",
      type: "tip",
    },
    {
      id: "level-tip",
      trigger: "field_focus",
      fieldId: "level",
      condition: (_, context) => context.currentField === "level",
      content: "💪 Seviye belirleme, güvenli ve etkili antrenman için kritik",
      type: "tip",
    },
    {
      id: "injuries-tip",
      trigger: "field_focus",
      fieldId: "injuries",
      condition: (_, context) => context.currentField === "injuries",
      content: "🛡️ Yaralanma bilgisi, güvenli egzersiz seçimi için kritik",
      type: "tip",
    },
    {
      id: "training-time-tip",
      trigger: "field_focus",
      fieldId: "trainingTime",
      condition: (_, context) => context.currentField === "trainingTime",
      content: "⏰ Antrenman zamanı, warm-up süresini etkiler",
      type: "tip",
    },
    {
      id: "equipment-tip",
      trigger: "field_focus",
      fieldId: "equipment",
      condition: (_, context) => context.currentField === "equipment",
      content: "🏋️ Ekipman seçimini çeşitlendirmek daha zengin antrenman önerileri sağlar",
      type: "info",
    },
    {
      id: "days-warning",
      trigger: "field_value",
      fieldId: "daysPerWeek",
      condition: (data) => (data.daysPerWeek as number | undefined) !== undefined && (data.daysPerWeek as number) > 5,
      content: "⚠️ Haftada 5 günden fazla antrenman planlıyorsan dinlenme günlerini iyi planla",
      type: "warning",
    },
    {
      id: "cycle-tip",
      trigger: "field_focus",
      fieldId: "targetWeeks",
      condition: (_, context) => context.currentField === "targetWeeks",
      content: "🔄 Döngü tamamlandığında seviye atlaması önerebiliriz!",
      type: "tip",
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
