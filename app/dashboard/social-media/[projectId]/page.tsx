import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Image as ImageIcon,
  Palette,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import { getSocialMediaProjectDisplay } from "@/lib/supabase/social-media-projects";
import type { SocialMediaProjectDisplay } from "@/lib/types/social-media";
import { getOperationLabel, getOperationIcon, getStatusLabel } from "@/lib/types/social-media";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SocialMediaFeatureTrigger } from "@/components/dashboard/SocialMediaFeatureTrigger";
import { DownloadButton } from "@/components/social-media/DownloadButton";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;
  const { projectId } = await params;

  let project: SocialMediaProjectDisplay | null = null;

  try {
    project = await getSocialMediaProjectDisplay(projectId, userId, true);
  } catch (error) {
    console.error("Project page load error:", error);
    return (
      <div className="space-y-8">
        <ProjectHeader />
        <ErrorState />
      </div>
    );
  }

  if (!project) {
    redirect("/dashboard/social-media");
  }

  return (
    <div className="space-y-8">
      <ProjectHeader project={project} />
      <ImageComparison project={project} />
      <ProjectDetails project={project} />
      <ActionSection />
    </div>
  );
}

function ProjectHeader({ project }: { project?: SocialMediaProjectDisplay }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-business">
            GÖRSEL DÖNÜŞÜM SONUCU
          </p>
          <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
            {project?.project_name || "Görsel Dönüşümü"}
          </h1>
          <p className="text-sm text-text-secondary">
            AI destekli görsel dönüşümü tamamlandı. Sonuçları incele ve indir.
          </p>
          {project && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge className="border border-business/40 bg-business-soft px-3 py-1 text-xs font-semibold text-business">
                {getOperationLabel(project.operation_type)}
              </Badge>
              <Badge
                className={cn(
                  "border px-3 py-1 text-xs font-semibold",
                  project.status === "completed"
                    ? "border-business/40 bg-business-soft text-business"
                    : project.status === "failed"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-amber-400/40 bg-amber-100 text-amber-700"
                )}
              >
                {getStatusLabel(project.status)}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          {project?.status === "completed" && project?.file_path && (
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-text-secondary shadow-inner">
              <p className="font-semibold text-text-primary">7 gün uyarısı</p>
              <p>Bu görsel 7 gün sonra otomatik olarak silinecek.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageComparison({ project }: { project: SocialMediaProjectDisplay }) {
  if (project.status !== "completed" || !project.file_path) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              {project.status === "failed" ? (
                <AlertCircle className="h-8 w-8 text-amber-600" />
              ) : (
                <Clock className="h-8 w-8 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {project.status === "failed" ? "İşlem Başarısız" : "İşlem Devam Ediyor"}
              </h3>
              <p className="text-sm text-text-secondary mt-2">
                {project.status === "failed" 
                  ? project.error_message || "Görsel dönüşümü sırasında bir hata oluştu."
                  : "Görsel dönüşümü işleniyor, lütfen bekleyin..."
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Görsel Karşılaştırması</h2>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CheckCircle2 className="h-4 w-4 text-business" />
          <span>Dönüşüm tamamlandı</span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Original Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-secondary">Orijinal Görsel</span>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src={project.input_image_url}
              alt="Orijinal görsel"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Transformed Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-business" />
            <span className="text-sm font-medium text-text-secondary">
              {getOperationLabel(project.operation_type)} Sonucu
            </span>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src={`/api/social-media/images/${project.id}`}
              alt="Dönüştürülmüş görsel"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <DownloadButton
                projectId={project.id}
                filename={`${project.project_name || 'dönüştürülmüş-görsel'}.png`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectDetails({ project }: { project: SocialMediaProjectDisplay }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Proje Detayları</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Dönüşüm Türü</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getOperationIcon(project.operation_type)}</span>
              <span className="text-sm font-medium text-text-primary">
                {getOperationLabel(project.operation_type)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Oluşturulma Tarihi</span>
            <span className="text-sm font-medium text-text-primary">
              {project.created_exact}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Durum</span>
            <Badge
              className={cn(
                "border px-3 py-1 text-xs font-semibold",
                project.status === "completed"
                  ? "border-business/40 bg-business-soft text-business"
                  : project.status === "failed"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-amber-400/40 bg-amber-100 text-amber-700"
              )}
            >
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">İşlem Bilgileri</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-business/90 mb-2">
              Dönüşüm Süreci
            </p>
            <p className="text-sm text-text-primary">
              Görsel {getOperationLabel(project.operation_type)} stiline dönüştürüldü.
            </p>
          </div>
          {project.status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-business">
              <CheckCircle2 className="h-4 w-4" />
              <span>Dönüşüm başarıyla tamamlandı</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ActionSection() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Yeni Dönüşüm</h3>
          <p className="text-sm text-text-secondary">
            Başka bir görsel dönüşümü yapmak ister misin?
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SocialMediaFeatureTrigger>
            <Button
              type="button"
              className="gap-2 bg-business px-6 py-2 text-background shadow-sm hover:bg-business/90"
            >
              <RefreshCw className="h-4 w-4" />
              Yeni dönüşüm
            </Button>
          </SocialMediaFeatureTrigger>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-border hover:border-business hover:text-business"
          >
            <Link href="/dashboard/social-media">
              Tüm projeler
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
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
          Proje bulunamadı
        </h3>
        <p className="text-sm text-text-secondary">
          Aradığın proje bulunamadı veya erişim yetkin yok.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            className="border-border hover:border-business hover:text-business"
          >
            <Link href="/dashboard/social-media">
              Tüm projeler
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
