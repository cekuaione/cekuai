/**
 * Supabase helper functions for Crypto Risk Assessment
 * Type-safe database operations with error handling and real-time subscriptions
 */

import { getSupabaseBrowserClient } from "./client";
import { getSupabaseUserClient } from "./server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";
import {
  AssessmentStatus,
  InvestmentDecision,
} from "@/lib/types/investing";
import type {
  CryptoAssessment,
  CryptoAssessmentInsert,
  AssessmentData,
  InvestingDashboardStats,
} from "@/lib/types/investing";

/**
 * Result type for consistent error handling
 */
export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: AssessmentError };

/**
 * Helper to get the appropriate Supabase client
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Supabase client instance
 */
async function getClient(
  useServer = false
): Promise<SupabaseClient<Database>> {
  if (useServer) {
    return getSupabaseUserClient();
  }
  return getSupabaseBrowserClient();
}

/**
 * Custom error types for assessment operations
 */
export class AssessmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AssessmentError";
  }
}

export class AssessmentNotFoundError extends AssessmentError {
  constructor(assessmentId: string) {
    super(
      `Assessment not found: ${assessmentId}`,
      "ASSESSMENT_NOT_FOUND",
      { assessmentId }
    );
    this.name = "AssessmentNotFoundError";
  }
}

export class AssessmentAccessDeniedError extends AssessmentError {
  constructor(assessmentId: string) {
    super(
      `Access denied to assessment: ${assessmentId}`,
      "ASSESSMENT_ACCESS_DENIED",
      { assessmentId }
    );
    this.name = "AssessmentAccessDeniedError";
  }
}

export class AssessmentValidationError extends AssessmentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "ASSESSMENT_VALIDATION_ERROR", details);
    this.name = "AssessmentValidationError";
  }
}

/**
 * Options for getUserAssessments query
 */
export interface GetUserAssessmentsOptions {
  limit?: number;
  offset?: number;
  status?: AssessmentStatus;
  sortBy?: "created_at" | "updated_at";
  orderBy?: "asc" | "desc";
}

/**
 * Create a new crypto assessment
 * @param params - Assessment data to insert
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Created assessment or error
 */
export async function createAssessment(
  params: Omit<CryptoAssessmentInsert, "status">,
  useServer = false
): Promise<Result<CryptoAssessment>> {
  try {
    const supabase = await getClient(useServer);

    const insertData = {
      ...params,
      status: "generating" as AssessmentStatus,
    } as Database["public"]["Tables"]["crypto_assessments"]["Insert"];

    const { data, error } = await supabase
      .from("crypto_assessments")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return {
        data: null,
        error: new AssessmentError(
          "Failed to create assessment",
          "CREATE_FAILED"
        ),
      };
    }

    return { data: data as CryptoAssessment, error: null };
  } catch (error) {
    console.error("Error creating assessment:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "CREATE_FAILED",
        { originalError: error }
      ),
    };
  }
}

/**
 * Get a single assessment by ID
 * @param assessmentId - Assessment UUID
 * @param userId - User ID for ownership verification
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Assessment data or error
 */
export async function getAssessment(
  assessmentId: string,
  userId: string,
  useServer = false
): Promise<Result<CryptoAssessment>> {
  try {
    const supabase = await getClient(useServer);

    const { data, error } = await supabase
      .from("crypto_assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          data: null,
          error: new AssessmentNotFoundError(assessmentId),
        };
      }
      throw error;
    }

    if (!data) {
      return {
        data: null,
        error: new AssessmentNotFoundError(assessmentId),
      };
    }

    return { data: data as CryptoAssessment, error: null };
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "FETCH_FAILED",
        { assessmentId, originalError: error }
      ),
    };
  }
}

/**
 * Get all assessments for a user
 * @param userId - User ID
 * @param options - Query options (pagination, filtering, sorting)
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Array of assessments or error
 */
export async function getUserAssessments(
  userId: string,
  options: GetUserAssessmentsOptions = {},
  useServer = false
): Promise<Result<CryptoAssessment[]>> {
  try {
    const supabase = await getClient(useServer);
    const {
      limit = 50,
      offset = 0,
      status,
      sortBy = "created_at",
      orderBy = "desc",
    } = options;

    let query = supabase
      .from("crypto_assessments")
      .select("*")
      .eq("user_id", userId)
      .order(sortBy, { ascending: orderBy === "asc" })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: (data || []) as CryptoAssessment[],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "FETCH_FAILED",
        { userId, originalError: error }
      ),
    };
  }
}

