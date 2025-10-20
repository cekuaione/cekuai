"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  AssessmentStatus,
  CryptoAssessment,
  InvestmentDecision,
} from "@/lib/types/investing";

type AssessmentResponse = {
  assessment?: CryptoAssessment;
  error?: string;
};

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

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
}

function AssessmentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<CryptoAssessment | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      setError("Analiz kimliği bulunamadı.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/crypto-assessments/${assessmentId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => null)) as AssessmentResponse | null;

        if (!response.ok || !body?.assessment) {
          const message = body?.error ?? "Analiz yüklenemedi.";
          setError(message);
          return;
        }

        setAssessment(body.assessment);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Analiz yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();

    return () => controller.abort();
  }, [assessmentId]);

  const status: AssessmentStatus | string = assessment?.status ?? "unknown";
  const formattedRisk = riskLabels[(assessment?.risk_tolerance ?? "").toLowerCase()] ?? assessment?.risk_tolerance;
  const formattedTime = timeLabels[(assessment?.time_horizon ?? "").toLowerCase()] ?? assessment?.time_horizon;

  const assessmentData = useMemo(() => assessment?.assessment_data ?? null, [assessment]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-emerald-950 text-white">
        <p className="text-lg">Analiz raporu hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-emerald-950 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-red-200">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => router.push("/dashboard/investing/crypto-assessment")}>
              Geri dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  if (status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-emerald-950 text-white">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center">
          <p className="text-base text-emerald-200">
            Analiz hâlâ hazırlanıyor. Lütfen birkaç saniye sonra tekrar dene.
          </p>
        </div>
      </div>
    );
  }

  const decision = assessmentData?.decision ?? null;
  const decisionLabel = decision ? decisionLabels[decision] ?? decision : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-emerald-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
            Home
          </Link>
          <span className="mx-2 text-sm text-slate-500">›</span>
          <Link href="/investing" className="text-sm text-slate-500 hover:text-slate-300">
            Investing
          </Link>
          <span className="mx-2 text-sm text-slate-500">›</span>
          <Link href="/dashboard/investing/crypto-assessment" className="text-sm text-slate-500 hover:text-slate-300">
            Kripto Analizi
          </Link>
          <span className="mx-2 text-sm text-slate-500">›</span>
          <span className="text-sm text-slate-300">Sonuç</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-white">Kripto Analiz Raporu</h1>
          <p className="text-sm text-slate-400">
            Analiz ID: <span className="font-mono text-slate-300">{assessment.id}</span>
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={cardVariants}>
            <Card className="border-emerald-500/20 bg-slate-950/70 text-white backdrop-blur">
              <CardHeader>
                <CardTitle>Özet Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-slate-400">Kripto Para</p>
                  <p className="text-xl font-semibold">{assessment.crypto_symbol}</p>
                  <Badge variant="secondary" className="mt-2 w-fit bg-emerald-700/40 text-emerald-100">
                    {decisionLabel ?? "Analiz Tamamlandı"}
                  </Badge>
                </div>
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-slate-400">Yatırım Tutarı</p>
                  <p className="text-xl font-semibold">{formatCurrency(assessment.investment_amount)}</p>
                </div>
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-slate-400">Risk Toleransı</p>
                  <p className="text-lg font-semibold">{formattedRisk}</p>
                </div>
                <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-slate-400">Zaman Ufku</p>
                  <p className="text-lg font-semibold">{formattedTime}</p>
                </div>
                {assessment.notes && (
                  <div className="md:col-span-2 space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm text-slate-400">Notlar</p>
                    <p className="text-sm text-slate-200">{assessment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {assessmentData && (
            <motion.div variants={cardVariants}>
              <Card className="border-emerald-500/20 bg-slate-950/70 text-white backdrop-blur">
                <CardHeader>
                  <CardTitle>AI Analiz Detayları</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-sm text-slate-400">Karar</p>
                      <p className="text-2xl font-bold text-emerald-300">{decisionLabel ?? "Belirsiz"}</p>
                      <p className="mt-2 text-sm text-slate-300">
                        Güven skoru: <span className="font-semibold text-white">{assessmentData.confidence}/10</span>
                      </p>
                      <p className="text-sm text-slate-300">
                        Risk skoru: <span className="font-semibold text-white">{assessmentData.riskScore}/10</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-sm text-slate-400">Fiyat Hedefleri</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
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
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-sm text-slate-400">Piyasa Yorumu</p>
                      <p className="mt-2 text-sm text-slate-200">{assessmentData.marketContext}</p>
                    </div>

                    {Array.isArray(assessmentData.recommendations) && assessmentData.recommendations.length > 0 && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-sm text-slate-400">Öneriler</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-200">
                          {assessmentData.recommendations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {assessmentData.warnings && assessmentData.warnings.length > 0 && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <p className="text-sm text-red-200">Uyarılar</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-red-100">
                          {assessmentData.warnings.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function CryptoAssessmentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-950 to-emerald-950" />}>
      <AssessmentResultContent />
    </Suspense>
  );
}
