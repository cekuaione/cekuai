/**
 * API client for Crypto Risk Assessment
 * Handles n8n webhook communication and polling for async results
 */

import type {
  CryptoAssessment,
  CryptoAssessmentRequest,
  CryptoAssessmentResponse,
  RiskTolerance,
  TimeHorizon,
} from "@/lib/types/investing";

/**
 * Result type for consistent error handling
 */
export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: AssessmentApiError };

/**
 * n8n webhook endpoint
 */
const N8N_WEBHOOK_URL =
  process.env.N8N_CRYPTO_WEBHOOK_URL ||
  "https://cekuai.duckdns.org/webhook/crypto-risk-assessment";

/**
 * Polling configuration
 */
const POLLING_CONFIG = {
  interval: 3000, // 3 seconds
  maxAttempts: 40, // 2 minutes total (40 * 3s = 120s)
  timeout: 30000, // 30 seconds for webhook request
} as const;

/**
 * Progress information for callbacks
 */
export interface ProgressInfo {
  percentage: number;
  currentAttempt: number;
  maxAttempts: number;
  message: string;
  estimatedSecondsRemaining: number;
}

/**
 * Callbacks for assessment submission
 */
export interface AssessmentCallbacks {
  onProgress?: (progress: ProgressInfo) => void;
  onComplete: (assessment: CryptoAssessment) => void;
  onError: (error: AssessmentApiError) => void;
}

/**
 * Custom error class for API operations
 */
export class AssessmentApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AssessmentApiError";
  }
}

/**
 * Trigger assessment analysis via n8n webhook
 * @param params - Assessment request parameters
 * @returns Success status with assessment ID or error
 */
export async function triggerAssessment(
  params: CryptoAssessmentRequest
): Promise<Result<string>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), POLLING_CONFIG.timeout);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        data: null,
        error: new AssessmentApiError(
          "Analiz başlatılamadı. Lütfen tekrar deneyin.",
          "WEBHOOK_ERROR",
          {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          }
        ),
      };
    }

    const result: CryptoAssessmentResponse = await response.json();

    if (!result.success) {
      return {
        data: null,
        error: new AssessmentApiError(
          result.error || "Analiz başlatılamadı. Lütfen tekrar deneyin.",
          "WEBHOOK_FAILED",
          { response: result }
        ),
      };
    }

    return { data: result.assessmentId, error: null };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          data: null,
          error: new AssessmentApiError(
            "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
            "TIMEOUT_ERROR",
            { originalError: error }
          ),
        };
      }

      if (error.message.includes("fetch")) {
        return {
          data: null,
          error: new AssessmentApiError(
            "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.",
            "NETWORK_ERROR",
            { originalError: error }
          ),
        };
      }
    }

    return {
      data: null,
      error: new AssessmentApiError(
        "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        "UNKNOWN_ERROR",
        { originalError: error }
      ),
    };
  }
}

/**
 * Poll Supabase for assessment status changes
 * @param assessmentId - Assessment UUID
 * @param userId - User ID
 * @param callbacks - Progress and completion callbacks
 * @returns Abort function to cancel polling
 */