/**
 * Update assessment data and status (used by n8n webhook)
 * @param assessmentId - Assessment UUID
 * @param assessmentData - Full assessment data from AI
 * @param status - New status (usually 'ready')
 * @param useServer - Whether to use server-side client (default: true for webhook)
 * @returns Updated assessment or error
 */
export async function updateAssessmentData(
  assessmentId: string,
  assessmentData: AssessmentData,
  status: AssessmentStatus = "ready" as AssessmentStatus,
  useServer = true
): Promise<Result<CryptoAssessment>> {
  try {
    const supabase = await getClient(useServer);

    const updateData = {
      assessment_data: assessmentData as unknown as Json,
      status,
    } as Database["public"]["Tables"]["crypto_assessments"]["Update"];

    const { data, error } = await supabase
      .from("crypto_assessments")
      .update(updateData)
      .eq("id", assessmentId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          data: null,
          error: new AssessmentNotFoundError(assessmentId),
        };
      }
      throw error;
    }

    if (!data) {
      return {
        data: null,
        error: new AssessmentNotFoundError(assessmentId),
      };
    }

    return { data: data as CryptoAssessment, error: null };
  } catch (error) {
    console.error("Error updating assessment data:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "UPDATE_FAILED",
        { assessmentId, originalError: error }
      ),
    };
  }
}

/**
 * Update assessment with error information (used when n8n workflow fails)
 * @param assessmentId - Assessment UUID
 * @param errorMessage - Error message to store
 * @param useServer - Whether to use server-side client (default: true for webhook)
 * @returns Updated assessment or error
 */
export async function updateAssessmentError(
  assessmentId: string,
  errorMessage: string,
  useServer = true
): Promise<Result<CryptoAssessment>> {
  try {
    const supabase = await getClient(useServer);

    const updateData = {
      status: "failed",
      error_message: errorMessage,
    } as Database["public"]["Tables"]["crypto_assessments"]["Update"];

    const { data, error } = await supabase
      .from("crypto_assessments")
      .update(updateData)
      .eq("id", assessmentId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          data: null,
          error: new AssessmentNotFoundError(assessmentId),
        };
      }
      throw error;
    }

    if (!data) {
      return {
        data: null,
        error: new AssessmentNotFoundError(assessmentId),
      };
    }

    return { data: data as CryptoAssessment, error: null };
  } catch (error) {
    console.error("Error updating assessment error:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "UPDATE_FAILED",
        { assessmentId, originalError: error }
      ),
    };
  }
}

/**
 * Subscribe to real-time updates for a specific assessment
 * @param assessmentId - Assessment UUID to watch
 * @param callback - Function called when assessment changes
 * @returns Unsubscribe function
 */
export function subscribeToAssessment(
  assessmentId: string,
  callback: (assessment: CryptoAssessment) => void
): () => void {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel(`assessment:${assessmentId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "crypto_assessments",
        filter: `id=eq.${assessmentId}`,
      },
      (payload) => {
        callback(payload.new as CryptoAssessment);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to assessment ${assessmentId}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error(`Subscription error for assessment ${assessmentId}`);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to all assessments for a user
 * @param userId - User ID
 * @param callback - Function called when any assessment changes
 * @returns Unsubscribe function
 */
export function subscribeToUserAssessments(
  userId: string,
  callback: (assessment: CryptoAssessment) => void
): () => void {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel(`user-assessments:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "crypto_assessments",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as CryptoAssessment);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to user assessments for ${userId}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error(`Subscription error for user ${userId}`);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Delete an assessment
 * @param assessmentId - Assessment UUID
 * @param userId - User ID for ownership verification
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Success or error
 */
export async function deleteAssessment(
  assessmentId: string,
  userId: string,
  useServer = false
): Promise<Result<boolean>> {
  try {
    const supabase = await getClient(useServer);

    const { error } = await supabase
      .from("crypto_assessments")
      .delete()
      .eq("id", assessmentId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { data: true, error: null };
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "DELETE_FAILED",
        { assessmentId, originalError: error }
      ),
    };
  }
}

/**
 * Get assessment count for a user
 * @param userId - User ID
 * @param status - Optional status filter
 * @param useServer - Whether to use server-side client (default: false)
 * @returns Count or error
 */
