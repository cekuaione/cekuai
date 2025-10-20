/**
 * Type definitions for the Investing module
 * Crypto Risk Assessment feature types and interfaces
 */

/**
 * Risk tolerance levels for investment assessment
 */
export enum RiskTolerance {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/**
 * Investment time horizon options
 */
export enum TimeHorizon {
  SHORT = "short", // < 1 month
  MEDIUM = "medium", // 1-6 months
  LONG = "long", // > 6 months
}

/**
 * AI-generated investment decision
 */
export enum InvestmentDecision {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD",
  DONT_INVEST = "DONT_INVEST",
}

/**
 * Assessment processing status
 */
export enum AssessmentStatus {
  GENERATING = "generating",
  READY = "ready",
  FAILED = "failed",
}

/**
 * Valid crypto trading pairs
 */
export enum CryptoSymbol {
  BTC_USDT = "BTC/USDT",
  ETH_USDT = "ETH/USDT",
  BNB_USDT = "BNB/USDT",
  SOL_USDT = "SOL/USDT",
  ADA_USDT = "ADA/USDT",
  XRP_USDT = "XRP/USDT",
  DOT_USDT = "DOT/USDT",
  AVAX_USDT = "AVAX/USDT",
  MATIC_USDT = "MATIC/USDT",
  LTC_USDT = "LTC/USDT",
}

/**
 * AI analysis signals and indicators
 */
export interface TechnicalSignals {
  rsi: number; // RSI indicator (0-100)
  macd: number; // MACD signal
  support: number; // Support level price
  resistance: number; // Resistance level price
  trend: "bullish" | "bearish" | "neutral";
  volatility: "low" | "medium" | "high";
}

/**
 * Risk analysis breakdown
 */
export interface RiskAnalysis {
  marketRisk: number; // 1-10
  liquidityRisk: number; // 1-10
  volatilityRisk: number; // 1-10
  regulatoryRisk: number; // 1-10
  overallRisk: number; // 1-10
}

/**
 * Price targets and recommendations
 */
export interface PriceTargets {
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  takeProfit1?: number; // First take profit level
  takeProfit2?: number; // Second take profit level
}

/**
 * Full AI assessment data structure (stored in JSONB)
 */
export interface AssessmentData {
  decision: InvestmentDecision;
  confidence: number; // 1-10
  riskScore: number; // 1-10
  priceTargets?: PriceTargets;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  takeProfit1?: number;
  takeProfit2?: number;
  technicalSignals: TechnicalSignals;
  riskAnalysis: RiskAnalysis;
  reasoning: string; // AI explanation in Turkish
  marketContext: string; // Current market conditions
  recommendations?: string[]; // Action items
  warnings?: string[]; // Risk warnings
  timestamp: string; // ISO 8601 timestamp
}

/**
 * Form data submitted by user
 */
export interface CryptoAssessmentFormData {
  cryptoSymbol: string;
  investmentAmount: number;
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  notes?: string;
}

/**
 * API request payload sent to n8n webhook
 */
export interface CryptoAssessmentRequest {
  userId: string;
  assessmentId: string;
  cryptoSymbol: string;
  investmentAmount: number;
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  notes?: string;
}

/**
 * API response from n8n webhook
 */
export interface CryptoAssessmentResponse {
  success: boolean;
  assessmentId: string;
  message: string;
  data?: {
    decision: InvestmentDecision;
    confidence: number;
    riskScore: number;
    entryPrice: number;
    targetPrice: number;
    stopLoss: number;
  };
  error?: string;
}

/**
 * Full Supabase record type for crypto_assessments table
 */
export interface CryptoAssessment {
  id: string;
  user_id: string;
  crypto_symbol: string;
  investment_amount: number;
  risk_tolerance: RiskTolerance;
  time_horizon: TimeHorizon;
  notes: string | null;
  assessment_data: AssessmentData | null;
  status: AssessmentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database insert type (without auto-generated fields)
 */
export type CryptoAssessmentInsert = Omit<
  CryptoAssessment,
  "id" | "created_at" | "updated_at" | "assessment_data" | "error_message"
> & {
  assessment_data?: AssessmentData;
  error_message?: string;
};

/**
 * Database update type (partial, only updatable fields)
 */
export type CryptoAssessmentUpdate = Partial<
  Pick<
    CryptoAssessment,
    "status" | "assessment_data" | "error_message"
  >
>;

/**
 * Display data for UI (formatted and enriched)
 */
export interface CryptoAssessmentDisplay {
  id: string;
  crypto_symbol: string;
  investment_amount: number;
  risk_tolerance: RiskTolerance;
  time_horizon: TimeHorizon;
  notes: string | null;
  status: AssessmentStatus;
  decision?: InvestmentDecision;
  confidence?: number;
  riskScore?: number;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Loading states for async operations
 */
export interface AssessmentLoadingStates {
  isSubmitting: boolean;
  isGenerating: boolean;
  isFetching: boolean;
  isUpdating: boolean;
}

/**
 * Form state for React Hook Form
 */
export interface AssessmentFormState {
  data: CryptoAssessmentFormData;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Error response from API
 */
export interface AssessmentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Success response wrapper
 */
export interface AssessmentSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API response wrapper (success or error)
 */
export type AssessmentApiResponse<T = unknown> =
  | AssessmentSuccess<T>
  | { success: false; error: AssessmentError };

/**
 * Type guard for success response
 */
export function isAssessmentSuccess<T>(
  response: AssessmentApiResponse<T>
): response is AssessmentSuccess<T> {
  return response.success === true;
}

/**
 * Type guard for error response
 */
export function isAssessmentError<T>(
  response: AssessmentApiResponse<T>
): response is { success: false; error: AssessmentError } {
  return response.success === false;
}
