import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import {
  getRecentAssessments,
  getUserInvestingStats,
} from "@/lib/supabase/crypto-assessments";
import type {
  AssessmentData,
  CryptoAssessment,
  InvestmentDecision,
  InvestingDashboardStats,
} from "@/lib/types/investing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CryptoFeatureTrigger } from "@/components/dashboard/CryptoFeatureTrigger";

type PriceSource = "current" | "target" | "unknown";

interface DisplayAssessment {
  id: string;
  symbol: string;
  decision?: InvestmentDecision;
  confidence?: number;
  riskScore?: number;
  entryPrice?: number | null;
  targetPrice?: number | null;
  currentPrice?: number | null;
  currentPriceSource: PriceSource;
  changePercent: number | null;
  createdAt: string;
  createdRelative: string;
  createdExact: string;
  investmentAmount?: number | null;
}

const DECISION_META: Record<
  InvestmentDecision,
  { label: string; className: string; description: string }
> = {
  BUY: {
    label: "AL",
    className: "border-investing/40 bg-investing-soft text-investing",
    description: "Pozitif görünüm",
  },
  SELL: {
    label: "SAT",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    description: "Risk artışı",
  },
  HOLD: {
    label: "TUT",
    className: "border-amber-400/40 bg-amber-100 text-amber-700",
    description: "Nötr görünüm",
  },
  DONT_INVEST: {
    label: "YATIRIM YAPMA",
    className: "border-border/60 bg-surface-muted text-text-secondary",
    description: "Önerilmiyor",
  },
};

const FALLBACK_STATS: InvestingDashboardStats = {
  totalReady: 0,
  monthlyTotal: 0,
  decisionCounts: {
    BUY: 0,
    SELL: 0,
    HOLD: 0,
    DONT_INVEST: 0,
  },
  averageConfidence: null,
};

