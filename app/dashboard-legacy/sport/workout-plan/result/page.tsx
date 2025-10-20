"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type {
  PlanData,
  WorkoutExercise,
  WorkoutWeek,
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPlanStatus,
} from "@/lib/workout/types";

type WorkoutPlanApiResponse = {
  success: boolean;
  plan: {
    id: string;
    goal: WorkoutGoal | string;
    level: WorkoutLevel | string;
    daysPerWeek: number;
    durationPerDay: number;
    equipment: string[];
    notes: string;
    planData: PlanData | null;
    status: WorkoutPlanStatus | string;
    createdAt: string;
    updatedAt: string;
  };
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

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

function WorkoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkoutPlanApiResponse["plan"] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError("Plan kimliği bulunamadı.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/workout/plans/${planId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => null)) as WorkoutPlanApiResponse | { error?: string } | null;

        if (!response.ok || !body || ("success" in body && !body.success) || !("plan" in (body ?? {}))) {
          let message = "Plan yüklenemedi.";
          if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
            message = body.error;
          }
          setError(message);
          return;
        }

        setPlan((body as WorkoutPlanApiResponse).plan);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Plan yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();

    return () => controller.abort();
  }, [planId]);

  const formattedGoal = plan ? goalLabels[plan.goal] ?? plan.goal : "";
  const formattedLevel = plan ? levelLabels[plan.level] ?? plan.level : "";
  const equipmentList = plan?.equipment ?? [];
  const weeks: WorkoutWeek[] = plan?.planData?.weeks ?? [];
  const defaultWeek = weeks[0]?.label;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-primary">
        <p className="text-lg text-text-secondary">Planın hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-primary">
        <div className="max-w-md rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-destructive">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => router.push("/dashboard/sport/workout-plan")}>Geri dön</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  if (plan.status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-primary">
        <p className="text-sm text-text-secondary">Planın hâlâ hazırlanıyor. Lütfen biraz sonra tekrar dene.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">
            Home
          </Link>
          <span className="mx-2 text-sm text-text-secondary">›</span>
          <Link href="/sport" className="text-sm text-text-secondary hover:text-text-primary">
            Sport
          </Link>
          <span className="mx-2 text-sm text-text-secondary">›</span>
          <Link href="/dashboard/sport/workout-plan" className="text-sm text-text-secondary hover:text-text-primary">
            Egzersiz Programı
          </Link>
          <span className="mx-2 text-sm text-text-secondary">›</span>
          <span className="text-sm text-text-secondary/80">Plan</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-text-primary">Plan Detayları</h1>
          <p className="text-sm text-text-secondary">
            Plan ID: <span className="font-mono text-text-secondary/80">{plan.id}</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          <motion.div variants={cardVariants}>
            <Card className="h-full border border-border bg-card shadow-sm">
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
                  <span className="font-semibold text-text-primary">Ekipman:</span> {equipmentList.join(", ") || "Yok"}
                </div>
                {plan.notes && (
                  <div>
                    <span className="font-semibold text-text-primary">Notlar:</span> {plan.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="h-full border border-border bg-card shadow-sm">
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
                  Planı cihazına kaydedebilir, PDF olarak dışa aktarabilir veya yeni hedeflerle tekrar oluşturabilirsin.
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1">PDF İndir</Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/sport/workout-plan")}>Yeni Plan</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10"
        >
          <Tabs defaultValue={defaultWeek ?? weeks[0]?.label ?? ""} className="w-full">
            <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent">
              {weeks.map((week) => (
                <TabsTrigger
                  key={week.label}
                  value={week.label}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-text-secondary transition data-[state=active]:border-sport data-[state=active]:bg-sport-soft data-[state=active]:text-sport data-[state=active]:shadow-sm"
                >
                  {week.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeks.map((week) => (
              <TabsContent key={week.label} value={week.label} className="mt-6 space-y-4">
                {week.days.map((day) => (
                  <motion.div key={day.title} variants={cardVariants}>
                    <Card className="border border-border bg-card shadow-sm">
                      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-2xl text-text-primary">{day.title}</CardTitle>
                          <p className="text-sm text-text-secondary">{day.day} · {day.focus}</p>
                        </div>
                        <Badge variant="outline" className="border-sport/40 bg-sport-soft text-sport">
                          {day.summary}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.exercises.map((exercise: WorkoutExercise) => (
                          <div key={exercise.name} className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface-muted/80 p-4 md:flex-row md:items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-text-primary">{exercise.name}</h3>
                                <Badge variant="secondary" className="bg-sport-soft text-sport">{exercise.target}</Badge>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-secondary md:grid-cols-3">
                                <span><strong className="text-text-primary">Set:</strong> {exercise.sets}</span>
                                <span><strong className="text-text-primary">Dinlenme:</strong> {exercise.rest}</span>
                                {exercise.notes && <span className="col-span-2 md:col-span-1"><strong className="text-text-primary">Not:</strong> {exercise.notes}</span>}
                              </div>
                            </div>

                            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-border/60 bg-surface-muted">
                              {exercise.imageUrl ? (
                                <button onClick={() => setSelectedImage(exercise.imageUrl ?? null)} className="h-full w-full">
                                  <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-cover" />
                                </button>
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
                  </motion.div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/90 p-4 backdrop-blur" onClick={() => setSelectedImage(null)}>
          <div className="relative h-full w-full max-w-3xl">
            <Image src={selectedImage} alt="Egzersiz görseli" fill className="object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-card px-3 py-1 text-sm text-text-primary shadow-sm"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlanResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" /> }>
      <WorkoutResultContent />
    </Suspense>
  );
}
