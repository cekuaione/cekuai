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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <p className="text-lg">Planın hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-red-200">{error}</p>
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <p className="text-sm text-slate-300">Planın hâlâ hazırlanıyor. Lütfen biraz sonra tekrar dene.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
            Home
          </Link>
          <span className="mx-2 text-sm text-gray-500">›</span>
          <Link href="/sport" className="text-sm text-gray-500 hover:text-gray-400">
            Sport
          </Link>
          <span className="mx-2 text-sm text-gray-500">›</span>
          <Link href="/dashboard/sport/workout-plan" className="text-sm text-gray-500 hover:text-gray-400">
            Egzersiz Programı
          </Link>
          <span className="mx-2 text-sm text-gray-500">›</span>
          <span className="text-sm text-gray-400">Plan</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-white">Plan Detayları</h1>
          <p className="text-sm text-gray-400">
            Plan ID: <span className="font-mono text-gray-300">{plan.id}</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          <motion.div variants={cardVariants}>
            <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <div>
                  <span className="font-semibold text-white">Hedef:</span> {formattedGoal}
                </div>
                <div>
                  <span className="font-semibold text-white">Seviye:</span> {formattedLevel}
                </div>
                <div>
                  <span className="font-semibold text-white">Haftalık Gün:</span> {plan.daysPerWeek}
                </div>
                <div>
                  <span className="font-semibold text-white">Günlük Süre:</span> {plan.durationPerDay} dk
                </div>
                <div>
                  <span className="font-semibold text-white">Ekipman:</span> {equipmentList.join(", ") || "Yok"}
                </div>
                {plan.notes && (
                  <div>
                    <span className="font-semibold text-white">Notlar:</span> {plan.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="h-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">İlerleme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">AI planı hazır</p>
                    <p className="text-xs text-slate-400">Hazırlanma süresi: yaklaşık 30 saniye</p>
                  </div>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
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
                <TabsTrigger key={week.label} value={week.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white data-[state=active]:border-blue-500/60 data-[state=active]:bg-blue-500/10">
                  {week.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeks.map((week) => (
              <TabsContent key={week.label} value={week.label} className="mt-6 space-y-4">
                {week.days.map((day) => (
                  <motion.div key={day.title} variants={cardVariants}>
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-md">
                      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-2xl text-white">{day.title}</CardTitle>
                          <p className="text-sm text-slate-300">{day.day} · {day.focus}</p>
                        </div>
                        <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-100">
                          {day.summary}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.exercises.map((exercise: WorkoutExercise) => (
                          <div key={exercise.name} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-100">{exercise.target}</Badge>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300 md:grid-cols-3">
                                <span><strong>Set:</strong> {exercise.sets}</span>
                                <span><strong>Dinlenme:</strong> {exercise.rest}</span>
                                {exercise.notes && <span className="col-span-2 md:col-span-1"><strong>Not:</strong> {exercise.notes}</span>}
                              </div>
                            </div>

                            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                              {exercise.imageUrl ? (
                                <button onClick={() => setSelectedImage(exercise.imageUrl ?? null)} className="h-full w-full">
                                  <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-cover" />
                                </button>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative h-full w-full max-w-3xl">
            <Image src={selectedImage} alt="Egzersiz görseli" fill className="object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white"
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
    <Suspense fallback={<div className="min-h-screen bg-slate-900" /> }>
      <WorkoutResultContent />
    </Suspense>
  );
}
