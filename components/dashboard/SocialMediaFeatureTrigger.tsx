"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { TriggerElement } from "@/components/dashboard/FeatureModalTrigger";
import { FeatureModalTrigger } from "@/components/dashboard/FeatureModalTrigger";
import socialMediaConfig from "@/lib/configs/social-media.config";

interface SocialMediaFeatureTriggerProps {
  initialData?: Record<string, unknown>;
  children: TriggerElement;
}

export function SocialMediaFeatureTrigger({ children, initialData }: SocialMediaFeatureTriggerProps) {
  const router = useRouter();

  const handleSuccess = useCallback(
    (result: unknown, data: Record<string, unknown>) => {
      void data;
      let projectId: string | null = null;
      if (result && typeof result === "object" && "projectId" in result) {
        const val = (result as { projectId?: unknown }).projectId;
        if (typeof val === "string") {
          projectId = val;
        }
      }

      toast.success("Görsel dönüşümü başlatıldı 🎨", {
        description: "Projen işleniyor, sonuçları yakında göreceksin.",
      });
      router.refresh();
      if (projectId) {
        router.push(`/dashboard/social-media/${projectId}`);
      }
    },
    [router]
  );

  const handleError = useCallback((error: Error, data: Record<string, unknown>) => {
    void data;
    toast.error("Görsel dönüşümü başlatılamadı", {
      description: error.message,
    });
  }, []);

  return (
    <FeatureModalTrigger
      config={socialMediaConfig}
      initialData={initialData}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {children}
    </FeatureModalTrigger>
  );
}

export default SocialMediaFeatureTrigger;
