"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { TriggerElement } from "@/components/dashboard/FeatureModalTrigger";
import { FeatureModalTrigger } from "@/components/dashboard/FeatureModalTrigger";
import workoutPlanConfig from "@/lib/configs/workout-plan.config";

interface WorkoutFeatureTriggerProps {
  initialData?: Record<string, unknown>;
  children: TriggerElement;
}

export function WorkoutFeatureTrigger({ children, initialData }: WorkoutFeatureTriggerProps) {
  const router = useRouter();

  const handleSuccess = useCallback(
    (result: unknown, data: Record<string, unknown>) => {
      void data;
      let planId: string | null = null;
      if (result && typeof result === "object" && "planId" in result) {
        const val = (result as { planId?: unknown }).planId;
        if (typeof val === "string") {
          planId = val;
        }
      }

      toast.success("Yeni antrenman planı hazır 🏋️", {
        description: "Sport dashboard verilerin yenilendi.",
      });
      router.refresh();
      if (planId) {
        router.push(`/dashboard/sport/workout-plans/${planId}`);
      }
    },
    [router]
  );

  const handleError = useCallback((error: Error, data: Record<string, unknown>) => {
    void data;
    toast.error("Workout plan oluşturulamadı", {
      description: error.message,
    });
  }, []);

  return (
    <FeatureModalTrigger
      config={workoutPlanConfig}
      initialData={initialData}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {children}
    </FeatureModalTrigger>
  );
}

export default WorkoutFeatureTrigger;
