import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { UserTrainingPreferences } from "./types";
import type { Json } from "@/lib/supabase/database.types";

export interface TrainingCycle {
  id: string;
  user_id: string;
  cycle_number: number;
  status: "active" | "completed" | "abandoned";
  start_date: string;
  target_weeks: number;
  preferences_snapshot: UserTrainingPreferences;
  total_plans: number;
  completed_plans: number;
  created_at: string;
  updated_at: string;
}

export interface CycleContext {
  cycleId: string;
  weekNumber: number;
  targetWeeks: number;
  isNewCycle: boolean;
}

/**
 * Get the active training cycle for a user
 */
export async function getActiveCycle(userId: string): Promise<TrainingCycle | null> {
  const supabase = getSupabaseServiceClient();
  
  const { data, error } = await supabase
    .from("training_cycles")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("Error fetching active cycle:", error);
    throw new Error("Failed to fetch active cycle");
  }

  return data as TrainingCycle | null;
}

/**
 * Create a new training cycle for a user
 */
export async function createNewCycle(
  userId: string,
  preferences: UserTrainingPreferences,
  targetWeeks: number
): Promise<TrainingCycle> {
  const supabase = getSupabaseServiceClient();
  
  // Get the next cycle number for this user
  const { data: lastCycle, error: lastCycleError } = await supabase
    .from("training_cycles")
    .select("cycle_number")
    .eq("user_id", userId)
    .order("cycle_number", { ascending: false })
    .limit(1)
    .single();

  if (lastCycleError && lastCycleError.code !== "PGRST116") {
    console.error("Error fetching last cycle:", lastCycleError);
    throw new Error("Failed to fetch last cycle");
  }

  const nextCycleNumber = (lastCycle?.cycle_number || 0) + 1;

  const { data, error } = await supabase
    .from("training_cycles")
    .insert({
      user_id: userId,
      cycle_number: nextCycleNumber,
      status: "active",
      start_date: new Date().toISOString(),
      target_weeks: targetWeeks,
      preferences_snapshot: preferences as unknown as Json,
      total_plans: 0,
      completed_plans: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating new cycle:", error);
    throw new Error("Failed to create new cycle");
  }

  return data as unknown as TrainingCycle;
}

/**
 * Increment the week number for an active cycle
 */
export async function incrementCycleWeek(cycleId: string): Promise<number> {
  const supabase = getSupabaseServiceClient();
  
  // Get the current cycle to check target weeks
  const { data: cycle, error: cycleError } = await supabase
    .from("training_cycles")
    .select("target_weeks, total_plans")
    .eq("id", cycleId)
    .single();

  if (cycleError) {
    console.error("Error fetching cycle:", cycleError);
    throw new Error("Failed to fetch cycle");
  }

  // Get the last workout plan for this cycle to determine next week number
  const { data: lastPlan, error: lastPlanError } = await supabase
    .from("workout_plans")
    .select("week_number")
    .eq("cycle_id", cycleId)
    .order("week_number", { ascending: false })
    .limit(1)
    .single();

  if (lastPlanError && lastPlanError.code !== "PGRST116") {
    console.error("Error fetching last plan:", lastPlanError);
    throw new Error("Failed to fetch last plan");
  }

  const nextWeekNumber = (lastPlan?.week_number || 0) + 1;

  // If we've exceeded the target weeks, close the cycle
  if (nextWeekNumber > cycle.target_weeks) {
    await closeCycle(cycleId);
    throw new Error("Cycle completed - maximum weeks reached");
  }

  // Update the total plans count
  await supabase
    .from("training_cycles")
    .update({ 
      total_plans: cycle.total_plans + 1,
      updated_at: new Date().toISOString()
    })
    .eq("id", cycleId);

  return nextWeekNumber;
}

/**
 * Close a training cycle
 */
export async function closeCycle(cycleId: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  
  const { error } = await supabase
    .from("training_cycles")
    .update({ 
      status: "completed",
      updated_at: new Date().toISOString()
    })
    .eq("id", cycleId);

  if (error) {
    console.error("Error closing cycle:", error);
    throw new Error("Failed to close cycle");
  }
}

/**
 * Upsert user training preferences
 */
export async function upsertUserPreferences(
  userId: string,
  preferences: UserTrainingPreferences
): Promise<void> {
  const supabase = getSupabaseServiceClient();
  
  const { error } = await supabase
    .from("user_training_preferences")
    .upsert({
      user_id: userId,
      age_range: preferences.ageRange,
      goal: preferences.goal,
      level: preferences.level,
      injuries: preferences.injuries,
      equipment: preferences.equipment,
      days_per_week: preferences.daysPerWeek,
      duration_per_day: preferences.durationPerDay,
      training_time: preferences.trainingTime,
      compound_movements: preferences.compoundMovements || [],
      notes: preferences.notes,
      muscle_goal_details: preferences.muscleDetails as unknown as Json || null,
      weight_loss_details: preferences.weightLossDetails as unknown as Json || null,
      endurance_details: preferences.enduranceDetails as unknown as Json || null,
      general_fitness_details: preferences.generalFitnessDetails as unknown as Json || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    });

  if (error) {
    console.error("Error upserting user preferences:", error);
    throw new Error("Failed to save user preferences");
  }
}

/**
 * Get cycle context for a user (either existing active cycle or create new one)
 */
export async function getOrCreateCycleContext(
  userId: string,
  preferences: UserTrainingPreferences,
  targetWeeks: number
): Promise<CycleContext> {
  // Check for active cycle
  const activeCycle = await getActiveCycle(userId);
  
  if (activeCycle) {
    // Increment week number for existing cycle
    const weekNumber = await incrementCycleWeek(activeCycle.id);
    
    return {
      cycleId: activeCycle.id,
      weekNumber,
      targetWeeks: activeCycle.target_weeks,
      isNewCycle: false,
    };
  } else {
    // Create new cycle
    const newCycle = await createNewCycle(userId, preferences, targetWeeks);
    
    return {
      cycleId: newCycle.id,
      weekNumber: 1,
      targetWeeks: newCycle.target_weeks,
      isNewCycle: true,
    };
  }
}
