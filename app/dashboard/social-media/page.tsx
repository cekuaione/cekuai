import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Image as ImageIcon,
  Palette,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import {
  getUserSocialMediaProjects,
  getUserSocialMediaStats,
} from "@/lib/supabase/social-media-projects";
import type {
  SocialMediaProject,
  SocialMediaDashboardStats,
  SocialMediaProjectDisplay,
} from "@/lib/types/social-media";
import { getOperationLabel, getOperationIcon, getStatusLabel, getProjectTypeLabel } from "@/lib/types/social-media";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SocialMediaFeatureTrigger } from "@/components/dashboard/SocialMediaFeatureTrigger";

export default async function SocialMediaDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  let projects: SocialMediaProject[] = [];
  let stats: SocialMediaDashboardStats | null = null;

  try {
    const [userProjects, userStats] = await Promise.all([
      getUserSocialMediaProjects(userId, { limit: 8 }),
      getUserSocialMediaStats(userId),
    ]);

    projects = userProjects;
    stats = userStats;
  } catch (error) {
    console.error("Social media dashboard load error:", error);
    return (
      <div className="space-y-8">
        <DashboardHeader />
        <ErrorState />
      </div>
    );
  }

  const displayProjects = projects.map(enrichProjectDisplay);
  const hasProjects = displayProjects.length > 0;

  return (
    <div className="space-y-8">
      <DashboardHeader />
      {hasProjects ? (
        <>
          <ActiveProjectsSection projects={displayProjects.slice(0, 4)} />
          <RecentProjectsSection projects={displayProjects.slice(0, 7)} />
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
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-business">
        SOCIAL MEDIA
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-text-primary sm:text-4xl">
        Görsellerini AI ile dönüştür, yaratıcılığını keşfet.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-text-secondary">
        Ceku.ai görsellerini anime stilinden yağlı boyaya, cyberpunk&apos;tan fantastik sanata kadar
        farklı sanat stillerine dönüştürür ve yaratıcı projelerini hayata geçirir.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <SocialMediaFeatureTrigger>
          <Button
            type="button"
            className="gap-2 bg-business px-6 py-2 text-background shadow-lg shadow-business/30 hover:bg-business/90"
          >
            Yeni görsel dönüşümü başlat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SocialMediaFeatureTrigger>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-border hover:border-business hover:text-business"
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

function ActiveProjectsSection({ projects }: { projects: SocialMediaProjectDisplay[] }) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Aktif Projeler
          </p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">
            En güncel dönüşüm projelerin
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/social-media/${project.id}`}
            className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-business/60 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-secondary/70">
                    Proje
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {project.project_name || "İsimsiz Proje"}
                  </p>
                </div>
                <span className="text-xs text-text-secondary">
                  {project.created_relative}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg">{getOperationIcon(project.operation_type)}</span>
                <span className="text-sm font-medium text-text-primary">
                  {project.operation_label}
                </span>
              </div>

              <Badge
                className={cn(
                  "w-fit border px-3 py-1 text-xs font-semibold tracking-wide",
                  project.status === "completed"
                    ? "border-business/40 bg-business-soft text-business"
                    : project.status === "failed"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-amber-400/40 bg-amber-100 text-amber-700"
                )}
              >
                {project.status_label}
              </Badge>

              <div className="grid gap-2 text-sm">
                {project.output_image_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Durum</span>
                    <span className="font-semibold text-business">Hazır</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
              <span>Detayları gör</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentProjectsSection({ projects }: { projects: SocialMediaProjectDisplay[] }) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Proje Geçmişi
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Son dönüşüm projelerin
          </h3>
        </div>
      </div>
      <div className="mt-6 divide-y divide-border">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/social-media/${project.id}`}
            className="flex flex-col gap-2 py-4 transition hover:bg-surface-muted/60 sm:grid sm:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr),auto] sm:items-center sm:gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {project.project_name || "İsimsiz Proje"}
              </p>
              <p className="text-xs text-text-secondary">
                {project.created_exact}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getOperationIcon(project.operation_type)}</span>
                <span className="text-xs text-text-secondary">
                  {project.operation_label}
                </span>
              </div>
              <Badge
                className={cn(
                  "border px-2.5 py-0.5 text-[11px] font-semibold",
                  project.status === "completed"
                    ? "border-business/40 bg-business-soft text-business"
                    : project.status === "failed"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-amber-400/40 bg-amber-100 text-amber-700"
                )}
              >
                {project.status_label}
              </Badge>
            </div>
            <div className="flex items-center justify-end gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-business" />
                <span>{project.operation_label}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-text-secondary/70" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: SocialMediaDashboardStats }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <StatCard
        title="Toplam proje"
        value={stats.totalProjects.toString()}
        description="Oluşturulan tüm dönüşüm projeleri"
        icon={<ImageIcon className="h-5 w-5 text-business" />}
      />
      <StatCard
        title="Tamamlanan"
        value={stats.completedProjects.toString()}
        description="Başarıyla tamamlanan projeler"
        icon={<CheckCircle2 className="h-5 w-5 text-business" />}
      />
      <StatCard
        title="Bu ay"
        value={stats.monthlyTotal.toString()}
        description="Son 30 gün içinde oluşturulan projeler"
        icon={<Sparkles className="h-5 w-5 text-business" />}
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
        <div className="rounded-xl bg-business-soft/80 p-3 text-business">
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
    credit?: string;
  }[] = [
    {
      title: "Görsel Dönüşüm",
      description: "AI destekli görsel stil dönüşümü ile yaratıcı projelerini hayata geçir.",
      status: "active",
      credit: "2 kredi",
      icon: <Palette className="h-5 w-5 text-business" />,
    },
    {
      title: "Batch Processing",
      description: "Birden fazla görseli aynı anda dönüştürme özelliği yakında.",
      status: "soon",
      icon: <ImageIcon className="h-5 w-5 text-text-secondary" />,
    },
    {
      title: "Custom Styles",
      description: "Kendi özel stil setlerini oluşturma ve paylaşma özelliği yakında.",
      status: "soon",
      icon: <Sparkles className="h-5 w-5 text-text-secondary" />,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary/70">
            Yeni Dönüşüm Başlat
          </p>
          <h3 className="text-lg font-semibold text-text-primary">
            Yaratıcı araçlarını keşfet
          </h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map((action) =>
          action.status === "active" ? (
            <SocialMediaFeatureTrigger key={action.title}>
              <button
                type="button"
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-background/60 p-5 shadow-sm transition hover:-translate-y-1 hover:border-business/60 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-business-soft/80 p-3 text-business">
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
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-business">
                  Dönüşümü başlat
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </SocialMediaFeatureTrigger>
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
            İlk görsel dönüşümünü yap ve yaratıcılığını keşfet 🎨
          </h3>
          <p className="text-sm text-text-secondary">
            Görselini yükle, stil dönüşümü seç ve AI&apos;nin yaratıcılığını gör. Anime stili, yağlı boya,
            cyberpunk ve daha fazlası ile görsellerini sanat eserlerine dönüştür.
          </p>
          <SocialMediaFeatureTrigger>
            <Button
              type="button"
              className="mt-2 gap-2 bg-business px-6 py-3 text-background shadow-md shadow-business/30 hover:bg-business/90"
            >
              İlk dönüşümü yap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </SocialMediaFeatureTrigger>
        </div>
        <div className="rounded-2xl border border-business/40 bg-business-soft/70 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-business">Örnek dönüşüm</p>
            <Badge className="border border-business/40 bg-business-soft px-2 py-0.5 text-[11px] text-business">
              DEMO
            </Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Anime Stili · Güç 80%</span>
              <span className="font-semibold text-text-primary">Tamamlandı</span>
            </div>
            <div className="grid gap-1 rounded-xl border border-business/30 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-business/90">
                Sonuç
              </p>
              <p className="text-sm text-text-primary">
                Orijinal fotoğraf anime karakterine dönüştürüldü. Yüz özellikleri ve saç stili
                anime tarzında yeniden tasarlandı.
              </p>
            </div>
            <p className="text-xs text-text-secondary">
              İşlem süresi: 45 saniye · Kalite: Yüksek · Format: PNG
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
          Sayfayı yenilemeyi deneyebilir veya yeni bir proje oluşturarak devam edebilirsin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <SocialMediaFeatureTrigger>
            <Button
              type="button"
              className="gap-2 bg-business px-6 py-2 text-background shadow-sm hover:bg-business/90"
            >
              Proje oluştur
              <ArrowRight className="h-4 w-4" />
            </Button>
          </SocialMediaFeatureTrigger>
          <Button
            asChild
            variant="outline"
            className="border-border hover:border-business hover:text-business"
          >
            <Link href="/dashboard/social-media" prefetch={false}>
              Sayfayı yenile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Helper function to enrich project display data
function enrichProjectDisplay(project: SocialMediaProject): SocialMediaProjectDisplay {
  const createdAt = new Date(project.created_at);
  const createdRelative = formatRelativeTime(project.created_at);
  const createdExact = createdAt.toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    id: project.id,
    project_name: project.project_name,
    input_image_url: project.input_image_url,
    output_image_url: project.output_image_url,
    operation_type: project.operation_type,
    operation_label: getOperationLabel(project.operation_type),
    project_type: project.project_type,
    project_type_label: getProjectTypeLabel(project.project_type),
    status: project.status,
    status_label: getStatusLabel(project.status),
    file_path: project.file_path,
    error_message: project.error_message,
    created_at: project.created_at,
    created_relative: createdRelative,
    created_exact: createdExact,
    updated_at: project.updated_at,
  };
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
