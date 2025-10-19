export type WorkoutGoal = "muscle" | "weight_loss" | "endurance" | "general_fitness";

export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

export type WorkoutPlanStatus = "generating" | "ready" | "failed";

export const WORKOUT_EQUIPMENT_VALUES = [
  "dumbbell",
  "barbell",
  "kettlebell",
  "resistance_band",
  "pullup_bar",
  "bodyweight",
] as const;

export type WorkoutEquipment = (typeof WORKOUT_EQUIPMENT_VALUES)[number];

export interface WorkoutExercise {
  name: string;
  sets: string;
  rest: string;
  target: string;
  notes?: string;
  imageUrl?: string;
}

export interface WorkoutDay {
  day: string;
  title: string;
  focus: string;
  summary: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutWeek {
  label: string;
  days: WorkoutDay[];
}

export interface PlanData {
  weeks: WorkoutWeek[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  days_per_week: number;
  duration_per_day: number;
  equipment: WorkoutEquipment[];
  notes: string | null;
  plan_data: PlanData | null;
  status: WorkoutPlanStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanRequest {
  userId: string;
  planId: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  daysPerWeek: 3 | 4 | 5 | 6;
  durationPerDay: 30 | 45 | 60 | 90;
  equipment: WorkoutEquipment[];
  notes?: string;
}

export interface WorkoutPlanResponse {
  success: boolean;
  planId: string;
  message: string;
  error?: string;
}