export default async function InvestingDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  let recentAssessments: CryptoAssessment[] = [];
  let stats: InvestingDashboardStats = FALLBACK_STATS;

  try {
    const [recent, aggregatedStats] = await Promise.all([
      getRecentAssessments(userId, 8),
      getUserInvestingStats(userId),
    ]);
    recentAssessments = recent;
    stats = aggregatedStats;
  } catch (error) {
    console.error("Investing dashboard load error:", error);
    return (
      <div className="space-y-8">
        <DashboardHeader />
        <ErrorState />
      </div>
    );
  }

  const enrichedAssessments = recentAssessments.map(deriveAssessment);
  const hasAssessments =
    stats.totalReady > 0 && enrichedAssessments.length > 0;
  const activeAssessments = enrichedAssessments.slice(0, 4);
  const recentList = enrichedAssessments.slice(
    0,
    Math.min(7, enrichedAssessments.length)
  );

  return (
    <div className="space-y-8">
      <DashboardHeader />
      {hasAssessments ? (
        <>
          <ActiveTrackingsSection
            assessments={activeAssessments}
            totalCount={stats.totalReady}
          />
          <RecentAssessmentsSection assessments={recentList} />
          <StatsSection stats={stats} />
          <ActionCardsSection />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-investing">
        INVESTING
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-text-primary sm:text-4xl">
        Portföyünü yapay zeka destekli risk analizleriyle güçlendir.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-text-secondary">
        Ceku.ai favori kripto varlıklarını izler, piyasa sinyallerini
        yorumlar ve yatırım kararlarını destekleyen öneriler üretir.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <CryptoFeatureTrigger>
          <Button
            type="button"
            className="gap-2 bg-investing px-6 py-2 text-background shadow-lg shadow-investing/30 hover:bg-investing/90"
          >
            Portföy risk analizi başlat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CryptoFeatureTrigger>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-border hover:border-investing hover:text-investing"
        >
          <Link href="/new-dashboard">
            Ana sayfaya dön
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ActiveTrackingsSection({
  assessments,
  totalCount,
}: {
  assessments: DisplayAssessment[];
  totalCount: number;
}) {
  if (assessments.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Aktif Takipler
          </p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">
            En güncel risk değerlendirmelerin
          </h2>
        </div>
        {totalCount > assessments.length && (
          <Link
            href="/investing/assessments"
            className="text-sm font-medium text-investing transition hover:underline"
          >
            Tümünü gör →
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {assessments.map((assessment) => (
          <Link
            key={assessment.id}
            href={`/investing/crypto-assessment/${assessment.id}`}
            className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-investing/60 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-secondary/70">
                    Çift
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-text-primary">
                    {assessment.symbol}
                  </p>
                </div>
                <span className="text-xs text-text-secondary">
                  {assessment.createdRelative}
                </span>
              </div>
              {assessment.decision ? (
                <Badge
                  className={cn(
                    "w-fit border px-3 py-1 text-xs font-semibold tracking-wide",
                    DECISION_META[assessment.decision].className
                  )}
                >
                  {DECISION_META[assessment.decision].label}
                </Badge>
              ) : (
                <Badge className="w-fit border border-border bg-surface-muted px-3 py-1 text-xs text-text-secondary">
                  Analiz hazır
                </Badge>
              )}
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Güncel fiyat</span>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(
                      assessment.currentPrice,
                      assessment.symbol,
                      assessment.currentPriceSource
                    )}
                  </span>
                </div>
                {(() => {
                  const changePercent = assessment.changePercent;
                  if (changePercent == null) return null;
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">
                        Fiyat değişimi
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          changePercent > 0
                            ? "text-investing"
                            : changePercent < 0
                            ? "text-destructive"
                            : "text-text-secondary"
                        )}
                      >
                        {formatPercent(changePercent)}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Giriş fiyatı</span>
                  <span className="font-medium text-text-primary">
                    {formatPrice(assessment.entryPrice, assessment.symbol)}
                  </span>
                </div>
                {assessment.targetPrice !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Hedef fiyat</span>
                    <span className="font-medium text-text-primary">
                      {formatPrice(
                        assessment.targetPrice,
                        assessment.symbol,
                        "target"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <MetricPill
                label="Güven skoru"
                value={
                  assessment.confidence !== undefined
                    ? `${assessment.confidence}/10`
                    : "—"
                }
              />
              <MetricPill
                label="Risk skoru"
                value={
                  assessment.riskScore !== undefined
                    ? `${assessment.riskScore}/10`
                    : "—"
                }
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentAssessmentsSection({
  assessments,
}: {
  assessments: DisplayAssessment[];
}) {
  if (assessments.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Analiz Geçmişi
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Son analiz sonuçların
          </h3>
        </div>
        <Link
          href="/investing/assessments"
          className="text-sm font-medium text-investing transition hover:underline"
        >
          Arşivi aç →
        </Link>
      </div>
      <div className="mt-6 divide-y divide-border">
        {assessments.map((assessment) => {
          const decisionMeta = assessment.decision
            ? DECISION_META[assessment.decision]
            : null;

          return (
            <Link
              key={assessment.id}
              href={`/investing/crypto-assessment/${assessment.id}`}
              className="flex flex-col gap-2 py-4 transition hover:bg-surface-muted/60 sm:grid sm:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr),auto] sm:items-center sm:gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {assessment.symbol}
                </p>
                <p className="text-xs text-text-secondary">
                  {assessment.createdExact}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {decisionMeta ? (
                  <Badge
                    className={cn(
                      "border px-2.5 py-0.5 text-[11px] font-semibold",
                      decisionMeta.className
                    )}
                  >
                    {decisionMeta.label}
                  </Badge>
                ) : (
                  <Badge className="border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] text-text-secondary">
                    Beklemede
                  </Badge>
                )}
                <span className="text-xs text-text-secondary">
                  {assessment.changePercent !== null
                    ? formatPercent(assessment.changePercent)
                    : "Fiyat bilgisi yok"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-investing" />
                  <span>
                    {assessment.confidence !== undefined
                      ? `${assessment.confidence}/10 güven`
                      : "—"}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-text-secondary/70" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: InvestingDashboardStats }) {
  const averageConfidence =
    stats.averageConfidence !== null
      ? `${stats.averageConfidence.toFixed(1)}/10`
      : "—";

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <StatCard
        title="Bu ay tamamlanan analiz"
        value={stats.monthlyTotal.toString()}
        icon={<TrendingUp className="h-5 w-5 text-investing" />}
        description="Son 30 gün içinde oluşturulan risk değerlendirmeleri"
      />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
              Karar Dağılımı
            </p>
            <h4 className="mt-1 text-lg font-semibold text-text-primary">
              Strateji sonuçları
            </h4>
          </div>
          <PieChart className="h-5 w-5 text-investing" />
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          {Object.entries(stats.decisionCounts).map(([decision, count]) => {
            const typedDecision = decision as InvestmentDecision;
            const meta = DECISION_META[typedDecision];
            return (
              <div
                key={decision}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-muted px-3 py-2"
              >
                <span className="text-text-secondary">{meta.label}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {count}
                </span>
              </div>
            );
          })}
        </dl>
      </div>
      <StatCard
        title="Ortalama güven skoru"
        value={averageConfidence}
        icon={<ShieldCheck className="h-5 w-5 text-investing" />}
        description={`${stats.totalReady} analiz üzerinden hesaplandı`}
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
        <div className="rounded-xl bg-investing-soft/80 p-3 text-investing">
          {icon}
        </div>
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
      title: "Crypto Risk Assessment",
      description:
        "Portföyündeki varlıklar için AI destekli risk & getiri analizi yap.",
      href: "/investing/crypto-assessment",
      credit: "2 kredi",
      status: "active" as const,
      icon: <LineChart className="h-5 w-5 text-investing" />,
    },
    {
      title: "Portfolio Analyzer",
      description:
        "Varlık dağılımını ve yatırım hedeflerini dengelemeni sağlayacak araçlar.",
      status: "soon" as const,
      icon: <BarChart3 className="h-5 w-5 text-text-secondary" />,
    },
    {
      title: "Market Insights",
      description:
        "Güncel piyasa sinyalleri ve haber akışını kişisel filtrelerle takip et.",
      status: "soon" as const,
      icon: <Sparkles className="h-5 w-5 text-text-secondary" />,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Yeni Analiz Başlat
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Yatırım araçlarını keşfet
          </h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map((action) =>
          action.status === "active" ? (
            <CryptoFeatureTrigger key={action.title}>
              <button
                type="button"
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-background/60 p-5 shadow-sm transition hover:-translate-y-1 hover:border-investing/60 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-investing-soft/80 p-3 text-investing">
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
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-investing">
                  Analizi başlat
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </CryptoFeatureTrigger>
          ) : action.status === "soon" ? (
            <div
              key={action.title}
              className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-border bg-surface-muted/60 p-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-surface-muted p-3">
                    {action.icon}
                  </div>
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
                Early access listesine katıl
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
            İlk kripto risk analizin seni bekliyor 🚀
          </h3>
          <p className="text-sm text-text-secondary">
            Yatırım hedefini, risk toleransını ve zaman ufkunu belirleyerek
            Ceku.ai’den kişisel bir strateji önerisi al. AI; giriş, hedef ve
            stop-loss seviyelerini hesaplar, güven skorunu analiz eder.
          </p>
          <CryptoFeatureTrigger>
            <Button
              type="button"
              className="mt-2 gap-2 bg-investing px-6 py-3 text-background shadow-md shadow-investing/30 hover:bg-investing/90"
            >
              İlk analizini yap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CryptoFeatureTrigger>
        </div>
        <div className="rounded-2xl border border-investing/40 bg-investing-soft/70 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-investing">
              Örnek çıktı
            </p>
            <Badge className="border border-investing/40 bg-investing-soft px-2 py-0.5 text-[11px] text-investing">
              DEMO
            </Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">BTC/USDT</span>
              <span className="font-semibold text-text-primary">
                +4.8%
              </span>
            </div>
            <div className="grid gap-1 rounded-xl border border-investing/30 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-investing/90">
                AI Önerisi
              </p>
              <p className="text-sm text-text-primary">
                Piyasa likiditesi güçlü, trend pozitif. Volatilite orta
                seviyede. Kademeli alım önerildi.
              </p>
            </div>
            <p className="text-xs text-text-secondary">
              Giriş: 61,200 USD · Hedef: 64,500 USD · Stop: 58,900 USD
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
          Sayfayı yenilemeyi deneyebilir veya yeni bir analiz oluşturarak
          devam edebilirsin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <CryptoFeatureTrigger>
            <Button
              type="button"
              className="gap-2 bg-investing px-6 py-2 text-background shadow-sm hover:bg-investing/90"
            >
              Risk analizi başlat
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CryptoFeatureTrigger>
          <Button
            asChild
            variant="outline"
            className="border-border hover:border-investing hover:text-investing"
          >
            <Link href="/new-dashboard/investing" prefetch={false}>
              Sayfayı yenile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-muted px-3 py-2 text-left">
      <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/80">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function deriveAssessment(assessment: CryptoAssessment): DisplayAssessment {
  const data = assessment.assessment_data as AssessmentData | null;
  const rawData = data as AssessmentData & {
    currentPrice?: number;
    priceTargets?: { currentPrice?: number };
  } | null;

  const entryPrice =
    data?.entryPrice ??
    data?.priceTargets?.entryPrice ??
    rawData?.priceTargets?.entryPrice ??
    null;

  let currentPriceSource: PriceSource = "unknown";
  let currentPrice: number | null = null;

  if (rawData?.currentPrice !== undefined) {
    currentPrice = rawData.currentPrice;
    currentPriceSource = "current";
  } else if (rawData?.priceTargets?.currentPrice !== undefined) {
    currentPrice = rawData.priceTargets.currentPrice;
    currentPriceSource = "current";
  } else if (data?.targetPrice !== undefined) {
    currentPrice = data.targetPrice;
    currentPriceSource = "target";
  } else if (data?.priceTargets?.targetPrice !== undefined) {
    currentPrice = data.priceTargets.targetPrice;
    currentPriceSource = "target";
  }

  const targetPrice =
    data?.targetPrice ??
    data?.priceTargets?.targetPrice ??
    null;

  const changePercent =
    entryPrice && currentPrice
      ? ((currentPrice - entryPrice) / entryPrice) * 100
      : null;

  const confidence = data?.confidence;
  const riskScore = data?.riskScore;

  const createdAt = assessment.created_at;
  const createdRelative = formatRelativeTime(createdAt);
  const createdExact = new Date(createdAt).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const investmentAmount = Number.isFinite(
    Number(assessment.investment_amount)
  )
    ? Number(assessment.investment_amount)
    : null;

  return {
    id: assessment.id,
    symbol: assessment.crypto_symbol,
    decision: data?.decision,
    confidence,
    riskScore,
    entryPrice,
    targetPrice,
    currentPrice,
    currentPriceSource,
    changePercent,
    createdAt,
    createdRelative,
    createdExact,
    investmentAmount,
  };
}

function formatPrice(
  value: number | null | undefined,
  symbol: string,
  source: PriceSource = "current"
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const quoteCurrency = getQuoteCurrency(symbol);

  try {
    const formatted = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: quoteCurrency,
      maximumFractionDigits: 2,
    }).format(value);

    return source === "target" ? `${formatted} (hedef)` : formatted;
  } catch {
    return `${value.toFixed(2)} ${quoteCurrency}`;
  }
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const rounded = Number(value.toFixed(2));
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function getQuoteCurrency(symbol: string): string {
  const [, quote] = symbol.split("/");
  const normalized = quote?.toUpperCase() ?? "USD";

  if (normalized === "USDT") return "USD";
  if (normalized === "TRY") return "TRY";
  if (normalized === "USDC") return "USD";
  return normalized;
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
