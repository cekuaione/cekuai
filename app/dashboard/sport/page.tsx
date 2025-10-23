import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Flame,
  Dumbbell,
  Activity,
  CalendarDays,
  Trophy,
  Sparkles,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import {
  getUserActiveWorkoutPlan,
  getRecentWorkoutPlans,
  getUserSportStats,
} from "@/lib/supabase/workout-plans";
import type {
  DisplayWorkoutPlan,
  DisplayWorkoutSummary,
  DisplayScheduleDay,
  SportDashboardStats,
} from "@/lib/types/sport";
import { getGoalLabel, getLevelLabel, normalizeWorkoutWeeks } from "@/lib/types/sport";
import type { WorkoutPlan, WorkoutWeek } from "@/lib/workout/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkoutFeatureTrigger } from "@/components/dashboard/WorkoutFeatureTrigger";

const FALLBACK_WEEKS = 4;

export default async function SportDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  let activePlan: WorkoutPlan | null = null;
  let recentPlans: WorkoutPlan[] = [];
  let stats: SportDashboardStats | null = null;

  try {
    const [active, recent, aggregatedStats] = await Promise.all([
      getUserActiveWorkoutPlan(userId),
      getRecentWorkoutPlans(userId, 6),
      getUserSportStats(userId),
    ]);

    activePlan = active;
    recentPlans = recent;
    stats = aggregatedStats;
  } catch (error) {
    console.error("Sport dashboard load error:", error);
    return (
      <div className="space-y-8">
        <DashboardHeader />
        <ErrorState />
      </div>
    );
  }

  const displayActivePlan = activePlan ? deriveDisplayPlan(activePlan) : null;
  const recentPlanSummaries = recentPlans.map(deriveSummaryPlan);
  const scheduleDays = displayActivePlan
    ? buildSchedule(displayActivePlan)
    : [];

  const hasPlans = recentPlanSummaries.length > 0;
  const hasActivePlan = Boolean(displayActivePlan);

  return (
    <div className="space-y-8">
      <DashboardHeader />
      {hasActivePlan ? (
        <ActivePlanSection plan={displayActivePlan!} />
      ) : null}
      {hasActivePlan && scheduleDays.length > 0 ? (
        <WeeklyScheduleSection
          plan={displayActivePlan!}
          scheduleDays={scheduleDays}
        />
      ) : null}
      {hasPlans ? (
        <RecentPlansSection plans={recentPlanSummaries.slice(0, 5)} />
      ) : null}
      {stats ? <StatsSection stats={stats} /> : null}
      <ActionCardsSection />
      {!hasActivePlan ? <EmptyState /> : null}
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sport">
        SPORT
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-text-primary sm:text-4xl">
        Antrenmanlarını kişiselleştir, ilerlemeni takip et.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-text-secondary">
        Ceku.ai hedeflerine uygun antrenman programları üretir, ilerlemeni takip eder
        ve AI önerileriyle formunu geliştirmene yardımcı olur.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <WorkoutFeatureTrigger>
          <Button
            type="button"
            className="gap-2 bg-sport px-6 py-2 text-background shadow-lg shadow-sport/40 hover:bg-sport/90"
          >
            Yeni workout planı oluştur
            <ArrowRight className="h-4 w-4" />
          </Button>
        </WorkoutFeatureTrigger>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-border hover:border-sport hover:text-sport"
        >
          <Link href="/dashboard">
            Ana sayfaya dön
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ActivePlanSection({ plan }: { plan: DisplayWorkoutPlan }) {
  const weekLabel = `${plan.currentWeekIndex + 1} / ${plan.totalWeeks}`;
  const durationWeeks = plan.totalWeeks || FALLBACK_WEEKS;
  const durationText = `${durationWeeks} hafta`;
  const minutesText = formatMinutes(plan.durationPerDay);
  const daysPerWeekText = `${plan.daysPerWeek} gün / hafta`;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Badge className="border border-sport/40 bg-sport-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sport">
              Güncel plan
            </Badge>
            <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs text-text-secondary">
              {plan.createdRelative}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              {plan.goalLabel}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {plan.levelLabel} seviye · {durationText} · {daysPerWeekText}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge className="border border-sport/30 bg-sport-soft px-3 py-1 text-xs font-semibold text-sport">
              {minutesText}
            </Badge>
            <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              Hafta {weekLabel}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              {plan.completedDays}/{plan.totalDays} antrenman
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>Tamamlanma</span>
              <span className="font-semibold text-text-primary">
                {Math.min(plan.progressPercent, 100)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sport to-sport/80"
                style={{ width: `${Math.min(plan.progressPercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="gap-2 bg-sport px-5 py-2 text-background shadow-sm shadow-sport/40 hover:bg-sport/90"
            >
              <Link href={`/dashboard/sport/workout-plans/${plan.id}`}>
                Bugünün antrenmanı
                <Dumbbell className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border hover:border-sport hover:text-sport"
            >
              <Link href={`/dashboard/sport/workout-plans/${plan.id}`}>
                Planı görüntüle
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid w-full gap-4 rounded-2xl border border-border bg-background/70 p-5 shadow-inner lg:max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-secondary">
              Bu hafta
            </span>
            <CalendarDays className="h-5 w-5 text-sport" />
          </div>
          <div className="space-y-3">
            {plan.currentWeek?.days?.slice(0, 3).map((day, index) => (
              <div
                key={`${plan.id}-preview-${index}`}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-muted px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {day.title || day.day || `Gün ${index + 1}`}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {day.focus || "Genel antrenman"}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-sport" />
              </div>
            ))}
            {!plan.currentWeek?.days?.length ? (
              <p className="text-sm text-text-secondary">
                Plan içeriği hazırlanıyor. Antrenman detaylarını açarak gününe uygun
                önerileri görebilirsin.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function WeeklyScheduleSection({
  plan,
  scheduleDays,
}: {
  plan: DisplayWorkoutPlan;
  scheduleDays: DisplayScheduleDay[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Bu haftanın programı
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            {plan.goalLabel} planının {plan.currentWeekIndex + 1}. haftası
          </h3>
        </div>
        <span className="text-xs text-text-secondary">{plan.createdExact}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {scheduleDays.map((day) => (
          <div
            key={day.id}
            className={cn(
              "flex h-full flex-col justify-between rounded-2xl border p-4 shadow-sm transition",
              day.status === "today"
                ? "border-sport/60 bg-sport-soft/70"
                : "border-border bg-card",
              day.status === "upcoming"
                ? "hover:-translate-y-1 hover:border-sport/40 hover:shadow-md"
                : ""
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  {day.title}
                </p>
                {day.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-investing" />
                ) : day.status === "today" ? (
                  <Flame className="h-4 w-4 text-sport" />
                ) : (
                  <Clock3 className="h-4 w-4 text-text-secondary" />
                )}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                {day.focus}
              </p>
              <p className="text-sm text-text-secondary">{day.summary}</p>
            </div>
            <span
              className={cn(
                "mt-4 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                day.status === "completed"
                  ? "border border-investing/40 bg-investing-soft text-investing"
                  : day.status === "today"
                  ? "border border-sport/40 bg-sport-soft text-sport"
                  : "border border-border bg-surface-muted text-text-secondary"
              )}
            >
              {getScheduleStatusLabel(day.status)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentPlansSection({
  plans,
}: {
  plans: DisplayWorkoutSummary[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Son oluşturduğun planlar
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Geçmiş antrenman programların
          </h3>
        </div>
          <Link
            href="/dashboard/sport/workout-plans"
            className="text-sm font-medium text-sport transition hover:underline"
          >
            Tümünü gör →
          </Link>
      </div>
      <div className="mt-6 divide-y divide-border">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href={`/dashboard/sport/workout-plans/${plan.id}`}
            className="flex flex-col gap-2 py-4 transition hover:bg-surface-muted/60 sm:grid sm:grid-cols-[minmax(0,1.4fr),minmax(0,1fr),auto] sm:items-center sm:gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {plan.goalLabel}
              </p>
              <p className="text-xs text-text-secondary">{plan.createdExact}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <Badge className="border border-border px-2.5 py-0.5 text-[11px]">
                {plan.levelLabel}
              </Badge>
              {plan.isActive ? (
                <Badge className="border border-sport/40 bg-sport-soft px-2.5 py-0.5 text-[11px] text-sport">
                  Aktif
                </Badge>
              ) : null}
            </div>
            <span className="flex items-center gap-2 justify-end text-xs text-text-secondary">
              Planı aç
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: SportDashboardStats }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <StatCard
        title="Toplam plan"
        value={stats.totalPlans.toString()}
        description="Hazırlanan tüm antrenman programların"
        icon={<Activity className="h-5 w-5 text-sport" />}
      />
      <StatCard
        title="Tamamlanan antrenman"
        value="Yakında"
        description="Antrenman tamamlama takibi yakında eklenecek"
        icon={<CheckCircle2 className="h-5 w-5 text-investing" />}
      />
      <StatCard
        title="Aktiflik durumu"
        value={formatStreak(stats.currentStreakDays)}
        description="Güncel istikrar durumun (yakında)"
        icon={<Trophy className="h-5 w-5 text-sport" />}
      />
    </section>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold text-text-primary">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-sport-soft/80 p-3 text-sport">{icon}</div>
      </div>
      <p className="mt-3 text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function ActionCardsSection() {
  const actions: {
    title: string;
    description: string;
    status: "active" | "soon";
    icon: ReactNode;
    href?: string;
    credit?: string;
  }[] = [
    {
      title: "Workout Plan Generator",
      description:
        "Hedeflerine göre kişiselleştirilmiş antrenman planı oluştur ve hemen uygulamaya başla.",
      status: "active",
      credit: "2 kredi",
      icon: <Dumbbell className="h-5 w-5 text-sport" />,
    },
    {
      title: "Nutrition Plan",
      description:
        "Makro hedeflerini ve günlük öğünlerini AI destekli beslenme planı ile planla.",
      status: "soon",
      icon: <Flame className="h-5 w-5 text-text-secondary" />,
    },
    {
      title: "Progress Tracker",
      description:
        "Antrenman ilerlemeni, ölçümlerini ve gelişimini tek ekranda görmeye hazırlan.",
      status: "soon",
      icon: <Sparkles className="h-5 w-5 text-text-secondary" />,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Yeni araçlar
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Antrenman ekosistemini genişlet
          </h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map((action) =>
          action.status === "active" ? (
            <WorkoutFeatureTrigger key={action.title}>
              <button
                type="button"
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-background/60 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sport/50 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-sport-soft/80 p-3 text-sport">
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {action.credit ?? ""}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-text-primary">
                      {action.title}
                    </h4>
                    <p className="mt-2 text-sm text-text-secondary">
                      {action.description}
                    </p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sport">
                  Planı başlat
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </WorkoutFeatureTrigger>
          ) : action.status === "soon" ? (
            <div
              key={action.title}
              className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-border bg-surface-muted/70 p-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-surface-muted p-3">{action.icon}</div>
                  <Badge className="border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase text-text-secondary">
                    Yakında
                  </Badge>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-text-primary">
                    {action.title}
                  </h4>
                  <p className="mt-2 text-sm text-text-secondary">
                    {action.description}
                  </p>
                </div>
              </div>
              <span className="mt-4 text-sm font-medium text-text-secondary">
                Erken erişim yakında açılacak
              </span>
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr),320px] md:items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-text-primary">
            İlk antrenman planını oluştur ve hedeflerine başla 💪
          </h3>
          <p className="text-sm text-text-secondary">
            Hedefini, seviyeni ve mevcut ekipmanını seç. Ceku.ai senin için 4 haftalık
            detaylı bir program hazırlasın; her hareket için set, tekrar ve dinlenme
            süreleri hazır olsun.
          </p>
          <WorkoutFeatureTrigger>
            <Button
              type="button"
              className="mt-2 gap-2 bg-sport px-6 py-3 text-background shadow-md shadow-sport/30 hover:bg-sport/90"
            >
              Plan oluştur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </WorkoutFeatureTrigger>
        </div>
        <div className="rounded-2xl border border-sport/40 bg-sport-soft/70 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-sport">Örnek plan</p>
            <Badge className="border border-sport/40 bg-sport-soft px-2 py-0.5 text-[11px] text-sport">
              DEMO
            </Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Kas Yapımı · Orta</span>
              <span className="font-semibold text-text-primary">4 hafta</span>
            </div>
            <div className="grid gap-1 rounded-xl border border-sport/30 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sport/90">
                Bugünün odağı
              </p>
              <p className="text-sm text-text-primary">
                Göğüs ve triceps odaklı yüksek yoğunluk. Superset kombinasyonları ile güç ve hacim.
              </p>
            </div>
            <p className="text-xs text-text-secondary">
              5 hareket · 4 set · 60 saniye dinlenme · 45 dakika toplam süre
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto max-w-lg space-y-3">
        <h3 className="text-lg font-semibold text-text-primary">
          Veriler yüklenirken bir sorun oluştu
        </h3>
        <p className="text-sm text-text-secondary">
          Sayfayı yenilemeyi deneyebilir veya yeni bir plan oluşturarak devam edebilirsin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <WorkoutFeatureTrigger>
            <Button
              type="button"
              className="gap-2 bg-sport px-6 py-2 text-background shadow-sm hover:bg-sport/90"
            >
              Plan oluştur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </WorkoutFeatureTrigger>
          <Button
            asChild
            variant="outline"
            className="border-border hover:border-sport hover:text-sport"
          >
            <Link href="/dashboard/sport" prefetch={false}>
              Sayfayı yenile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function deriveDisplayPlan(plan: WorkoutPlan): DisplayWorkoutPlan {
  const goalLabel = getGoalLabel(plan.goal);
  const levelLabel = getLevelLabel(plan.level);
  const createdAt = new Date(plan.created_at);
  const createdRelative = formatRelativeTime(createdAt.toISOString());
  const createdExact = createdAt.toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const now = Date.now();
  const daysSinceStart = Math.max(
    0,
    Math.floor((now - createdAt.getTime()) / 86_400_000)
  );

  const planData = plan.plan_data ?? null;
  const weeks = normalizeWorkoutWeeks(planData?.weeks);

  const fallbackDaysPerWeek = plan.days_per_week || 4;
  const weekMeta = calculateWeekMeta(
    weeks,
    fallbackDaysPerWeek,
    daysSinceStart
  );

  const progressPercent = weekMeta.totalDays
    ? Math.round(
        Math.min(1, weekMeta.completedDays / weekMeta.totalDays) * 100
      )
    : 0;

  return {
    id: plan.id,
    goal: plan.goal,
    goalLabel,
    level: plan.level,
    levelLabel,
    daysPerWeek: plan.days_per_week,
    durationPerDay: plan.duration_per_day,
    weeks,
    totalWeeks: weekMeta.totalWeeks,
    totalDays: weekMeta.totalDays,
    completedDays: weekMeta.completedDays,
    progressPercent,
    currentWeekIndex: weekMeta.currentWeekIndex,
    currentDayIndex: weekMeta.currentDayIndex,
    currentWeek:
      weeks[weekMeta.currentWeekIndex] ?? weeks[weeks.length - 1] ?? undefined,
    createdAt: plan.created_at,
    createdRelative,
    createdExact,
    planData,
    isActive: plan.is_active,
  };
}

function deriveSummaryPlan(plan: WorkoutPlan): DisplayWorkoutSummary {
  const goalLabel = getGoalLabel(plan.goal);
  const levelLabel = getLevelLabel(plan.level);
  const createdAt = new Date(plan.created_at);
  const createdRelative = formatRelativeTime(createdAt.toISOString());
  const createdExact = createdAt.toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    id: plan.id,
    goalLabel,
    levelLabel,
    createdRelative,
    createdExact,
    isActive: plan.is_active,
    status: plan.status,
  };
}

function buildSchedule(plan: DisplayWorkoutPlan): DisplayScheduleDay[] {
  const weeks = plan.weeks;
  const fallbackDays = Math.max(1, plan.daysPerWeek || 4);

  const weekDayCounts = weeks.length
    ? weeks.map((week) => Math.max(1, Array.isArray(week.days) ? week.days.length : fallbackDays))
    : new Array(plan.totalWeeks || FALLBACK_WEEKS).fill(fallbackDays);

  const completedBeforeCurrentWeek = weekDayCounts
    .slice(0, plan.currentWeekIndex)
    .reduce((sum, count) => sum + count, 0);

  const currentWeek = plan.currentWeek;
  if (!currentWeek || !Array.isArray(currentWeek.days) || !currentWeek.days.length) {
    return Array.from({ length: fallbackDays }, (_, index) => {
      const globalIndex = completedBeforeCurrentWeek + index;
      const status = deriveScheduleStatus(plan.completedDays, globalIndex);
      return {
        id: `${plan.id}-placeholder-${index}`,
        title: `Gün ${index + 1}`,
        focus: getDefaultFocus(plan.goal),
        summary: "Plan içerikleri hazırlandığında antrenman detayları burada yer alacak.",
        status,
        isToday: status === "today",
        isRestDay: false,
      };
    });
  }

  return currentWeek.days.map((day, index) => {
    const globalIndex = completedBeforeCurrentWeek + index;
    const status = deriveScheduleStatus(plan.completedDays, globalIndex);
    const exercises = day.exercises ?? [];

    let summary = day.summary;
    if (!summary) {
      const parts: string[] = [];
      if (exercises.length) {
        parts.push(`${exercises.length} hareket`);
      }
      if (plan.durationPerDay) {
        parts.push(formatMinutes(plan.durationPerDay));
      }
      summary = parts.join(" · ") || "Program detayı yakında";
    }

    return {
      id: `${plan.id}-${plan.currentWeekIndex}-${index}`,
      title: day.title || day.day || `Gün ${index + 1}`,
      focus: day.focus || getDefaultFocus(plan.goal),
      summary,
      status,
      isToday: status === "today",
      isRestDay: exercises.length === 0,
    };
  });
}

function deriveScheduleStatus(
  completedDays: number,
  globalIndex: number
): "completed" | "today" | "upcoming" {
  if (globalIndex < completedDays) {
    return "completed";
  }
  if (globalIndex === completedDays) {
    return "today";
  }
  return "upcoming";
}

type WeekMeta = {
  weekDayCounts: number[];
  totalDays: number;
  totalWeeks: number;
  currentWeekIndex: number;
  currentDayIndex: number;
  completedDays: number;
};

function calculateWeekMeta(
  weeks: WorkoutWeek[],
  fallbackDaysPerWeek: number,
  daysSinceStart: number
): WeekMeta {
  if (!weeks.length) {
    const totalWeeks = FALLBACK_WEEKS;
    const weekDayCounts = new Array(totalWeeks).fill(Math.max(1, fallbackDaysPerWeek));
    const totalDays = weekDayCounts.reduce((sum, cnt) => sum + cnt, 0);
    const completedDays = Math.min(totalDays, daysSinceStart);
    const weekLength = weekDayCounts[0] ?? 1;
    const currentWeekIndex = Math.min(
      totalWeeks - 1,
      Math.floor(completedDays / weekLength)
    );
    const currentDayIndex = Math.min(
      weekLength - 1,
      completedDays % weekLength
    );

    return {
      weekDayCounts,
      totalDays,
      totalWeeks,
      currentWeekIndex,
      currentDayIndex,
      completedDays,
    };
  }

  const weekDayCounts = weeks.map((week) =>
    Math.max(1, Array.isArray(week.days) ? week.days.length : fallbackDaysPerWeek)
  );
  const totalDays = weekDayCounts.reduce((sum, cnt) => sum + cnt, 0);
  const completedDays = Math.min(totalDays, daysSinceStart);

  let accumulated = 0;
  let currentWeekIndex = 0;
  let currentDayIndex = 0;

  for (let i = 0; i < weekDayCounts.length; i += 1) {
    const nextAccumulated = accumulated + weekDayCounts[i];
    if (completedDays < nextAccumulated) {
      currentWeekIndex = i;
      currentDayIndex = Math.min(
        weekDayCounts[i] - 1,
        Math.max(0, completedDays - accumulated)
      );
      break;
    }
    accumulated = nextAccumulated;
    currentWeekIndex = i;
    currentDayIndex = weekDayCounts[i] - 1;
  }

  return {
    weekDayCounts,
    totalDays,
    totalWeeks: weeks.length,
    currentWeekIndex,
    currentDayIndex,
    completedDays,
  };
}

function formatMinutes(minutes: number): string {
  if (!minutes) return "Süre belirtilmedi";
  return `${minutes} dakika`;
}

function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let diff = (date.getTime() - now.getTime()) / 1000;

  const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: "second" },
    { amount: 60, name: "minute" },
    { amount: 24, name: "hour" },
    { amount: 7, name: "day" },
    { amount: 4.34524, name: "week" },
    { amount: 12, name: "month" },
    { amount: Number.POSITIVE_INFINITY, name: "year" },
  ];

  const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

  for (const division of divisions) {
    if (Math.abs(diff) < division.amount) {
      return rtf.format(Math.round(diff), division.name);
    }
    diff /= division.amount;
  }

  return date.toLocaleDateString("tr-TR");
}

function getDefaultFocus(goal: string): string {
  switch (goal) {
    case "muscle":
      return "Güç ve hipertrofi";
    case "weight_loss":
      return "Yağ yakımı";
    case "endurance":
      return "Kondisyon";
    default:
      return "Genel fitness";
  }
}

function getScheduleStatusLabel(status: DisplayScheduleDay["status"]): string {
  if (status === "completed") return "Tamamlandı";
  if (status === "today") return "Bugün";
  return "Planlandı";
}

function formatStreak(days: number | null): string {
  if (!days || days <= 0) return "Yakında";
  return `${days} gün`;
}
