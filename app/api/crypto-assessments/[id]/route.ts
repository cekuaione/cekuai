import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-helpers";
import { getAssessment } from "@/lib/supabase/crypto-assessments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get assessment
    const result = await getAssessment(id, session.user.id, true); // Use server-side client

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.name === "AssessmentNotFoundError" ? 404 : 500 }
      );
    }

    return NextResponse.json({
      assessment: result.data,
    });
  } catch (error) {
    console.error("Error fetching crypto assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

