import type { WorkoutPlanRequest, WorkoutPlanResponse, EnhancedWorkoutPlanRequest } from "@/lib/workout/types";

export type N8nError = {
  message: string;
  code?: string;
  statusCode?: number;
};

const WEBHOOK_TIMEOUT = 45_000; // 45 seconds
const DEFAULT_WEBHOOK_URL = "https://cekuai.duckdns.org/webhook/workout-plan-generate";

type ResolvedWebhookUrl = {
  url: string;
  fromEnv: boolean;
};

function resolveWebhookUrl(): ResolvedWebhookUrl {
  const raw = process.env.N8N_WEBHOOK_URL?.trim();

  if (raw) {
    return { url: raw, fromEnv: true };
  }

  return { url: DEFAULT_WEBHOOK_URL, fromEnv: false };
}

/**
 * Generate workout plan via n8n webhook with enhanced payload.
 * @throws N8nError when the webhook call fails or returns an error response.
 */
export async function generateWorkoutPlan(
  payload: WorkoutPlanRequest,
): Promise<WorkoutPlanResponse> {
  return generateWorkoutPlanWithContext(payload);
}

/**
 * Generate workout plan via n8n webhook with cycle context and enhanced payload.
 * @throws N8nError when the webhook call fails or returns an error response.
 */
export async function generateWorkoutPlanWithContext(
  payload: WorkoutPlanRequest | EnhancedWorkoutPlanRequest,
): Promise<WorkoutPlanResponse> {
  const { url: webhookUrl, fromEnv } = resolveWebhookUrl();

  if (!webhookUrl) {
    throw new Error("N8N_WEBHOOK_URL environment variable is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    console.log("📡 [GENERATE] Sending webhook request", {
      url: webhookUrl,
      hasWebhookEnv: fromEnv,
      payloadPreview: {
        userId: payload.userId,
        planId: payload.planId,
        goal: payload.goal,
        level: payload.level,
        cycleId: 'cycleId' in payload ? payload.cycleId : undefined,
        weekNumber: 'weekNumber' in payload ? payload.weekNumber : undefined,
        targetWeeks: 'targetWeeks' in payload ? payload.targetWeeks : undefined,
        isEnhanced: 'cycleId' in payload,
      },
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("❌ [GENERATE] Webhook request failed", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw {
        message: `Webhook request failed: ${response.statusText}`,
        statusCode: response.status,
        code: errorText,
      } satisfies N8nError;
    }

    const responseText = await response.text();
    let data: WorkoutPlanResponse;

    try {
      data = JSON.parse(responseText) as WorkoutPlanResponse;
    } catch {
      console.error("❌ [GENERATE] Webhook returned invalid JSON", { responseText });
      throw {
        message: "Webhook returned invalid JSON response",
        code: "INVALID_JSON",
        statusCode: 502,
      } satisfies N8nError;
    }

    if (!data.success) {
      console.error("❌ [GENERATE] Webhook reported failure", data);
      throw {
        message: data.error || data.message || "Webhook returned error",
        code: "WEBHOOK_ERROR",
      } satisfies N8nError;
    }

    console.log("✅ [GENERATE] Webhook completed", {
      planId: data.planId,
      message: data.message,
    });

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.error("⏱️ [GENERATE] Webhook request timed out after 45 seconds");
      throw {
        message: "Webhook request timed out after 45 seconds",
        code: "TIMEOUT",
        statusCode: 408,
      } satisfies N8nError;
    }

    if (error instanceof TypeError) {
      console.error("❌ [GENERATE] Network error during webhook call", { message: error.message });
      throw {
        message: `Network error: ${error.message}`,
        code: "NETWORK_ERROR",
      } satisfies N8nError;
    }

    console.error("❌ [GENERATE] Unexpected error during webhook call", error);
    throw error;
  }
}