export async function getAssessmentCount(
  userId: string,
  status?: AssessmentStatus,
  useServer = false
): Promise<Result<number>> {
  try {
    const supabase = await getClient(useServer);

    let query = supabase
      .from("crypto_assessments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return { data: count || 0, error: null };
  } catch (error) {
    console.error("Error getting assessment count:", error);
    return {
      data: null,
      error: new AssessmentError(
        error instanceof Error ? error.message : "Unknown error",
        "COUNT_FAILED",
        { userId, originalError: error }
      ),
    };
  }
}

/**
 * Retrieve latest ready crypto assessments for a user.
 * Useful for dashboard views.
 */
export async function getUserCryptoAssessments(
  userId: string,
  { limit }: { limit?: number } = {}
): Promise<CryptoAssessment[]> {
  try {
    const supabase = await getSupabaseUserClient();

    let query = supabase
      .from("crypto_assessments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", AssessmentStatus.READY)
      .order("created_at", { ascending: false });

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []) as CryptoAssessment[];
  } catch (error) {
    console.error("Error fetching user crypto assessments:", error);
    throw new AssessmentError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_FAILED",
      { userId, scope: "getUserCryptoAssessments", originalError: error }
    );
  }
}

/**
 * Fetch the most recent ready assessments with an explicit limit.
 */
export async function getRecentAssessments(
  userId: string,
  limit = 5
): Promise<CryptoAssessment[]> {
  try {
    return await getUserCryptoAssessments(userId, { limit });
  } catch (error) {
    console.error("Error fetching recent assessments:", error);
    throw new AssessmentError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_FAILED",
      { userId, scope: "getRecentAssessments", originalError: error }
    );
  }
}

/**
 * Compute aggregated investing statistics for dashboard widgets.
 */
export async function getUserInvestingStats(
  userId: string
): Promise<InvestingDashboardStats> {
  try {
    const supabase = await getSupabaseUserClient();

    const { data, error } = await supabase
      .from("crypto_assessments")
      .select("id, created_at, assessment_data")
      .eq("user_id", userId)
      .eq("status", AssessmentStatus.READY)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows =
      (data as Pick<CryptoAssessment, "id" | "created_at" | "assessment_data">[]) ||
      [];

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const decisionCounts: Record<InvestmentDecision, number> = {
      [InvestmentDecision.BUY]: 0,
      [InvestmentDecision.SELL]: 0,
      [InvestmentDecision.HOLD]: 0,
      [InvestmentDecision.DONT_INVEST]: 0,
    };

    let monthlyTotal = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;

    for (const row of rows) {
      const createdAt = new Date(row.created_at);
      if (!Number.isNaN(createdAt.getTime()) && createdAt >= startOfMonth) {
        monthlyTotal += 1;
      }

      const assessmentData = row.assessment_data as AssessmentData | null;
      const decision = assessmentData?.decision;
      if (decision && decisionCounts[decision] !== undefined) {
        decisionCounts[decision] += 1;
      }

      const confidence = assessmentData?.confidence;
      if (typeof confidence === "number" && Number.isFinite(confidence)) {
        confidenceSum += confidence;
        confidenceCount += 1;
      }
    }

    return {
      totalReady: rows.length,
      monthlyTotal,
      decisionCounts,
      averageConfidence:
        confidenceCount > 0 ? confidenceSum / confidenceCount : null,
    };
  } catch (error) {
    console.error("Error computing investing stats:", error);
    throw new AssessmentError(
      error instanceof Error ? error.message : "Unknown error",
      "STATS_FAILED",
      { userId, scope: "getUserInvestingStats", originalError: error }
    );
  }
}

/**
 * Check if user has access to an assessment
 * @param assessmentId - Assessment UUID
 * @param userId - User ID
 * @param useServer - Whether to use server-side client (default: false)
 * @returns True if user has access, false otherwise
 */
export async function hasAccessToAssessment(
  assessmentId: string,
  userId: string,
  useServer = false
): Promise<boolean> {
  const result = await getAssessment(assessmentId, userId, useServer);
  return result.error === null;
}

/**
 * Helper to extract error message from Result
 */
export function getErrorMessage(result: Result<unknown>): string | null {
  return result.error?.message || null;
}

/**
 * Helper to check if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is { data: T; error: null } {
  return result.error === null;
}

/**
 * Helper to check if result is an error
 */
export function isError<T>(result: Result<T>): result is { data: null; error: AssessmentError } {
  return result.error !== null;
}
