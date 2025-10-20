import type { CryptoAssessmentRequest, CryptoAssessmentResponse } from "@/lib/types/investing";

export type N8nCryptoError = {
  message: string;
  code?: string;
  statusCode?: number;
};

const WEBHOOK_TIMEOUT = 45_000;
const DEFAULT_WEBHOOK_URL = "https://cekuai.duckdns.org/webhook/crypto-risk-assessment";

type ResolvedWebhook = {
  url: string;
  fromEnv: boolean;
};

function resolveWebhookUrl(): ResolvedWebhook {
  const raw = process.env.N8N_CRYPTO_WEBHOOK_URL?.trim();
  if (raw) {
    return { url: raw, fromEnv: true };
  }
  return { url: DEFAULT_WEBHOOK_URL, fromEnv: false };
}

export async function generateCryptoAssessment(
  payload: CryptoAssessmentRequest,
): Promise<CryptoAssessmentResponse> {
  const { url: webhookUrl, fromEnv } = resolveWebhookUrl();

  if (!webhookUrl) {
    throw new Error("N8N_CRYPTO_WEBHOOK_URL environment variable is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    console.log("📡 [CRYPTO] Sending webhook request", {
      url: webhookUrl,
      hasWebhookEnv: fromEnv,
      payloadPreview: {
        userId: payload.userId,
        assessmentId: payload.assessmentId,
        cryptoSymbol: payload.cryptoSymbol,
        investmentAmount: payload.investmentAmount,
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
      console.error("❌ [CRYPTO] Webhook request failed", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw {
        message: `Webhook request failed: ${response.statusText}`,
        statusCode: response.status,
        code: errorText,
      } satisfies N8nCryptoError;
    }

    const responseText = await response.text();
    let data: CryptoAssessmentResponse;

    try {
      data = JSON.parse(responseText) as CryptoAssessmentResponse;
    } catch {
      console.error("❌ [CRYPTO] Webhook returned invalid JSON", { responseText });
      throw {
        message: "Webhook returned invalid JSON response",
        code: "INVALID_JSON",
        statusCode: 502,
      } satisfies N8nCryptoError;
    }

    if (!data.success) {
      console.error("❌ [CRYPTO] Webhook reported failure", data);
      throw {
        message: data.error || data.message || "Webhook returned error",
        code: "WEBHOOK_ERROR",
      } satisfies N8nCryptoError;
    }

    console.log("✅ [CRYPTO] Webhook completed", {
      assessmentId: data.assessmentId,
      message: data.message,
    });

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.error("⏱️ [CRYPTO] Webhook request timed out after 45 seconds");
      throw {
        message: "Webhook request timed out after 45 seconds",
        code: "TIMEOUT",
        statusCode: 408,
      } satisfies N8nCryptoError;
    }

    if (error instanceof TypeError) {
      console.error("❌ [CRYPTO] Network error during webhook call", { message: error.message });
      throw {
        message: `Network error: ${error.message}`,
        code: "NETWORK_ERROR",
      } satisfies N8nCryptoError;
    }

    console.error("❌ [CRYPTO] Unexpected error during webhook call", error);
    throw error;
  }
}
