import { z } from "zod";
import { WORKOUT_EQUIPMENT_VALUES } from "./types";

// Step 1 validation
export const step1Schema = z.object({
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]),
  goal: z.enum(["muscle", "weight_loss", "endurance", "general_fitness"]),
});

// Step 2 validation - Dynamic based on goal
export const muscleDetailsSchema = z.object({
  targetAreas: z.array(z.string()).min(1, "En az bir hedef alan seçmelisin"),
  priority: z.enum(["aesthetic", "strength", "balanced"]),
  phase: z.enum(["bulk", "cut", "recomp"]),
});

export const weightLossDetailsSchema = z.object({
  cardioPreference: z.enum(["love", "tolerate", "dislike"]),
  activityLevel: z.enum(["sedentary", "light", "active"]),
  musclePriority: z.enum(["fast_loss", "preserve", "build"]),
});

export const enduranceDetailsSchema = z.object({
  sportType: z.enum(["running", "cycling", "swimming", "general"]),
  currentLevel: z.enum(["baseline", "moderate", "advanced"]),
  specificGoal: z.string().optional(),
});

export const generalFitnessDetailsSchema = z.object({
  mainFocus: z.enum(["strength", "cardio", "flexibility", "balanced"]),
  lifestyle: z.enum(["desk", "physical", "mixed"]),
});

// Step 3 validation
export const step3Schema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  injuries: z.array(z.string()).default([]),
  injuryDetails: z.string().optional(),
  compoundMovements: z.array(z.string()).optional(),
});

// Step 4 validation
export const step4Schema = z.object({
  daysPerWeek: z.union([z.enum(["3", "4", "5", "6"]), z.number().min(3).max(6)]),
  durationPerDay: z.union([z.enum(["30", "45", "60", "90"]), z.number().min(30).max(90)]),
  trainingTime: z.enum(["morning", "midday", "evening", "flexible"]),
  equipment: z.array(z.enum(WORKOUT_EQUIPMENT_VALUES)).default([]),
});

// Step 5 validation
export const step5Schema = z.object({
  targetWeeks: z.union([z.enum(["4", "6", "8"]), z.number().min(4).max(8)]),
  notes: z.string().optional(),
});

// Full form validation
export const fullFormSchema = z.object({
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]),
  goal: z.enum(["muscle", "weight_loss", "endurance", "general_fitness"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  injuries: z.array(z.string()).default([]),
  injuryDetails: z.string().optional(),
  compoundMovements: z.array(z.string()).optional(),
  daysPerWeek: z.enum(["3", "4", "5", "6"]),
  durationPerDay: z.enum(["30", "45", "60", "90"]),
  trainingTime: z.enum(["morning", "midday", "evening", "flexible"]),
  equipment: z.array(z.enum(WORKOUT_EQUIPMENT_VALUES)).default([]),
  targetWeeks: z.enum(["4", "6", "8"]),
  notes: z.string().optional(),
  // Goal-specific fields
  muscleDetails: z.object({
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
  // Goal-specific validation
  if (data.goal === "muscle") {
    return data.muscleDetails !== undefined;
  }
  if (data.goal === "weight_loss") {
    return data.weightLossDetails !== undefined;
  }
  if (data.goal === "endurance") {
    return data.enduranceDetails !== undefined;
  }
  if (data.goal === "general_fitness") {
    return data.generalFitnessDetails !== undefined;
  }
  return true;
}, {
  message: "Goal-specific details are required",
  path: ["goal"],
});

// Conditional field validation helpers
export const validateInjuryDetails = (injuries: string[], details?: string) => {
  if (injuries.length > 0 && injuries.includes("other") && (!details || details.trim().length === 0)) {
    return "Yaralanma detayları gereklidir";
  }
  return undefined;
};

export const validateCompoundMovements = (level: string, movements?: string[]) => {
  if (level !== "beginner" && (!movements || movements.length === 0)) {
    return "En az bir compound movement seçmelisin";
  }
  return undefined;
};
