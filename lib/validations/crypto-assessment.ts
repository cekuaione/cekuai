/**
 * Zod validation schemas for Crypto Risk Assessment
 * All error messages are in Turkish for user-facing validation
 */

import { z } from "zod";
import {
  RiskTolerance,
  TimeHorizon,
  InvestmentDecision,
  AssessmentStatus,
} from "@/lib/types/investing";

/**
 * Valid crypto trading pairs
 */
const VALID_CRYPTO_PAIRS = [
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "SOL/USDT",
  "ADA/USDT",
  "XRP/USDT",
  "DOT/USDT",
  "AVAX/USDT",
  "MATIC/USDT",
  "LTC/USDT",
] as const;

/**
 * Crypto symbol validation
 */
export const cryptoSymbolSchema = z
  .string()
  .min(1, "Kripto para sembolü seçmelisiniz")
  .refine(
    (val) => VALID_CRYPTO_PAIRS.includes(val as typeof VALID_CRYPTO_PAIRS[number]),
    {
      message: "Geçersiz kripto para çifti",
    }
  );

/**
 * Investment amount validation
 */
export const investmentAmountSchema = z
  .number()
  .min(100, "Minimum yatırım tutarı 100 TL'dir")
  .max(1000000, "Maksimum yatırım tutarı 1,000,000 TL'dir")
  .positive("Yatırım tutarı pozitif olmalıdır");

/**
 * Risk tolerance validation
 */
export const riskToleranceSchema = z.nativeEnum(RiskTolerance, {
  message: "Geçersiz risk toleransı seviyesi",
});

/**
 * Time horizon validation
 */
export const timeHorizonSchema = z.nativeEnum(TimeHorizon, {
  message: "Geçersiz zaman ufku",
});

/**
 * Notes validation (optional)
 */
export const notesSchema = z
  .string()
  .max(500, "Notlar en fazla 500 karakter olabilir")
  .optional();

/**
 * Form validation schema (for user input)
 */
export const cryptoAssessmentFormSchema = z.object({
  cryptoSymbol: cryptoSymbolSchema,
  investmentAmount: investmentAmountSchema,
  riskTolerance: riskToleranceSchema,
  timeHorizon: timeHorizonSchema,
  notes: notesSchema,
});

/**
 * API request validation schema (includes userId and assessmentId)
 */
export const cryptoAssessmentRequestSchema = z.object({
  userId: z.string().uuid("Geçersiz kullanıcı kimliği"),
  assessmentId: z.string().uuid("Geçersiz değerlendirme kimliği"),
  cryptoSymbol: cryptoSymbolSchema,
  investmentAmount: investmentAmountSchema,
  riskTolerance: riskToleranceSchema,
  timeHorizon: timeHorizonSchema,
  notes: notesSchema,
});

/**
 * API response validation schema
 */
export const cryptoAssessmentResponseSchema = z.object({
  success: z.boolean(),
  assessmentId: z.string().uuid(),
  message: z.string(),
  data: z
    .object({
      decision: z.nativeEnum(InvestmentDecision),
      confidence: z.number().min(1).max(10),
      riskScore: z.number().min(1).max(10),
      entryPrice: z.number().positive(),
      targetPrice: z.number().positive(),
      stopLoss: z.number().positive(),
    })
    .optional(),
  error: z.string().optional(),
});

/**
 * Assessment data validation (for JSONB storage)
 */
export const assessmentDataSchema = z.object({
  decision: z.nativeEnum(InvestmentDecision),
  confidence: z.number().min(1).max(10),
  riskScore: z.number().min(1).max(10),
  priceTargets: z.object({
    entryPrice: z.number().positive(),
    targetPrice: z.number().positive(),
    stopLoss: z.number().positive(),
    takeProfit1: z.number().positive().optional(),
    takeProfit2: z.number().positive().optional(),
  }),
  technicalSignals: z.object({
    rsi: z.number().min(0).max(100),
    macd: z.number(),
    support: z.number().positive(),
    resistance: z.number().positive(),
    trend: z.enum(["bullish", "bearish", "neutral"]),
    volatility: z.enum(["low", "medium", "high"]),
  }),
  riskAnalysis: z.object({
    marketRisk: z.number().min(1).max(10),
    liquidityRisk: z.number().min(1).max(10),
    volatilityRisk: z.number().min(1).max(10),
    regulatoryRisk: z.number().min(1).max(10),
    overallRisk: z.number().min(1).max(10),
  }),
  reasoning: z.string().min(10),
  marketContext: z.string().min(10),
  recommendations: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
});

/**
 * Full Supabase record validation
 */
export const cryptoAssessmentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  crypto_symbol: cryptoSymbolSchema,
  investment_amount: investmentAmountSchema,
  risk_tolerance: riskToleranceSchema,
  time_horizon: timeHorizonSchema,
  notes: z.string().nullable(),
  assessment_data: assessmentDataSchema.nullable(),
  status: z.nativeEnum(AssessmentStatus),
  error_message: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Database insert validation
 */
export const cryptoAssessmentInsertSchema = z.object({
  user_id: z.string().uuid(),
  crypto_symbol: cryptoSymbolSchema,
  investment_amount: investmentAmountSchema,
  risk_tolerance: riskToleranceSchema,
  time_horizon: timeHorizonSchema,
  notes: z.string().nullable().optional(),
  assessment_data: assessmentDataSchema.optional(),
  error_message: z.string().nullable().optional(),
  status: z.nativeEnum(AssessmentStatus).optional(),
});

/**
 * Database update validation
 */
export const cryptoAssessmentUpdateSchema = z.object({
  status: z.nativeEnum(AssessmentStatus).optional(),
  assessment_data: assessmentDataSchema.nullable().optional(),
  error_message: z.string().nullable().optional(),
});

/**
 * Type inference from schemas
 */
export type CryptoAssessmentFormData = z.infer<typeof cryptoAssessmentFormSchema>;
export type CryptoAssessmentRequest = z.infer<typeof cryptoAssessmentRequestSchema>;
export type CryptoAssessmentResponse = z.infer<typeof cryptoAssessmentResponseSchema>;
export type AssessmentData = z.infer<typeof assessmentDataSchema>;
export type CryptoAssessment = z.infer<typeof cryptoAssessmentSchema>;
export type CryptoAssessmentInsert = z.infer<typeof cryptoAssessmentInsertSchema>;
export type CryptoAssessmentUpdate = z.infer<typeof cryptoAssessmentUpdateSchema>;

/**
 * Validation helper functions
 */
export const validateCryptoAssessmentForm = (data: unknown) => {
  return cryptoAssessmentFormSchema.safeParse(data);
};

export const validateCryptoAssessmentRequest = (data: unknown) => {
  return cryptoAssessmentRequestSchema.safeParse(data);
};

export const validateCryptoAssessmentResponse = (data: unknown) => {
  return cryptoAssessmentResponseSchema.safeParse(data);
};

/**
 * Get validation error messages
 */
export const getValidationErrors = (error: z.ZodError<unknown>) => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
};

