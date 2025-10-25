import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Dumbbell, ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkoutGoal, WorkoutLevel, WorkoutPlanStatus } from "@/lib/workout/types";

type WorkoutPlan = {
  id: string;
  goal: WorkoutGoal | string;
  level: WorkoutLevel | string;
  daysPerWeek: number;
  durationPerDay: number;
  equipment: string[];
  notes: string;
  planData: {
    weeks: Array<{
      label: string;
      days: Array<{
        day: string;
        title: string;
        focus: string;
        summary: string;
        exercises: Array<{
          name: string;
          sets: string;
          rest: string;
          target: string;
          notes?: string;
          imageUrl?: string;
        }>;
      }>;
    }>;
  } | null;
  status: WorkoutPlanStatus | string;
  createdAt: string;
  updatedAt: string;
};

const goalLabels: Record<string, string> = {
  muscle: "Kas Yapma",
  weight_loss: "Kilo Verme",
  endurance: "Dayanıklılık",
  general_fitness: "Genel Fitness",
};

const levelLabels: Record<string, string> = {
  beginner: "Yeni Başlayan",
  intermediate: "Orta Seviye",
  advanced: "İleri Seviye",
};

async function getWorkoutPlan(planId: string, userId: string): Promise<WorkoutPlan | null> {
  const supabase = getSupabaseServiceClient();
  
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    goal: data.goal as WorkoutGoal,
    level: data.level as WorkoutLevel,
    daysPerWeek: data.days_per_week,
    durationPerDay: data.duration_per_day,
    equipment: (data.equipment as string[]) || [],
    notes: data.notes || "",
    planData: (() => {
      try {
        if (!data.plan_data) return null;
        if (typeof data.plan_data === "string") {
          return JSON.parse(data.plan_data) as WorkoutPlan["planData"];
        }
        return data.plan_data as WorkoutPlan["planData"];
      } catch (error) {
        console.warn(`Skipping corrupted plan_data for plan ${data.id}:`, error);
        return null;
      }
    })(),
    status: data.status as WorkoutPlanStatus,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
  };
}

export default async function WorkoutPlanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const plan = await getWorkoutPlan(id, session.user.id);

  if (!plan) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Plan bulunamadı</p>
          <p className="mt-2 text-sm text-text-secondary">
            Bu plan mevcut değil veya erişim yetkiniz yok.
          </p>
          <Button asChild className="mt-4">
              <Link href="/dashboard/sport">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sport Dashboard&apos;a Dön
              </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (plan.status !== "ready") {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-investing/40 bg-investing-soft p-8 text-center">
          <p className="text-base text-investing">
            Plan hâlâ hazırlanıyor. Lütfen birkaç saniye sonra tekrar dene.
          </p>
          <Button asChild className="mt-4">
              <Link href="/dashboard/sport">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sport Dashboard&apos;a Dön
              </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formattedGoal = goalLabels[plan.goal] ?? plan.goal;
  const formattedLevel = levelLabels[plan.level] ?? plan.level;
  const weeks = plan.planData?.weeks || [];
  const defaultWeek = weeks[0]?.label;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/dashboard" className="hover:text-text-primary">
            Ana Sayfa
          </Link>
          <span>›</span>
          <Link href="/dashboard/sport" className="hover:text-text-primary">
            Sport
          </Link>
          <span>›</span>
          <span className="text-text-secondary/80">Plan Detayları</span>
        </div>
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          Antrenman Planı Detayları
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Plan ID: <span className="font-mono text-text-secondary/80">{plan.id}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-text-primary">Özet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            <div>
              <span className="font-semibold text-text-primary">Hedef:</span> {formattedGoal}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Seviye:</span> {formattedLevel}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Haftalık Gün:</span> {plan.daysPerWeek}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Günlük Süre:</span> {plan.durationPerDay} dk
            </div>
            <div>
              <span className="font-semibold text-text-primary">Ekipman:</span>{" "}
              {plan.equipment.length > 0 ? plan.equipment.join(", ") : "Yok"}
            </div>
            {plan.notes && (
              <div>
                <span className="font-semibold text-text-primary">Notlar:</span> {plan.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-text-primary">İlerleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sport-soft text-sport">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">AI planı hazır</p>
                <p className="text-xs text-text-secondary/80">Hazırlanma süresi: yaklaşık 30 saniye</p>
              </div>
            </div>
            <div className="rounded-lg border border-sport/30 bg-sport-soft px-4 py-3 text-xs text-sport">
              Planı cihazına kaydedebilir, PDF olarak dışa aktarabilir veya yeni hedeflerle tekrar
              oluşturabilirsin.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" disabled>
                PDF İndir
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/sport">Yeni Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout Plan Details */}
      {weeks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue={defaultWeek} className="w-full">
            <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent">
              {weeks.map((week) => (
                <TabsTrigger
                  key={week.label}
                  value={week.label}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-secondary transition data-[state=active]:border-sport data-[state=active]:bg-sport-soft data-[state=active]:text-sport data-[state=active]:shadow-sm"
                >
                  {week.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeks.map((week) => (
              <TabsContent key={week.label} value={week.label} className="mt-6 space-y-4">
                {week.days.map((day) => (
                  <Card key={day.title} className="border border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-2xl text-text-primary">{day.title}</CardTitle>
                        <p className="text-sm text-text-secondary">
                          {day.day} · {day.focus}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-sport/40 bg-sport-soft text-sport">
                        {day.summary}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {day.exercises.map((exercise) => (
                        <div
                          key={exercise.name}
                          className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface-muted/80 p-4 md:flex-row md:items-center"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-text-primary">
                                {exercise.name}
                              </h3>
                              <Badge variant="secondary" className="bg-sport-soft text-sport">
                                {exercise.target}
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-secondary md:grid-cols-3">
                              <span>
                                <strong className="text-text-primary">Set:</strong> {exercise.sets}
                              </span>
                              <span>
                                <strong className="text-text-primary">Dinlenme:</strong> {exercise.rest}
                              </span>
                              {exercise.notes && (
                                <span className="col-span-2 md:col-span-1">
                                  <strong className="text-text-primary">Not:</strong> {exercise.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-border/60 bg-surface-muted">
                            {exercise.imageUrl ? (
                              <Image
                                src={exercise.imageUrl}
                                alt={exercise.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-secondary">
                                <Dumbbell className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

