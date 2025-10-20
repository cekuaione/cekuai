import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { generateCryptoAssessment, type N8nCryptoError } from "@/lib/n8n/crypto";
import { RiskTolerance, TimeHorizon } from "@/lib/types/investing";

const requestSchema = z.object({
  cryptoSymbol: z.string().min(1),
  investmentAmount: z.number().min(100),
  riskTolerance: z.nativeEnum(RiskTolerance),
  timeHorizon: z.nativeEnum(TimeHorizon),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  console.log("🚀 [CRYPTO] Starting assessment generation");
  console.log("🔧 [CRYPTO] Environment check", {
    hasWebhookUrl: Boolean(process.env.N8N_CRYPTO_WEBHOOK_URL),
    webhookUrlPreview: process.env.N8N_CRYPTO_WEBHOOK_URL
      ? `${process.env.N8N_CRYPTO_WEBHOOK_URL.slice(0, 40)}...`
      : null,
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Validation error" }, { status: 400 });
  }

  const payload = parseResult.data;
  const supabase = getSupabaseServiceClient();
  const sanitizedNotes = payload.notes?.trim() ?? null;

  const { data: assessment, error: insertError } = await supabase
    .from("crypto_assessments")
    .insert({
      user_id: session.user.id,
      crypto_symbol: payload.cryptoSymbol,
      investment_amount: payload.investmentAmount,
      risk_tolerance: payload.riskTolerance,
      time_horizon: payload.timeHorizon,
      notes: sanitizedNotes,
      assessment_data: null,
      status: "generating",
      error_message: null,
    })
    .select("id")
    .single();

  if (insertError || !assessment) {
    console.error("❌ [CRYPTO] Failed to insert assessment", insertError);
    return NextResponse.json({ error: "Analiz oluşturulamadı" }, { status: 500 });
  }

  console.log("✅ [CRYPTO] Assessment created in DB", {
    assessmentId: assessment.id,
    userId: session.user.id,
    status: "generating",
  });

  const webhookPayload = {
    userId: session.user.id,
    assessmentId: assessment.id,
    cryptoSymbol: payload.cryptoSymbol,
    investmentAmount: payload.investmentAmount,
    riskTolerance: payload.riskTolerance,
    timeHorizon: payload.timeHorizon,
    ...(sanitizedNotes ? { notes: sanitizedNotes } : {}),
  };

  console.log("📡 [CRYPTO] Triggering webhook", {
    assessmentId: assessment.id,
    cryptoSymbol: payload.cryptoSymbol,
  });

  try {
    const webhookResult = await generateCryptoAssessment(webhookPayload);
    console.log("📥 [CRYPTO] Webhook response received", webhookResult);
  } catch (error) {
    await supabase
      .from("crypto_assessments")
      .update({ status: "failed", error_message: (error as N8nCryptoError)?.message ?? "Webhook error" })
      .eq("id", assessment.id);

    const webhookError = error as N8nCryptoError;
    const message = webhookError?.message ?? "AI iş akışı tetiklenemedi";
    const statusCode = typeof webhookError?.statusCode === "number" ? webhookError.statusCode : 502;

    console.error("❌ [CRYPTO] Webhook call failed", {
      assessmentId: assessment.id,
      message,
      statusCode,
    });

    return NextResponse.json({ error: message }, { status: statusCode });
  }

  console.log("✅ [CRYPTO] Returning response with assessmentId", { assessmentId: assessment.id });
  return NextResponse.json({ success: true, assessmentId: assessment.id, status: "generating" }, { status: 201 });
}
