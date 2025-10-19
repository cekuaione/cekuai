import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  console.log("🧪 [TEST] Testing webhook", { webhookUrl });

  if (!webhookUrl) {
    console.error("❌ [TEST] Webhook URL missing");
    return NextResponse.json(
      {
        success: false,
        error: "N8N_WEBHOOK_URL is not configured",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test-user",
        planId: "test-plan",
        goal: "muscle",
        level: "beginner",
        daysPerWeek: 3,
        durationPerDay: 60,
        equipment: ["dumbbell"],
        notes: "test webhook call",
      }),
    });

    const text = await response.text();

    console.log("✅ [TEST] Webhook response", {
      status: response.status,
      ok: response.ok,
      body: text,
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      body: text,
    });
  } catch (error) {
    console.error("❌ [TEST] Webhook test failed", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
