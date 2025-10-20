import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-helpers";
import { createAssessment } from "@/lib/supabase/crypto-assessments";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { crypto_symbol, investment_amount, risk_tolerance, time_horizon, notes } = body;
    
    if (!crypto_symbol || !investment_amount || !risk_tolerance || !time_horizon) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate investment amount
    if (investment_amount < 100 || investment_amount > 1000000) {
      return NextResponse.json(
        { error: "Investment amount must be between 100 and 1,000,000" },
        { status: 400 }
      );
    }

    // Create assessment
    const result = await createAssessment(
      {
        user_id: session.user.id,
        crypto_symbol,
        investment_amount,
        risk_tolerance,
        time_horizon,
        notes: notes || null,
      },
      true // Use server-side client
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assessment: result.data,
    });
  } catch (error) {
    console.error("Error creating crypto assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

