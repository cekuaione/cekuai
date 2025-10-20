"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { TriggerElement } from "@/components/dashboard/FeatureModalTrigger";
import { FeatureModalTrigger } from "@/components/dashboard/FeatureModalTrigger";
import cryptoAssessmentConfig from "@/lib/configs/crypto-assessment.config";

interface CryptoFeatureTriggerProps {
  initialData?: Record<string, unknown>;
  children: TriggerElement;
}

export function CryptoFeatureTrigger({ children, initialData }: CryptoFeatureTriggerProps) {
  const router = useRouter();

  const handleSuccess = useCallback(
    (result: unknown, data: Record<string, unknown>) => {
      void data;
      let assessmentId: string | null = null;
      if (result && typeof result === "object" && "assessmentId" in result) {
        const val = (result as { assessmentId?: unknown }).assessmentId;
        if (typeof val === "string") {
          assessmentId = val;
        }
      }

      toast.success("Yeni kripto analizi hazır 🎯", {
        description: "Yatırım kartların güncellendi.",
      });
      router.refresh();
      if (assessmentId) {
        router.push(`/dashboard/investing/crypto-assessment/${assessmentId}`);
      }
    },
    [router]
  );

  const handleError = useCallback((error: Error, data: Record<string, unknown>) => {
    void data;
    toast.error("Analiz oluşturulamadı", {
      description: error.message,
    });
  }, []);

  return (
    <FeatureModalTrigger
      config={cryptoAssessmentConfig}
      initialData={initialData}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {children}
    </FeatureModalTrigger>
  );
}

export default CryptoFeatureTrigger;
