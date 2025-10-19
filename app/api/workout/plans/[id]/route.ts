import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  WORKOUT_EQUIPMENT_VALUES,
  type PlanData,
  type WorkoutGoal,
  type WorkoutLevel,
  type WorkoutPlanStatus,
  type WorkoutEquipment,
} from "@/lib/workout/types";

const paramsSchema = z.object({ id: z.string().uuid("Geçersiz plan kimliği") });

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.string(),
  rest: z.string(),
  target: z.string(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const daySchema = z.object({
  day: z.string(),
  title: z.string(),
  focus: z.string(),
  summary: z.string(),
  exercises: z.array(exerciseSchema),
});

const planDataSchema = z
  .object({
    weeks: z.array(
      z.object({
        label: z.string(),
        days: z.array(daySchema),
      })
    ),
  })
  .strict();

const isValidEquipment = (value: string): value is WorkoutEquipment =>
  WORKOUT_EQUIPMENT_VALUES.includes(value as WorkoutEquipment);

function normalizeEquipment(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is string => typeof item === "string")
    .map((item) => (isValidEquipment(item) ? (item as WorkoutEquipment) : item));
}

function normalizeGoal(value: unknown): WorkoutGoal | string {
  if (typeof value === "string" && ["muscle", "weight_loss", "endurance", "general_fitness"].includes(value)) {
    return value as WorkoutGoal;
  }
  return typeof value === "string" ? value : "general_fitness";
}

function normalizeLevel(value: unknown): WorkoutLevel | string {
  if (typeof value === "string" && ["beginner", "intermediate", "advanced"].includes(value)) {
    return value as WorkoutLevel;
  }
  return typeof value === "string" ? value : "beginner";
}

function normalizeStatus(value: unknown): WorkoutPlanStatus | string {
  if (typeof value !== "string") {
    return "generating";
  }

  const normalized = value.toLowerCase();

  if (["ready", "completed", "complete", "success", "finished"].includes(normalized)) {
    return "ready";
  }

  if (["failed", "error", "errored", "cancelled"].includes(normalized)) {
    return "failed";
  }

  if (["generating", "pending", "processing", "in_progress", "queued"].includes(normalized)) {
    return "generating";
  }

  return normalized;
}

export async function GET(_req: Request, context: unknown) {
  const params = (context as { params?: Record<string, string | string[]> })?.params ?? {};
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parseResult = paramsSchema.safeParse({ id });
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? "Invalid plan id" }, { status: 400 });
  }

  const planId = parseResult.data.id;

  console.log("🗄️ [DB] Fetching workout plan", {
    planId,
    userId: session.user.id,
  });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      "id, user_id, goal, level, days_per_week, duration_per_day, equipment, notes, plan_data, status, is_active, created_at, updated_at"
    )
    .eq("id", planId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("❌ [DB] Error fetching workout plan", {
      planId,
      error: error.message,
    });
    return NextResponse.json({ error: "Failed to fetch workout plan" }, { status: 500 });
  }

  if (!data) {
    console.warn("⚠️ [DB] Plan not found", {
      planId,
      userId: session.user.id,
    });
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  let planData: PlanData | null = null;
  if (data.plan_data) {
    const parsed = planDataSchema.safeParse(data.plan_data);
    if (parsed.success) {
      planData = parsed.data;
    } else {
      console.warn("⚠️ [DB] plan_data failed validation", parsed.error.flatten());
    }
  }

  console.log("📊 [DB] Plan status", {
    planId: data.id,
    status: data.status,
    hasPlanData: Boolean(data.plan_data),
  });

  return NextResponse.json({
    success: true,
    plan: {
      id: data.id,
      goal: normalizeGoal(data.goal),
      level: normalizeLevel(data.level),
      daysPerWeek: data.days_per_week,
      durationPerDay: data.duration_per_day,
      equipment: normalizeEquipment(data.equipment),
      notes: typeof data.notes === "string" ? data.notes : "",
      planData,
      status: normalizeStatus(data.status),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}
