import {
  getSupabaseServiceClient,
  getSupabaseUserClient,
} from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  WorkoutPlan,
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPlanStatus,
  WorkoutEquipment,
  PlanData,
} from "@/lib/workout/types";
import type { Database } from "@/lib/supabase/database.types";
import type { SportDashboardStats } from "@/lib/types/sport";
import { normalizeWorkoutWeeks } from "@/lib/types/sport";

export class WorkoutPlanError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "WorkoutPlanError";
  }
}

type WorkoutSupabaseClient = SupabaseClient<Database>;

async function getClient({
  privileged = false,
}: { privileged?: boolean } = {}): Promise<WorkoutSupabaseClient> {
  if (privileged) {
    return getSupabaseServiceClient();
  }
  return getSupabaseUserClient();
}

function coercePlan(
  plan: Database["public"]["Tables"]["workout_plans"]["Row"]
): WorkoutPlan {
  const equipment = ((plan.equipment ?? []) as string[]).map((item) =>
    normaliseEquipment(item)
  );

  const base: WorkoutPlan = {
    id: plan.id,
    user_id: plan.user_id,
    goal: (plan.goal as WorkoutGoal) ?? "general_fitness",
    level: (plan.level as WorkoutLevel) ?? "beginner",
    days_per_week: plan.days_per_week ?? 3,
    duration_per_day: plan.duration_per_day ?? 45,
    equipment,
    notes: plan.notes,
    plan_data: (plan.plan_data as PlanData | null) ?? null,
    status: (plan.status as WorkoutPlanStatus) ?? "ready",
    is_active: Boolean(plan.is_active),
    created_at: plan.created_at ?? new Date().toISOString(),
    updated_at: plan.updated_at ?? plan.created_at ?? new Date().toISOString(),
  };

  if (!base.plan_data) {
    return base;
  }

  try {
    const parsed =
      typeof base.plan_data === "string"
        ? (JSON.parse(base.plan_data) as PlanData)
        : base.plan_data;
    return { ...base, plan_data: parsed };
  } catch (error) {
    console.warn("Failed to parse plan_data for plan", plan.id, error);
    return { ...base, plan_data: null };
  }
}

function normaliseEquipment(value: string): WorkoutEquipment {
  switch (value) {
    case "dumbbell":
    case "barbell":
    case "kettlebell":
    case "resistance_band":
    case "pullup_bar":
    case "bodyweight":
      return value;
    default:
      return "bodyweight";
  }
}

export async function getUserActiveWorkoutPlan(
  userId: string
): Promise<WorkoutPlan | null> {
  try {
    const supabase = await getClient({ privileged: true });

    const { data, error } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "ready")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? coercePlan(data) : null;
  } catch (error) {
    console.error("Error fetching active workout plan:", error);
    throw new WorkoutPlanError(
      error instanceof Error ? error.message : "Unknown error",
      "ACTIVE_PLAN_FAILED",
      { userId, originalError: error }
    );
  }
}

export async function getRecentWorkoutPlans(
  userId: string,
  limit = 5
): Promise<WorkoutPlan[]> {
  try {
    const supabase = await getClient({ privileged: true });

    const { data, error } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []).map(coercePlan);
  } catch (error) {
    console.error("Error fetching recent workout plans:", error);
    throw new WorkoutPlanError(
      error instanceof Error ? error.message : "Unknown error",
      "RECENT_PLANS_FAILED",
      { userId, originalError: error }
    );
  }
}

export async function getUserSportStats(
  userId: string
): Promise<SportDashboardStats> {
  try {
    const supabase = await getClient({ privileged: true });

    // Count ALL plans (not just 'ready' status) for accurate stats
    const { data, error } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const plans = (data || []).map(coercePlan);

    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    let totalWorkoutsPlanned = 0;
    let estimatedCompletedWorkouts = 0;

    for (const plan of plans) {
      const weeks = normalizeWorkoutWeeks(plan.plan_data?.weeks);
      const totalDaysPlanned = weeks.length
        ? weeks.reduce((sum, week) => sum + (Array.isArray(week?.days) ? week.days.length : 0), 0)
        : 0;
      const daysInPlan =
        totalDaysPlanned || plan.days_per_week * 4;

      totalWorkoutsPlanned += daysInPlan;

      const createdAt = new Date(plan.created_at);
      const daysSinceStart = Math.max(
        0,
        Math.floor((now - createdAt.getTime()) / 86_400_000)
      );
      estimatedCompletedWorkouts += Math.min(daysInPlan, daysSinceStart);
    }

    const monthlyPlans = plans.filter((plan) => {
      const createdAt = new Date(plan.created_at);
      return createdAt >= startOfMonth;
    }).length;

    return {
      totalPlans: plans.length,
      activePlans: plans.filter((plan) => plan.is_active).length,
      monthlyPlans,
      totalWorkoutsPlanned,
      completedWorkouts: estimatedCompletedWorkouts,
      currentStreakDays: null,
    };
  } catch (error) {
    console.error("Error computing sport stats:", error);
    throw new WorkoutPlanError(
      error instanceof Error ? error.message : "Unknown error",
      "SPORT_STATS_FAILED",
      { userId, originalError: error }
    );
  }
}
