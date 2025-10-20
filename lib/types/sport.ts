import type {
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPlan,
  PlanData,
  WorkoutWeek,
  WorkoutDay,
} from "@/lib/workout/types";

export type SportGoal = WorkoutGoal;
export type SportLevel = WorkoutLevel;

export interface SportDashboardStats {
  totalPlans: number;
  activePlans: number;
  monthlyPlans: number;
  totalWorkoutsPlanned: number;
  completedWorkouts: number | null;
  currentStreakDays: number | null;
}

export interface DisplayWorkoutPlan {
  id: WorkoutPlan["id"];
  goal: SportGoal;
  goalLabel: string;
  level: SportLevel;
  levelLabel: string;
  daysPerWeek: number;
  durationPerDay: number;
  weeks: WorkoutWeek[];
  totalWeeks: number;
  totalDays: number;
  completedDays: number;
  progressPercent: number;
  currentWeekIndex: number;
  currentDayIndex: number;
  currentWeek?: WorkoutWeek;
  createdAt: string;
  createdRelative: string;
  createdExact: string;
  planData: PlanData | null;
  isActive: boolean;
}

export interface DisplayWorkoutSummary {
  id: WorkoutPlan["id"];
  goalLabel: string;
  levelLabel: string;
  createdRelative: string;
  createdExact: string;
  isActive: boolean;
  status: WorkoutPlan["status"];
}

export type ScheduleDayStatus = "completed" | "today" | "upcoming";

export interface DisplayScheduleDay {
  id: string;
  title: string;
  focus: string;
  summary: string;
  status: ScheduleDayStatus;
  isToday: boolean;
  isRestDay: boolean;
}

export const SPORT_GOAL_LABELS: Record<SportGoal, string> = {
  muscle: "Kas Yapımı",
  weight_loss: "Kilo Kaybı",
  endurance: "Dayanıklılık",
  general_fitness: "Genel Fitness",
};

export const SPORT_LEVEL_LABELS: Record<SportLevel, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta Seviye",
  advanced: "İleri Seviye",
};

export function getGoalLabel(goal: SportGoal): string {
  return SPORT_GOAL_LABELS[goal] ?? goal;
}

export function getLevelLabel(level: SportLevel): string {
  return SPORT_LEVEL_LABELS[level] ?? level;
}

export function isWorkoutWeek(value: unknown): value is WorkoutWeek {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as WorkoutWeek).days)
  );
}

export function isWorkoutDay(value: unknown): value is WorkoutDay {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as WorkoutDay).title === "string"
  );
}

export function normalizeWorkoutWeeks(value: unknown): WorkoutWeek[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isWorkoutWeek);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter(isWorkoutWeek);
  }

  return [];
}
