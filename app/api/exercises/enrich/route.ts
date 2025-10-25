import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

// Request validation schema
const enrichRequestSchema = z.object({
  exerciseIds: z.array(z.string()).min(1).max(50),
});

// Response type for enriched exercise data
interface EnrichedExercise {
  name: string;
  gif_url: string;
  instructions: string[];
}

interface EnrichResponse {
  [exerciseId: string]: EnrichedExercise;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = enrichRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request", 
          details: parseResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { exerciseIds } = parseResult.data;
    
    console.log("🔍 [API] Enriching exercises", {
      count: exerciseIds.length,
      exercises: exerciseIds,
    });

    const supabase = getSupabaseServiceClient();
    
    // Query exercises by exercise_id
    const { data, error } = await supabase
      .from("exercises")
      .select("exercise_id, name, gif_url, instructions")
      .in('exercise_id', exerciseIds);

    if (error) {
      console.error("❌ [DB] Error querying exercises for enrichment", {
        error: error.message,
        exerciseIds,
      });
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Transform data into object map keyed by exercise_id
    const enrichedData: EnrichResponse = {};
    
    if (data) {
      data.forEach(exercise => {
        enrichedData[exercise.exercise_id] = {
          name: exercise.name,
          gif_url: exercise.gif_url,
          instructions: exercise.instructions,
        };
      });
    }

    console.log("✅ [API] Exercise enrichment successful", {
      requested: exerciseIds.length,
      found: Object.keys(enrichedData).length,
      missing: exerciseIds.filter(id => !enrichedData[id]),
    });

    // Add caching headers for 1 hour
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    headers.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify(enrichedData), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("❌ [API] Unexpected error in exercise enrichment endpoint", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
