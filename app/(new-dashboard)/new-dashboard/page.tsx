import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Activity,
  Dumbbell,
  Flame,
  LineChart,
  PieChart,
  Sparkles,
} from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import {
  getUserActiveWorkoutPlan,
  getRecentWorkoutPlans,
  getUserSportStats,
} from "@/lib/supabase/workout-plans";
import {
  getUserCryptoAssessments,
  getUserInvestingStats,
} from "@/lib/supabase/crypto-assessments";
import type { WorkoutPlan } from "@/lib/workout/types";
import type { CryptoAssessment } from "@/lib/types/investing";
import { normalizeWorkoutWeeks } from "@/lib/types/sport";
import type { SportDashboardStats } from "@/lib/types/sport";
import type { InvestingDashboardStats } from "@/lib/types/investing";
import type { FeatureUsage, RecentActivity } from "@/lib/types/dashboard";
import { CreditBadge } from "@/components/dashboard/CreditBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_FEATURES: FeatureUsage[] = [
  {
    key: "sport-workout",
    label: "Workout Plan Generator",
    category: "sport",
    count: 0,
    href: "/dashboard/sport/workout-plan",
    icon: "🏋️",
    accentClass: "text-sport",
  },
  {
    key: "investing-risk",
    label: "Crypto Risk Assessment",
    category: "investing",
    count: 0,
    href: "/investing/crypto-assessment",
    icon: "💰",
    accentClass: "text-investing",
  },
];

export default async function NewDashboardHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;
  const displayName = session.user.name || session.user.email || "Ceku kullanıcı";
  const firstName = displayName.split(" ")[0] ?? "Ceku";

  const today = new Date();
  const formattedDate = today.toLocaleDateString("tr-TR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [sportStatsResult, investingStatsResult, activePlanResult, recentPlansResult, recentAssessmentsResult] =
    await Promise.allSettled([
      getUserSportStats(userId),
      getUserInvestingStats(userId),
      getUserActiveWorkoutPlan(userId),
      getRecentWorkoutPlans(userId, 5),
      getUserCryptoAssessments(userId, { limit: 5 }),
    ]);

  const sportStats =
    sportStatsResult.status === "fulfilled"
      ? sportStatsResult.value
      : null;
  const investingStats =
    investingStatsResult.status === "fulfilled"
      ? investingStatsResult.value
      : null;
  const activeWorkoutPlan =
    activePlanResult.status === "fulfilled"
      ? activePlanResult.value
      : null;
  const recentPlans =
    recentPlansResult.status === "fulfilled"
      ? recentPlansResult.value ?? []
      : [];
  const recentAssessments =
    recentAssessmentsResult.status === "fulfilled"
      ? recentAssessmentsResult.value ?? []
      : [];

  const workoutSummary = activeWorkoutPlan
    ? buildWorkoutSummary(activeWorkoutPlan)
    : null;
  const investingSummary = buildInvestingSummary(
    recentAssessments,
    investingStats
  );

  const featureUsage = buildFeatureUsage(
    sportStats,
    investingStats
  );
  const recentActivities = buildRecentActivities(
    recentPlans,
    recentAssessments
  );

  const totalMonthlyActivities =
    (sportStats?.monthlyPlans ?? 0) + (investingStats?.monthlyTotal ?? 0);
  const estimatedCreditsUsed =
    (sportStats?.totalPlans ?? 0) * 2 + (investingStats?.totalReady ?? 0) * 2;
  const streakDays = sportStats?.currentStreakDays ?? null;
  const achievements = computeAchievement(
    sportStats,
    investingStats
  );

  const showEmptyState =
    !workoutSummary &&
    !investingSummary.hasData &&
    recentActivities.length === 0;

  return (
    <div className="space-y-8">
      <HeroSection
        firstName={firstName}
        formattedDate={formattedDate}
      />

      {showEmptyState ? (
        <>
          <EmptyState />
          <QuickActionsSection />
        </>
      ) : (
        <>
          {featureUsage.length > 0 ? (
            <MostUsedFeaturesSection features={featureUsage.slice(0, 4)} />
          ) : null}

          {recentActivities.length > 0 ? (
            <RecentActivitySection activities={recentActivities.slice(0, 8)} />
          ) : null}

          <ActiveSummariesSection
            workout={workoutSummary}
            investing={investingSummary}
          />

          <StatsOverviewSection
            totalMonthlyActivities={totalMonthlyActivities}
            creditsUsed={estimatedCreditsUsed}
            streakDays={streakDays}
            achievement={achievements}
          />

          <QuickActionsSection />
        </>
      )}
    </div>
  );
}