export function pollAssessmentStatus(
  assessmentId: string,
  userId: string,
  callbacks: AssessmentCallbacks
): () => void {
  let attempts = 0;
  let isAborted = false;

  const poll = async () => {
    if (isAborted) return;

    attempts++;

    // Calculate progress
    const percentage = Math.min((attempts / POLLING_CONFIG.maxAttempts) * 100, 100);
    const estimatedSecondsRemaining = Math.max(
      (POLLING_CONFIG.maxAttempts - attempts) * (POLLING_CONFIG.interval / 1000),
      0
    );

    // Update progress
    callbacks.onProgress?.({
      percentage: Math.round(percentage),
      currentAttempt: attempts,
      maxAttempts: POLLING_CONFIG.maxAttempts,
      message: "Analiz yapılıyor...",
      estimatedSecondsRemaining: Math.round(estimatedSecondsRemaining),
    });

    // Check if timeout reached
    if (attempts > POLLING_CONFIG.maxAttempts) {
      callbacks.onError(
        new AssessmentApiError(
          "Analiz 2 dakikayı aştı. Lütfen tekrar deneyin.",
          "POLLING_TIMEOUT",
          { assessmentId, attempts }
        )
      );
      return;
    }

    // Query API for assessment status
    try {
      const response = await fetch(`/api/crypto-assessments/${assessmentId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Assessment fetch failed");
      }

      const data = (await response.json()) as { assessment?: CryptoAssessment };
      const assessment = data.assessment;

      if (!assessment) {
        callbacks.onError(
          new AssessmentApiError(
            "Değerlendirme bulunamadı.",
            "NOT_FOUND",
            { assessmentId }
          )
        );
        return;
      }

      // Check status
      if (assessment.status === "ready") {
        callbacks.onComplete(assessment);
        return;
      }

      if (assessment.status === "failed") {
        callbacks.onError(
          new AssessmentApiError(
            assessment.error_message || "Analiz başarısız oldu.",
            "ASSESSMENT_FAILED",
            { assessmentId, errorMessage: assessment.error_message }
          )
        );
        return;
      }

      // Continue polling if still generating
      if (assessment.status === "generating" && !isAborted) {
        setTimeout(poll, POLLING_CONFIG.interval);
      }
    } catch (error) {
      callbacks.onError(
        new AssessmentApiError(
          "Değerlendirme durumu alınamadı.",
          "FETCH_ERROR",
          { assessmentId, error }
        )
      );
      return;
    }
  };

  // Start polling
  poll();

  // Return abort function
  return () => {
    isAborted = true;
  };
}

/**
 * Submit crypto assessment for analysis
 * High-level function that combines creation, webhook trigger, and polling
 * @param formData - Assessment form data
 * @param callbacks - Progress and completion callbacks
 * @returns Abort function to cancel the entire operation
 */
export async function submitCryptoAssessment(
  formData: {
    userId: string;
    cryptoSymbol: string;
    investmentAmount: number;
    riskTolerance: RiskTolerance;
    timeHorizon: TimeHorizon;
    notes?: string;
  },
  callbacks: AssessmentCallbacks
): Promise<() => void> {
  let abortPolling: (() => void) | null = null;
  let isAborted = false;

  const abort = () => {
    isAborted = true;
    abortPolling?.();
  };

  try {
    // Step 1: Create assessment via API
    callbacks.onProgress?.({
      percentage: 5,
      currentAttempt: 0,
      maxAttempts: POLLING_CONFIG.maxAttempts,
      message: "Değerlendirme oluşturuluyor...",
      estimatedSecondsRemaining: 120,
    });

    const createResponse = await fetch("/api/crypto-assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: formData.userId,
        crypto_symbol: formData.cryptoSymbol,
        investment_amount: formData.investmentAmount,
        risk_tolerance: formData.riskTolerance,
        time_horizon: formData.timeHorizon,
        notes: formData.notes || null,
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Değerlendirme oluşturulamadı");
    }

    const createData = (await createResponse.json()) as { assessment?: CryptoAssessment };
    const assessmentId = createData.assessment?.id;

    if (!assessmentId) {
      throw new Error("Assessment ID alınamadı");
    }

    if (isAborted) return abort;

    // Step 2: Trigger n8n webhook
    callbacks.onProgress?.({
      percentage: 10,
      currentAttempt: 0,
      maxAttempts: POLLING_CONFIG.maxAttempts,
      message: "Analiz başlatılıyor...",
      estimatedSecondsRemaining: 115,
    });

    const webhookResult = await triggerAssessment({
      userId: formData.userId,
      assessmentId,
      cryptoSymbol: formData.cryptoSymbol,
      investmentAmount: formData.investmentAmount,
      riskTolerance: formData.riskTolerance,
      timeHorizon: formData.timeHorizon,
      notes: formData.notes,
    });

    if (webhookResult.error) {
      callbacks.onError(webhookResult.error);
      return abort;
    }

    if (isAborted) return abort;

    // Step 3: Start polling for completion
    callbacks.onProgress?.({
      percentage: 15,
      currentAttempt: 0,
      maxAttempts: POLLING_CONFIG.maxAttempts,
      message: "Analiz yapılıyor...",
      estimatedSecondsRemaining: 110,
    });

    abortPolling = pollAssessmentStatus(assessmentId, formData.userId, {
      onProgress: (progress) => {
        if (isAborted) return;
        // Scale progress from 15% to 95%
        const scaledProgress = 15 + (progress.percentage * 0.8);
        callbacks.onProgress?.({
          ...progress,
          percentage: Math.round(scaledProgress),
        });
      },
      onComplete: (assessment) => {
        if (isAborted) return;
        callbacks.onComplete(assessment);
      },
      onError: (error) => {
        if (isAborted) return;
        callbacks.onError(error);
      },
    });
  } catch (error) {
    callbacks.onError(
      new AssessmentApiError(
        "Beklenmeyen bir hata oluştu.",
        "UNEXPECTED_ERROR",
        { originalError: error }
      )
    );
  }

  return abort;
}

/**
 * Get assessment by ID (convenience wrapper)
 * @param assessmentId - Assessment UUID
 * @returns Assessment data or error
 */
export async function getAssessmentById(
  assessmentId: string
): Promise<Result<CryptoAssessment>> {
  try {
    const response = await fetch(`/api/crypto-assessments/${assessmentId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      return {
        data: null,
        error: new AssessmentApiError("Assessment not found", "NOT_FOUND"),
      };
    }

    const data = (await response.json()) as { assessment?: CryptoAssessment };
    
    if (!data.assessment) {
      return {
        data: null,
        error: new AssessmentApiError("Assessment not found", "NOT_FOUND"),
      };
    }

    return { data: data.assessment, error: null };
  } catch (error) {
    return {
      data: null,
      error: new AssessmentApiError(
        "Failed to fetch assessment",
        "FETCH_ERROR",
        { originalError: error }
      ),
    };
  }
}

/**
 * Check if assessment is complete
 * @param assessment - Assessment object
 * @returns True if assessment is ready or failed
 */
export function isAssessmentComplete(assessment: CryptoAssessment): boolean {
  return assessment.status === "ready" || assessment.status === "failed";
}

/**
 * Get status message in Turkish
 * @param status - Assessment status
 * @returns User-friendly status message
 */
export function getStatusMessage(status: string): string {
  switch (status) {
    case "generating":
      return "Analiz yapılıyor...";
    case "ready":
      return "Analiz tamamlandı!";
    case "failed":
      return "Analiz başarısız oldu.";
    default:
      return "Bilinmeyen durum";
  }
}

/**
 * Format error message for display
 * @param error - Error object
 * @returns Formatted error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AssessmentApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Bilinmeyen bir hata oluştu.";
}

/**
 * Calculate estimated time remaining
 * @param currentAttempt - Current polling attempt
 * @param maxAttempts - Maximum polling attempts
 * @param intervalMs - Polling interval in milliseconds
 * @returns Estimated seconds remaining
 */
export function calculateTimeRemaining(
  currentAttempt: number,
  maxAttempts: number,
  intervalMs: number
): number {
  const remainingAttempts = maxAttempts - currentAttempt;
  return Math.max(remainingAttempts * (intervalMs / 1000), 0);
}

/**
 * Validate assessment request before submission
 * @param formData - Form data to validate
 * @returns Validation result
 */
export function validateAssessmentRequest(formData: {
  userId: string;
  cryptoSymbol: string;
  investmentAmount: number;
  riskTolerance: string;
  timeHorizon: string;
  notes?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.userId) {
    errors.push("Kullanıcı ID'si gerekli");
  }

  if (!formData.cryptoSymbol) {
    errors.push("Kripto para sembolü gerekli");
  }

  if (!formData.investmentAmount || formData.investmentAmount < 100) {
    errors.push("Yatırım tutarı minimum 100 TL olmalıdır");
  }

  if (!formData.riskTolerance) {
    errors.push("Risk toleransı seçmelisiniz");
  }

  if (!formData.timeHorizon) {
    errors.push("Zaman ufku seçmelisiniz");
  }

  if (formData.notes && formData.notes.length > 500) {
    errors.push("Notlar en fazla 500 karakter olabilir");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
