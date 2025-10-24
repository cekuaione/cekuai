import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  WORKOUT_EQUIPMENT_VALUES,
  type WorkoutPlanRequest,
  type WorkoutEquipment,
  type EnhancedWorkoutPlanRequest,
  type UserTrainingPreferences,
} from "@/lib/workout/types";
import { generateWorkoutPlanWithContext, type N8nError } from "@/lib/n8n";
import {
  upsertUserPreferences,
  getOrCreateCycleContext,
} from "@/lib/workout/cycle-manager";

const allowableDaysPerWeek = [3, 4, 5, 6] as const;
const allowableDurations = [30, 45, 60, 90] as const;
const allowableTargetWeeks = [4, 6, 8] as const;

// Enhanced request schema for the new 5-step form
const enhancedRequestSchema = z.object({
  // Existing fields (keep these for backward compatibility)
  goal: z.enum(["muscle", "weight_loss", "endurance", "general_fitness"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.union([
    z.literal(allowableDaysPerWeek[0]),
    z.literal(allowableDaysPerWeek[1]),
    z.literal(allowableDaysPerWeek[2]),
    z.literal(allowableDaysPerWeek[3]),
  ]),
  durationPerDay: z.union([
    z.literal(allowableDurations[0]),
    z.literal(allowableDurations[1]),
    z.literal(allowableDurations[2]),
    z.literal(allowableDurations[3]),
  ]),
  equipment: z
    .array(z.enum(WORKOUT_EQUIPMENT_VALUES))
    .max(WORKOUT_EQUIPMENT_VALUES.length)
    .optional()
    .default([]),
  notes: z
    .string()
    .trim()
    .max(500, "Notlar en fazla 500 karakter olabilir")
    .optional(),
  
  // New fields from 5-step form
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]).optional(),
  injuries: z.array(z.string()).optional().default([]),
  trainingTime: z.enum(["morning", "midday", "evening", "flexible"]).optional(),
  compoundMovements: z.array(z.string()).optional().default([]),
  targetWeeks: z.union([
    z.literal(allowableTargetWeeks[0]),
    z.literal(allowableTargetWeeks[1]),
    z.literal(allowableTargetWeeks[2]),
  ]).optional(),
  injuryDetails: z.string().optional(),
  
  // Goal-specific details (optional, will be validated based on goal)
  muscleGoalDetails: z.object({
    targetAreas: z.array(z.string()),
    priority: z.enum(["aesthetic", "strength", "balanced"]),
    phase: z.enum(["bulk", "cut", "recomp"]),
  }).optional(),
  weightLossDetails: z.object({
    cardioPreference: z.enum(["love", "tolerate", "dislike"]),
    activityLevel: z.enum(["sedentary", "light", "active"]),
    musclePriority: z.enum(["fast_loss", "preserve", "build"]),
  }).optional(),
  enduranceDetails: z.object({
    sportType: z.enum(["running", "cycling", "swimming", "general"]),
    currentLevel: z.enum(["baseline", "moderate", "advanced"]),
    specificGoal: z.string().optional(),
  }).optional(),
  generalFitnessDetails: z.object({
    mainFocus: z.enum(["strength", "cardio", "flexibility", "balanced"]),
    lifestyle: z.enum(["desk", "physical", "mixed"]),
  }).optional(),
}).refine((data) => {
  // If injuries includes "other", injuryDetails must be provided
  if (data.injuries.includes("other") && (!data.injuryDetails || data.injuryDetails.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Yaralanma detayları gereklidir",
  path: ["injuryDetails"],
}).refine((data) => {
  // Goal-specific details validation
  if (data.goal === "muscle" && !data.muscleGoalDetails) {
    return false;
  }
  if (data.goal === "weight_loss" && !data.weightLossDetails) {
    return false;
  }
  if (data.goal === "endurance" && !data.enduranceDetails) {
    return false;
  }
  if (data.goal === "general_fitness" && !data.generalFitnessDetails) {
    return false;
  }
  return true;
}, {
  message: "Goal-specific details are required",
  path: ["goal"],
});

// Legacy request schema for backward compatibility
const legacyRequestSchema = z.object({
  goal: z.enum(["muscle", "weight_loss", "endurance", "general_fitness"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.union([
    z.literal(allowableDaysPerWeek[0]),
    z.literal(allowableDaysPerWeek[1]),
    z.literal(allowableDaysPerWeek[2]),
    z.literal(allowableDaysPerWeek[3]),
  ]),
  durationPerDay: z.union([
    z.literal(allowableDurations[0]),
    z.literal(allowableDurations[1]),
    z.literal(allowableDurations[2]),
    z.literal(allowableDurations[3]),
  ]),
  equipment: z
    .array(z.enum(WORKOUT_EQUIPMENT_VALUES))
    .max(WORKOUT_EQUIPMENT_VALUES.length)
    .optional()
    .default([]),
  notes: z
    .string()
    .trim()
    .max(500, "Notlar en fazla 500 karakter olabilir")
    .optional(),
});

export async function POST(req: NextRequest) {
  console.log("🚀 [GENERATE] Starting enhanced plan generation");
  console.log("🔧 [CONFIG] Environment check", {
    hasWebhookUrl: Boolean(process.env.N8N_WEBHOOK_URL),
    webhookUrlPreview: process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL.slice(0, 40)}...` : null,
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
    console.log("📥 [API] Received body:", JSON.stringify(body, null, 2));
  } catch {
    console.error("❌ [API] Invalid JSON payload");
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Try enhanced schema first, fallback to legacy
  let payload: z.infer<typeof enhancedRequestSchema> | z.infer<typeof legacyRequestSchema>;
  let isEnhanced = false;
  
  const enhancedParseResult = enhancedRequestSchema.safeParse(body);
  if (enhancedParseResult.success) {
    payload = enhancedParseResult.data;
    isEnhanced = true;
    console.log("✅ [API] Using enhanced schema");
  } else {
    console.log("❌ [API] Enhanced schema validation failed:", enhancedParseResult.error.issues);
    const legacyParseResult = legacyRequestSchema.safeParse(body);
    if (legacyParseResult.success) {
      payload = legacyParseResult.data;
      isEnhanced = false;
      console.log("✅ [API] Using legacy schema");
    } else {
      console.log("❌ [API] Legacy schema validation also failed:", legacyParseResult.error.issues);
      const issue = enhancedParseResult.error.issues[0] || legacyParseResult.error.issues[0];
      return NextResponse.json({ error: issue?.message ?? "Validation error" }, { status: 400 });
    }
  }

  const supabase = getSupabaseServiceClient();
  const sanitizedNotes = payload.notes?.trim() ?? "";

  try {
    let cycleContext = null;
    
    if (isEnhanced) {
      console.log("🔄 [GENERATE] Processing enhanced request with cycles");
      
      // Step 1: Upsert user preferences
      const enhancedPayload = payload as z.infer<typeof enhancedRequestSchema>;
      const preferences: UserTrainingPreferences = {
        ageRange: enhancedPayload.ageRange || "26-35",
        goal: enhancedPayload.goal,
        level: enhancedPayload.level,
        daysPerWeek: enhancedPayload.daysPerWeek,
        durationPerDay: enhancedPayload.durationPerDay,
        equipment: enhancedPayload.equipment,
        injuries: enhancedPayload.injuries || [],
        trainingTime: enhancedPayload.trainingTime || "flexible",
        compoundMovements: enhancedPayload.compoundMovements || [],
        targetWeeks: enhancedPayload.targetWeeks || 6,
        notes: sanitizedNotes,
        muscleDetails: enhancedPayload.muscleGoalDetails,
        weightLossDetails: enhancedPayload.weightLossDetails,
        enduranceDetails: enhancedPayload.enduranceDetails,
        generalFitnessDetails: enhancedPayload.generalFitnessDetails,
      };

      await upsertUserPreferences(session.user.id, preferences);
      console.log("✅ [GENERATE] User preferences saved");

      // Step 2: Get or create cycle context
      cycleContext = await getOrCreateCycleContext(
        session.user.id,
        preferences,
        enhancedPayload.targetWeeks || 6
      );
      console.log("✅ [GENERATE] Cycle context created", cycleContext);
    }

    // Step 3: Create workout plan
    const planData: {
      user_id: string;
      goal: string;
      level: string;
      days_per_week: number;
      duration_per_day: number;
      equipment: string[];
      notes: string;
      plan_data: null;
      status: string;
      is_active: boolean;
      cycle_id?: string;
      week_number?: number;
    } = {
      user_id: session.user.id,
      goal: payload.goal,
      level: payload.level,
      days_per_week: payload.daysPerWeek,
      duration_per_day: payload.durationPerDay,
      equipment: payload.equipment,
      notes: sanitizedNotes,
      plan_data: null,
      status: "generating",
      is_active: true,
    };

    // Add cycle context if available
    if (cycleContext) {
      planData.cycle_id = cycleContext.cycleId;
      planData.week_number = cycleContext.weekNumber;
    }

    const { data: newPlan, error: insertError } = await supabase
      .from("workout_plans")
      .insert(planData)
      .select("id")
      .single();

    if (insertError || !newPlan) {
      console.error("❌ [GENERATE] Failed to insert plan", insertError);
      return NextResponse.json({ error: "Failed to create workout plan" }, { status: 500 });
    }

    console.log("✅ [GENERATE] Plan created in DB", {
      planId: newPlan.id,
      userId: session.user.id,
      cycleId: cycleContext?.cycleId,
      weekNumber: cycleContext?.weekNumber,
      status: "generating",
    });

    // Step 4: Prepare webhook payload
    let webhookPayload: WorkoutPlanRequest | EnhancedWorkoutPlanRequest;
    
    if (isEnhanced && cycleContext) {
      // Enhanced payload with cycle context
      const enhancedPayload = payload as z.infer<typeof enhancedRequestSchema>;
      webhookPayload = {
        userId: session.user.id,
        planId: newPlan.id,
        goal: enhancedPayload.goal,
        level: enhancedPayload.level,
        daysPerWeek: enhancedPayload.daysPerWeek,
        durationPerDay: enhancedPayload.durationPerDay,
        equipment: enhancedPayload.equipment as WorkoutEquipment[],
        ...(sanitizedNotes ? { notes: sanitizedNotes } : {}),
        // Cycle context
        cycleId: cycleContext.cycleId,
        weekNumber: cycleContext.weekNumber,
        targetWeeks: cycleContext.targetWeeks,
        ageRange: enhancedPayload.ageRange || "26-35",
        injuries: enhancedPayload.injuries || [],
        trainingTime: enhancedPayload.trainingTime || "flexible",
        compoundMovements: enhancedPayload.compoundMovements || [],
        // Goal-specific details
        muscleGoalDetails: enhancedPayload.muscleGoalDetails,
        weightLossDetails: enhancedPayload.weightLossDetails,
        enduranceDetails: enhancedPayload.enduranceDetails,
        generalFitnessDetails: enhancedPayload.generalFitnessDetails,
      } as EnhancedWorkoutPlanRequest;
    } else {
      // Legacy payload
      webhookPayload = {
        userId: session.user.id,
        planId: newPlan.id,
        goal: payload.goal,
        level: payload.level,
        daysPerWeek: payload.daysPerWeek,
        durationPerDay: payload.durationPerDay,
        equipment: payload.equipment as WorkoutEquipment[],
        ...(sanitizedNotes ? { notes: sanitizedNotes } : {}),
      } as WorkoutPlanRequest;
    }

    console.log("📡 [GENERATE] Triggering webhook", {
      planId: newPlan.id,
      goal: payload.goal,
      level: payload.level,
      isEnhanced,
      hasCycleContext: !!cycleContext,
    });

    // Step 5: Trigger n8n webhook
    try {
      const webhookResult = await generateWorkoutPlanWithContext(webhookPayload);
      console.log("📥 [GENERATE] Webhook response received", webhookResult);
    } catch (error) {
      await supabase
        .from("workout_plans")
        .update({ status: "failed" })
        .eq("id", newPlan.id);

      const n8nError = error as N8nError;
      const message = n8nError?.message ?? "Failed to trigger AI workflow";
      const statusCode = typeof n8nError?.statusCode === "number" ? n8nError.statusCode : 502;

      console.error("❌ [GENERATE] Webhook call failed", {
        planId: newPlan.id,
        message,
        statusCode,
      });

      return NextResponse.json({ error: message }, { status: statusCode });
    }

    // Step 6: Return response
    const responseData: Record<string, unknown> = {
      success: true,
      planId: newPlan.id,
      status: "generating",
      message: "Plan oluşturuluyor...",
    };

    if (cycleContext) {
      responseData.cycleId = cycleContext.cycleId;
      responseData.weekNumber = cycleContext.weekNumber;
    }

    console.log("✅ [GENERATE] Returning response", responseData);
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error("❌ [GENERATE] Unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
