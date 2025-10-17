"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type WorkoutExercise = {
  name: string;
  sets: string;
  rest: string;
  target: string;
};

type WorkoutDay = {
  day: string;
  title: string;
  focus: string;
  summary: string;
  exercises: WorkoutExercise[];
};

type WorkoutWeek = {
  label: string;
  days: WorkoutDay[];
};

type WorkoutPlan = {
  id: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  durationPerDay: number;
  equipment: string[];
  notes: string | null;
  planData: {
    weeks: WorkoutWeek[];
  };
};

const goalLabels: Record<string, string> = {
  muscle: "Kas Yapma",
  weight_loss: "Kilo Verme",
  endurance: "Dayanıklılık",
  general: "Genel Fitness",
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
  const planId = searchParams.get("id");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError("Plan kimliği bulunamadı.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchPlan() {
      try {
        const response = await fetch(`/api/workout/plans?id=${planId}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as { plan?: WorkoutPlan; error?: string } | null;

        if (!response.ok || !body?.plan) {
          const message = typeof body?.error === "string" ? body.error : "Plan yüklenemedi.";
          setError(message);
          return;
        }

        setPlan(body.plan);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Workout plan fetch failed:", err);
        setError("Plan yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();

    return () => {
      controller.abort();
    };
  }, [planId]);

  const formattedGoal = plan ? goalLabels[plan.goal] ?? plan.goal : "";
  const formattedLevel = plan ? levelLabels[plan.level] ?? plan.level : "";
  const equipmentList = plan?.equipment ?? [];
  const weeks = plan?.planData?.weeks ?? [];
  const defaultWeek = weeks[0]?.label;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
              Home
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <Link href="/sport" className="text-sm text-gray-500 hover:text-gray-400">
              Sport
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <Link href="/sport/workout-plan" className="text-sm text-gray-500 hover:text-gray-400">
              Egzersiz Programı
            </Link>
            <span className="text-sm text-gray-500 mx-2">›</span>
            <span className="text-sm text-gray-400">Plan</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">Plan Detayları</h1>
            {planId && (
              <p className="text-sm text-gray-400">
                Plan ID: <span className="font-mono text-gray-300">{planId}</span>
              </p>
            )}
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-300">Plan yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="max-w-xl mx-auto">
              <Card className="bg-slate-800 border border-red-500/40">
                <CardContent className="py-10 text-center space-y-4">
                  <h2 className="text-xl font-semibold text-red-400">Bir sorun oluştu</h2>
                  <p className="text-gray-300">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Sayfayı Yenile
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : plan ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-8">
              <motion.div variants={cardVariants}>
                <Card className="bg-white rounded-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800 text-center">📋 Program Özeti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500">Hedef</span>
                          <span className="font-semibold text-gray-900">{formattedGoal}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500">Seviye</span>
                          <span className="font-semibold text-gray-900">{formattedLevel}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500">Haftalık Gün</span>
                          <span className="font-semibold text-gray-900">{plan.daysPerWeek} gün</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500">Günlük Süre</span>
                          <span className="font-semibold text-gray-900">{plan.durationPerDay} dk</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Ekipmanlar</h3>
                          <div className="flex flex-wrap gap-2">
                            {equipmentList.length === 0 ? (
                              <Badge variant="outline">Ekipman gerekmiyor</Badge>
                            ) : (
                              equipmentList.map((item) => (
                                <Badge key={item} variant="outline">
                                  {item}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Notlar</h3>
                          <p className="text-gray-700 text-sm">
                            {plan.notes ? plan.notes : "Not eklenmemiş."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card className="bg-white rounded-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800">Haftalık Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weeks.length === 0 ? (
                      <p className="text-gray-500 text-sm">Bu plan için program bilgisi bulunmuyor.</p>
                    ) : (
                      <Tabs defaultValue={defaultWeek}>
                        <TabsList className="bg-gray-100">
                          {weeks.map((week) => (
                            <TabsTrigger key={week.label} value={week.label}>
                              {week.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {weeks.map((week) => (
                          <TabsContent key={week.label} value={week.label} className="mt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              {week.days.map((day) => (
                                <Card key={`${week.label}-${day.day}`} className="border border-gray-100 shadow-sm">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="secondary">{day.day}</Badge>
                                      <Badge>{day.focus}</Badge>
                                    </div>
                                    <CardTitle className="text-lg text-gray-800 mt-3">{day.title}</CardTitle>
                                    <p className="text-sm text-gray-500">{day.summary}</p>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    {day.exercises.map((exercise) => (
                                      <Tooltip key={exercise.name}>
                                        <TooltipTrigger asChild>
                                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-default">
                                            <div className="flex items-center justify-between">
                                              <span className="font-semibold text-gray-800">{exercise.name}</span>
                                              <span className="text-sm text-gray-500">{exercise.sets}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Dinlenme: {exercise.rest}</p>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-sm">{exercise.target}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} className="flex justify-end gap-3">
                <Button variant="outline" asChild>
                  <Link href="/sport/workout-plan">Yeni Plan Oluştur</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Panele Dön</Link>
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function WorkoutResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-24">
              <p className="text-gray-300">Plan yükleniyor...</p>
            </div>
          </div>
        </div>
      }
    >
      <WorkoutResultContent />
    </Suspense>
  );
}
