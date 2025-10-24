export type WorkoutGoal = "muscle" | "weight_loss" | "endurance" | "general_fitness";

export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

export type WorkoutPlanStatus = "generating" | "ready" | "failed";

// New comprehensive types for 5-step form
export type AgeRange = "18-25" | "26-35" | "36-45" | "46-55" | "56+";

export type TrainingTime = "morning" | "midday" | "evening" | "flexible";

export type DifficultyFeedback = "too_easy" | "just_right" | "too_hard";

export type CycleStatus = "active" | "completed" | "abandoned";

// Goal-specific detail types
export interface MuscleGoalDetails {
  targetAreas: string[];
  priority: "aesthetic" | "strength" | "balanced";
  phase: "bulk" | "cut" | "recomp";
}

export interface WeightLossDetails {
  cardioPreference: "love" | "tolerate" | "dislike";
  activityLevel: "sedentary" | "light" | "active";
  musclePriority: "fast_loss" | "preserve" | "build";
}

export interface EnduranceDetails {
  sportType: "running" | "cycling" | "swimming" | "general";
  currentLevel: "baseline" | "moderate" | "advanced";
  specificGoal?: string;
}

export interface GeneralFitnessDetails {
  mainFocus: "strength" | "cardio" | "flexibility" | "balanced";
  lifestyle: "desk" | "physical" | "mixed";
}

// Comprehensive form data type
export interface UserTrainingPreferences {
  // Step 1 - Basic Info
  ageRange: AgeRange;
  goal: WorkoutGoal;
  
  // Step 2 - Goal-specific details (one of these will be populated)
  muscleDetails?: MuscleGoalDetails;
  weightLossDetails?: WeightLossDetails;
  enduranceDetails?: EnduranceDetails;
  generalFitnessDetails?: GeneralFitnessDetails;
  
  // Step 3 - Experience & Safety
  level: WorkoutLevel;
  injuries: string[];
  injuryDetails?: string;
  compoundMovements?: string[];
  
  // Step 4 - Logistics & Equipment
  daysPerWeek: 3 | 4 | 5 | 6;
  durationPerDay: 30 | 45 | 60 | 90;
  trainingTime: TrainingTime;
  equipment: WorkoutEquipment[];
  
  // Step 5 - Cycle & Preview
  targetWeeks: 4 | 6 | 8;
  notes?: string;
}

// Cycle context for n8n webhook payload
export interface CycleContext {
  cycleId: string;
  weekNumber: number;
  targetWeeks: number;
  isNewCycle: boolean;
}

// Enhanced workout plan request for n8n webhook
export interface EnhancedWorkoutPlanRequest {
  // Existing fields
  userId: string;
  planId: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  daysPerWeek: 3 | 4 | 5 | 6;
  durationPerDay: 30 | 45 | 60 | 90;
  equipment: WorkoutEquipment[];
  notes?: string;
  
  // New cycle context
  cycleId: string;
  weekNumber: number;
  targetWeeks: number;
  ageRange: AgeRange;
  injuries: string[];
  trainingTime: TrainingTime;
  compoundMovements?: string[];
  
  // Goal-specific details
  muscleGoalDetails?: MuscleGoalDetails;
  weightLossDetails?: WeightLossDetails;
  enduranceDetails?: EnduranceDetails;
  generalFitnessDetails?: GeneralFitnessDetails;
}

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