function HeroSection({
  firstName,
  formattedDate,
}: {
  firstName: string;
  formattedDate: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card px-6 py-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-secondary/80">
            {formattedDate}
          </p>
          <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
            Merhaba, {firstName}
          </h1>
          <p className="text-sm text-text-secondary">
            Günlük odaklı başlayalım. Hedeflerin burada yaşıyor. Sport ve investing
            aktivitelerin tek ekranda.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              asChild
              className="gap-2 bg-sport px-4 py-2 text-background shadow-sm shadow-sport/30 hover:bg-sport/90"
            >
              <Link href="/dashboard/sport/workout-plan">
                Bugünün antrenmanı
                <Dumbbell className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border hover:border-investing hover:text-investing"
            >
              <Link href="/investing/crypto-assessment">
                Yeni risk analizi
                <LineChart className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <CreditBadge />
          <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-text-secondary shadow-inner">
            <p className="font-semibold text-text-primary">Hızlı özet</p>
            <p>Sport ve Investing panellerinde son aktivite güncellemeleri hazır.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MostUsedFeaturesSection({
  features,
}: {
  features: FeatureUsage[];
}) {
  if (!features.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
          🔥 En Çok Kullandığın Araçlar
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Link
            key={feature.key}
            href={feature.href}
            className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-border/70 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span aria-hidden className="text-2xl">{feature.icon}</span>
                <Badge className="border border-border bg-surface-muted px-2 py-0.5 text-[11px] text-text-secondary">
                  {feature.category === "sport" ? "Sport" : feature.category === "investing" ? "Investing" : "Genel"}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {feature.label}
                </h3>
                <p className="text-sm text-text-secondary">
                  {feature.count > 0
                    ? `${feature.count} kez kullanıldı`
                    : "Hemen dene"}
                </p>
              </div>
            </div>
            <span className={cn("mt-6 inline-flex items-center gap-2 text-sm font-medium transition group-hover:gap-3", feature.accentClass)}>
              Keşfet
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentActivitySection({
  activities,
}: {
  activities: RecentActivity[];
}) {
  if (!activities.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
          📊 Son Aktiviteler
        </h2>
        <span className="text-xs text-text-secondary">Son 7 kayıt</span>
      </div>
      <div className="mt-6 space-y-4">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={activity.href}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-4 transition hover:border-border hover:bg-background/90"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-2xl">{activity.icon}</span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {activity.title}
                </p>
                <p className="text-xs text-text-secondary">
                  {activity.description}
                </p>
              </div>
            </div>
            <span className="text-xs text-text-secondary">{activity.relativeTime}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActiveSummariesSection({
  workout,
  investing,
}: {
  workout: ReturnType<typeof buildWorkoutSummary> | null;
  investing: InvestingSummary;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Aktif Antrenman Planı
          </h3>
          <Badge className="border border-sport/40 bg-sport-soft px-3 py-1 text-[11px] text-sport">
            Sport
          </Badge>
        </div>
        {workout ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                {workout.goalLabel}
              </p>
              <p className="text-sm text-text-secondary">
                {workout.levelLabel} · {workout.weekLabel} hafta · {workout.completedLabel}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Tamamlanma</span>
                <span className="font-semibold text-text-primary">
                  {workout.progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sport to-sport/80"
                  style={{ width: `${Math.min(workout.progressPercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="gap-2 bg-sport px-4 py-2 text-background shadow-sm hover:bg-sport/90"
              >
                <Link href={workout.primaryHref}>
                  Bugünün antrenmanı
                  <Dumbbell className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="gap-2 border-border hover:border-sport hover:text-sport"
              >
                <Link href={workout.secondaryHref}>
                  Planı görüntüle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <EmptySummary
            title="Hazır plan yok"
            description="Hedeflerine uygun yeni bir plan oluşturarak başlayabilirsin."
            primaryLabel="Plan oluştur"
            primaryHref="/dashboard/sport/workout-plan"
            accent="sport"
          />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Portföy Durumu
          </h3>
          <Badge className="border border-investing/40 bg-investing-soft px-3 py-1 text-[11px] text-investing">
            Investing
          </Badge>
        </div>
        {investing.hasData ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                {investing.latestSymbol} · {investing.latestDecisionLabel}
              </p>
              <p className="text-sm text-text-secondary">
                {investing.count} aktif takip · Güven {investing.latestConfidence}
              </p>
            </div>
            <div className="rounded-xl border border-investing/40 bg-investing-soft/70 px-4 py-3 text-sm text-investing">
              Son değerlendirme {investing.latestRelativeTime} tamamlandı.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="gap-2 bg-investing px-4 py-2 text-background shadow-sm hover:bg-investing/90"
              >
                <Link href="/investing/crypto-assessment">
                  Yeni analiz başlat
                  <LineChart className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="gap-2 border-border hover:border-investing hover:text-investing"
              >
                <Link href="/new-dashboard/investing">
                  Detayları aç
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <EmptySummary
            title="Henüz analiz yok"
            description="Kripto portföyün için risk analizi yaparak ilk değerlendirmeni oluştur."
            primaryLabel="Analiz başlat"
            primaryHref="/investing/crypto-assessment"
            accent="investing"
          />
        )}
      </div>
    </section>
  );
}

function StatsOverviewSection({
  totalMonthlyActivities,
  creditsUsed,
  streakDays,
  achievement,
}: {
  totalMonthlyActivities: number;
  creditsUsed: number;
  streakDays: number | null;
  achievement: AchievementSummary;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <StatsCard
        title="Bu ayki aktivite"
        value={totalMonthlyActivities.toString()}
        description="Sport ve Investing panellerinde tamamlanan işlemler"
        icon={<Activity className="h-5 w-5 text-link" />}
      />
      <StatsCard
        title="Kullanılan kredi"
        value={creditsUsed.toString()}
        description="Analiz ve plan oluşturma işlemlerinde harcanan krediler"
        icon={<PieChart className="h-5 w-5 text-investing" />}
      />
      <StatsCard
        title="Aktiflik serisi"
        value={streakDays ? `${streakDays} gün` : "Yakında"}
        description="Ardışık günlerde platformu kullanma hedefi"
        icon={<Flame className="h-5 w-5 text-sport" />}
      />
      <StatsCard
        title={achievement.title}
        value={achievement.value}
        description={achievement.description}
        icon={<Sparkles className="h-5 w-5 text-business" />}
      />
    </section>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
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
        <div className="rounded-xl bg-background/60 p-3 text-text-secondary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function QuickActionsSection() {
  const actions = [
    {
      title: "Sport",
      description: "Kişisel workout planları, ilerleme takibi ve koçluk.",
      href: "/new-dashboard/sport",
      accent: "text-sport",
      badge: null,
      icon: "🏋️",
    },
    {
      title: "Investing",
      description: "Kripto risk analizi, portföy takibi ve öneriler.",
      href: "/new-dashboard/investing",
      accent: "text-investing",
      badge: null,
      icon: "💰",
    },
    {
      title: "Business",
      description: "Ekip içi otomasyon ve karar destek araçları yakında.",
      href: "/new-dashboard/business",
      accent: "text-business",
      badge: "Yakında",
      icon: "📊",
    },
    {
      title: "Education",
      description: "Öğrenme akışları ve kişisel eğitim koçluğu yakında.",
      href: "/new-dashboard/education",
      accent: "text-education",
      badge: "Yakında",
      icon: "🎓",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
          Hızlı erişim
        </h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={cn(
              "group flex h-full flex-col justify-between rounded-2xl border p-5 shadow-sm transition",
              action.badge ? "border-dashed border-border text-text-secondary" : "border-border bg-background/60"
            )}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span aria-hidden className="text-2xl">{action.icon}</span>
                {action.badge ? (
                  <Badge className="border border-border bg-surface-muted px-3 py-1 text-[11px] text-text-secondary">
                    {action.badge}
                  </Badge>
                ) : null}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {action.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {action.description}
                </p>
              </div>
            </div>
            <span className={cn("mt-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition group-hover:gap-3", action.accent)}>
              Keşfet
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptySummary({
  title,
  description,
  primaryLabel,
  primaryHref,
  accent,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  accent: "sport" | "investing";
}) {
  const accentClass = accent === "sport" ? "bg-sport text-background" : "bg-investing text-background";

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">{title}</p>
        <p className="mt-1">{description}</p>
      </div>
      <Button asChild className={cn("px-4 py-2", accentClass)}>
        <Link href={primaryHref}>
          {primaryLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr),320px] md:items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-text-primary">
            Ceku.ai platformuna hoş geldin! İlk adımını atalım.
          </h3>
          <p className="text-sm text-text-secondary">
            Sport ile kişisel antrenman planlarını oluştur, Investing ile kripto portföyünü güvenle yönet. Hazır olduğunda aşağıdaki seçeneklerden birini seçerek başlayabilirsin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2 bg-sport px-4 py-2 text-background shadow-sm">
              <Link href="/dashboard/sport/workout-plan">
                Plan oluştur
                <Dumbbell className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border hover:border-investing hover:text-investing"
            >
              <Link href="/investing/crypto-assessment">
                Analiz başlat
                <LineChart className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <p className="text-sm font-semibold text-text-primary">
            Neler göreceksin?
          </p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>• Antrenman planı ilerlemen ve haftalık program</li>
            <li>• Kripto portföy risk analizi ve öneriler</li>
            <li>• En çok kullandığın araçlara tek dokunuşla erişim</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

type InvestingSummary = {
  hasData: boolean;
  count: number;
  latestSymbol: string;
  latestDecisionLabel: string;
  latestConfidence: string;
  latestRelativeTime: string;
};

type AchievementSummary = {
  title: string;
  value: string;
  description: string;
};

function buildWorkoutSummary(plan: WorkoutPlan): {
  goalLabel: string;
  levelLabel: string;
  weekLabel: string;
  completedLabel: string;
  progressPercent: number;
  primaryHref: string;
  secondaryHref: string;
} {
  const goalLabel = formatGoal(plan.goal);
  const levelLabel = formatLevel(plan.level);
  const createdAt = new Date(plan.created_at ?? Date.now());
  const daysSinceStart = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 86_400_000)
  );
  const weeks = normalizeWorkoutWeeks(plan.plan_data?.weeks);
  const fallbackDaysPerWeek = Math.max(1, plan.days_per_week || 4);
  const totalWeeks = Math.max(1, weeks.length || 4);
  const weekDayCounts = weeks.length
    ? weeks.map((week) => Math.max(1, Array.isArray(week.days) ? week.days.length : fallbackDaysPerWeek))
    : new Array(totalWeeks).fill(fallbackDaysPerWeek);
  const totalDays = weekDayCounts.reduce((sum, count) => sum + count, 0);
  const completedDays = Math.min(totalDays, daysSinceStart);

  let remainingDays = completedDays;
  let currentWeekIndex = 0;
  for (let index = 0; index < weekDayCounts.length; index += 1) {
    const weekLength = weekDayCounts[index];
    if (remainingDays <= 0) {
      currentWeekIndex = index;
      break;
    }
    if (remainingDays < weekLength) {
      currentWeekIndex = index;
      break;
    }
    remainingDays -= weekLength;
    currentWeekIndex = Math.min(weekDayCounts.length - 1, index + 1);
  }

  const currentWeek = Math.min(totalWeeks, currentWeekIndex + 1);
  const progressPercent = totalDays
    ? Math.round((completedDays / totalDays) * 100)
    : 0;

  return {
    goalLabel,
    levelLabel,
    weekLabel: `${currentWeek}/${totalWeeks}`,
    completedLabel: `${completedDays}/${totalDays} antrenman`,
    progressPercent,
    primaryHref: `/new-dashboard/sport/workout-plans/${plan.id}`,
    secondaryHref: `/dashboard/plans/${plan.id}`,
  };
}

function buildInvestingSummary(
  assessments: CryptoAssessment[],
  stats: InvestingDashboardStats | null
): InvestingSummary {
  if (!assessments.length) {
    return {
      hasData: false,
      count: stats?.totalReady ?? 0,
      latestSymbol: "",
      latestDecisionLabel: "",
      latestConfidence: "",
      latestRelativeTime: "",
    };
  }

  const latest = assessments[0];
  const decisionLabel = formatDecision(latest.assessment_data?.decision);
  const confidenceLabel = latest.assessment_data?.confidence
    ? `${latest.assessment_data.confidence}/10`
    : "—";

  return {
    hasData: true,
    count: stats?.totalReady ?? assessments.length,
    latestSymbol: latest.crypto_symbol,
    latestDecisionLabel: decisionLabel,
    latestConfidence: confidenceLabel,
    latestRelativeTime: formatRelativeTime(latest.created_at),
  };
}

function buildFeatureUsage(
  sportStats: SportDashboardStats | null,
  investingStats: InvestingDashboardStats | null
): FeatureUsage[] {
  const usage: FeatureUsage[] = [
    {
      key: "sport-workout",
      label: "Workout Plan Generator",
      category: "sport",
      count: sportStats?.totalPlans ?? 0,
      href: "/dashboard/sport/workout-plan",
      icon: "🏋️",
      accentClass: "text-sport",
    },
    {
      key: "investing-risk",
      label: "Crypto Risk Assessment",
      category: "investing",
      count: investingStats?.totalReady ?? 0,
      href: "/investing/crypto-assessment",
      icon: "💰",
      accentClass: "text-investing",
    },
  ];

  const enriched = usage.filter((item) => item.count > 0);
  if (!enriched.length) {
    return DEFAULT_FEATURES;
  }

  return enriched.sort((a, b) => b.count - a.count);
}

function buildRecentActivities(
  plans: WorkoutPlan[],
  assessments: CryptoAssessment[]
): RecentActivity[] {
  const planActivities: RecentActivity[] = plans.map((plan) => ({
    id: plan.id,
    category: "sport",
    title: `${formatGoal(plan.goal)} planı oluşturuldu`,
    description: `${formatLevel(plan.level)} · ${formatMinutes(plan.duration_per_day)}`,
    timestamp: plan.created_at ?? new Date().toISOString(),
    relativeTime: formatRelativeTime(plan.created_at ?? new Date().toISOString()),
    href: `/dashboard/plans/${plan.id}`,
    icon: "🏋️",
    accentClass: "text-sport",
  }));

  const assessmentActivities: RecentActivity[] = assessments.map((assessment) => ({
    id: assessment.id,
    category: "investing",
    title: `${assessment.crypto_symbol} risk analizi`,
    description: `${formatDecision(assessment.assessment_data?.decision)} · Güven ${assessment.assessment_data?.confidence ?? "—"}`,
    timestamp: assessment.created_at,
    relativeTime: formatRelativeTime(assessment.created_at),
    href: `/new-dashboard/investing/crypto-assessment/${assessment.id}`,
    icon: "💰",
    accentClass: "text-investing",
  }));

  return [...planActivities, ...assessmentActivities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function computeAchievement(
  sportStats: SportDashboardStats | null,
  investStats: InvestingDashboardStats | null
): AchievementSummary {
  const totalPlans = sportStats?.totalPlans ?? 0;
  const totalAssessments = investStats?.totalReady ?? 0;

  if (totalPlans + totalAssessments >= 10) {
    return {
      title: "Başarı rozeti",
      value: "Explorer",
      description: "10'dan fazla aktivite tamamladın. Harika ilerliyorsun!",
    };
  }

  if (totalPlans >= 3) {
    return {
      title: "Sport Başarısı",
      value: "3+ plan",
      description: "Sport alanında istikrarlı bir şekilde ilerliyorsun.",
    };
  }

  if (totalAssessments >= 3) {
    return {
      title: "Investing Başarısı",
      value: "3 analiz",
      description: "Portföyünü aktif şekilde takip ediyorsun.",
    };
  }

  return {
    title: "İlk adımlar",
    value: "Keşfet",
    description: "Yeni araçları denerken ilerlemeni burada göreceksin.",
  };
}

function formatGoal(goal: string | undefined): string {
  switch (goal) {
    case "muscle":
      return "Kas Yapımı";
    case "weight_loss":
      return "Kilo Kaybı";
    case "endurance":
      return "Dayanıklılık";
    case "general_fitness":
    default:
      return "Genel Fitness";
  }
}

function formatLevel(level: string | undefined): string {
  switch (level) {
    case "beginner":
      return "Başlangıç";
    case "intermediate":
      return "Orta Seviye";
    case "advanced":
      return "İleri Seviye";
    default:
      return "Seviye";
  }
}

function formatDecision(decision: string | undefined): string {
  switch (decision) {
    case "BUY":
      return "AL";
    case "SELL":
      return "SAT";
    case "HOLD":
      return "TUT";
    case "DONT_INVEST":
      return "YATIRIM YAPMA";
    default:
      return "Bilinmiyor";
  }
}

function formatMinutes(minutes: number | undefined | null): string {
  if (!minutes) return "Süre belirtilmedi";
  return `${minutes} dk`;
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
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
