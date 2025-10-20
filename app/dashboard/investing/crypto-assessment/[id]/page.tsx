import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth-helpers";
import { getAssessment } from "@/lib/supabase/crypto-assessments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvestmentDecision } from "@/lib/types/investing";

const riskLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

const timeLabels: Record<string, string> = {
  short: "Kısa Vade",
  medium: "Orta Vade",
  long: "Uzun Vade",
};

const decisionLabels: Record<InvestmentDecision, string> = {
  BUY: "AL",
  SELL: "SAT",
  HOLD: "TUT",
  DONT_INVEST: "YATIRIM YAPMA",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function CryptoAssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const result = await getAssessment(id, session.user.id, true);

  if (result.error || !result.data) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Analiz bulunamadı</p>
          <p className="mt-2 text-sm text-text-secondary">
            Bu analiz mevcut değil veya erişim yetkiniz yok.
          </p>
          <Button asChild className="mt-4">
              <Link href="/dashboard/investing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Investing Dashboard&apos;a Dön
              </Link>
          </Button>
        </div>
      </div>
    );
  }

  const assessment = result.data;
  const status = assessment.status;
  const formattedRisk = riskLabels[(assessment.risk_tolerance ?? "").toLowerCase()] ?? assessment.risk_tolerance;
  const formattedTime = timeLabels[(assessment.time_horizon ?? "").toLowerCase()] ?? assessment.time_horizon;

  if (status !== "ready") {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-investing/40 bg-investing-soft p-8 text-center">
          <p className="text-base text-investing">
            Analiz hâlâ hazırlanıyor. Lütfen birkaç saniye sonra tekrar dene.
          </p>
          <Button asChild className="mt-4">
              <Link href="/dashboard/investing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Investing Dashboard&apos;a Dön
              </Link>
          </Button>
        </div>
      </div>
    );
  }

  const assessmentData = assessment.assessment_data;
  const decision = assessmentData?.decision ?? null;
  const decisionLabel = decision ? decisionLabels[decision] ?? decision : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/dashboard" className="hover:text-text-primary">
            Ana Sayfa
          </Link>
          <span>›</span>
          <Link href="/dashboard/investing" className="hover:text-text-primary">
            Investing
          </Link>
          <span>›</span>
          <span className="text-text-secondary/80">Analiz Raporu</span>
        </div>
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          Kripto Analiz Raporu
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Analiz ID: <span className="font-mono text-text-secondary/80">{assessment.id}</span>
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border border-border bg-card text-text-primary shadow-sm">
        <CardHeader>
          <CardTitle>Özet Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-investing/40 bg-investing-soft p-4">
            <p className="text-sm text-text-secondary">Kripto Para</p>
            <p className="text-xl font-semibold">{assessment.crypto_symbol}</p>
            <Badge variant="secondary" className="mt-2 w-fit bg-investing-soft text-investing">
              {decisionLabel ?? "Analiz Tamamlandı"}
            </Badge>
          </div>
          <div className="space-y-2 rounded-xl border border-investing/40 bg-investing-soft p-4">
            <p className="text-sm text-text-secondary">Yatırım Tutarı</p>
            <p className="text-xl font-semibold">{formatCurrency(assessment.investment_amount)}</p>
          </div>
          <div className="space-y-2 rounded-xl border border-investing/40 bg-investing-soft p-4">
            <p className="text-sm text-text-secondary">Risk Toleransı</p>
            <p className="text-lg font-semibold">{formattedRisk}</p>
          </div>
          <div className="space-y-2 rounded-xl border border-investing/40 bg-investing-soft p-4">
            <p className="text-sm text-text-secondary">Zaman Ufku</p>
            <p className="text-lg font-semibold">{formattedTime}</p>
          </div>
          {assessment.notes && (
            <div className="md:col-span-2 space-y-2 rounded-xl border border-investing/40 bg-investing-soft p-4">
              <p className="text-sm text-text-secondary">Notlar</p>
              <p className="text-sm text-text-secondary">{assessment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Details */}
      {assessmentData && (
        <Card className="border border-border bg-card text-text-primary shadow-sm">
          <CardHeader>
            <CardTitle>AI Analiz Detayları</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl border border-investing/40 bg-investing-soft p-4">
                <p className="text-sm text-text-secondary">Karar</p>
                <p className="text-2xl font-bold text-investing">{decisionLabel ?? "Belirsiz"}</p>
                <p className="mt-2 text-sm text-text-secondary/80">
                  Güven skoru: <span className="font-semibold text-text-primary">{assessmentData.confidence}/10</span>
                </p>
                <p className="text-sm text-text-secondary/80">
                  Risk skoru: <span className="font-semibold text-text-primary">{assessmentData.riskScore}/10</span>
                </p>
              </div>

              <div className="rounded-xl border border-investing/40 bg-investing-soft p-4">
                <p className="text-sm text-text-secondary">Fiyat Hedefleri</p>
                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                  <li>Giriş: {formatCurrency(assessmentData.entryPrice)}</li>
                  <li>Hedef: {formatCurrency(assessmentData.targetPrice)}</li>
                  <li>Zarar Durdur: {formatCurrency(assessmentData.stopLoss)}</li>
                  {"takeProfit1" in assessmentData && assessmentData.takeProfit1 && (
                    <li>TP1: {formatCurrency(assessmentData.takeProfit1)}</li>
                  )}
                  {"takeProfit2" in assessmentData && assessmentData.takeProfit2 && (
                    <li>TP2: {formatCurrency(assessmentData.takeProfit2)}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-investing/40 bg-investing-soft p-4">
                <p className="text-sm text-text-secondary">Piyasa Yorumu</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {assessmentData.reasoning || assessmentData.marketContext || "Piyasa yorumu henüz hazırlanmadı."}
                </p>
              </div>

              {Array.isArray(assessmentData.recommendations) && assessmentData.recommendations.length > 0 && (
                <div className="rounded-xl border border-investing/40 bg-investing-soft p-4">
                  <p className="text-sm text-text-secondary">Öneriler</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-secondary">
                    {assessmentData.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessmentData.warnings && assessmentData.warnings.length > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                  <p className="text-sm font-semibold text-destructive">Uyarılar</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-destructive/80">
                    {assessmentData.warnings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

