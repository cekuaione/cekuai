import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  WORKOUT_EQUIPMENT_VALUES,
  type WorkoutPlanRequest,
  type WorkoutEquipment,
} from "@/lib/workout/types";
import { generateWorkoutPlan, type N8nError } from "@/lib/n8n";

const allowableDaysPerWeek = [3, 4, 5, 6] as const;
const allowableDurations = [30, 45, 60, 90] as const;

const requestSchema = z.object({
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
  console.log("🚀 [GENERATE] Starting plan generation");
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
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Validation error" }, { status: 400 });
  }

  const payload = parseResult.data;
  const supabase = getSupabaseServiceClient();
  const sanitizedNotes = payload.notes?.trim() ?? "";

  const { data: newPlan, error: insertError } = await supabase
    .from("workout_plans")
    .insert({
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
    })
    .select("id")
    .single();

  if (insertError || !newPlan) {
    console.error("❌ [GENERATE] Failed to insert plan", insertError);
    return NextResponse.json({ error: "Failed to create workout plan" }, { status: 500 });
  }

  console.log("✅ [GENERATE] Plan created in DB", {
    planId: newPlan.id,
    userId: session.user.id,
    status: "generating",
  });

  const webhookPayload: WorkoutPlanRequest = {
    userId: session.user.id,
    planId: newPlan.id,
    goal: payload.goal,
    level: payload.level,
    daysPerWeek: payload.daysPerWeek,
    durationPerDay: payload.durationPerDay,
    equipment: payload.equipment as WorkoutEquipment[],
    ...(sanitizedNotes ? { notes: sanitizedNotes } : {}),
  };

  console.log("📡 [GENERATE] Triggering webhook", {
    planId: newPlan.id,
    goal: payload.goal,
    level: payload.level,
  });

  try {
    const webhookResult = await generateWorkoutPlan(webhookPayload);
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

  console.log("✅ [GENERATE] Returning response with planId", { planId: newPlan.id });
  return NextResponse.json({ success: true, planId: newPlan.id, status: "generating" }, { status: 201 });
}
