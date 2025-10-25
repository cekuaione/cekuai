import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

// Request validation schema
const enrichRequestSchema = z.object({
  exerciseNames: z.array(z.string()).min(1).max(50),
});

// Response type for enriched exercise data
interface EnrichedExercise {
  gif_url: string;
  instructions: string[];
}

interface EnrichResponse {
  [exerciseName: string]: EnrichedExercise;
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

    const { exerciseNames } = parseResult.data;
    
    console.log("🔍 [API] Enriching exercises", {
      count: exerciseNames.length,
      exercises: exerciseNames,
    });

    const supabase = getSupabaseServiceClient();
    
    // Query exercises with case-insensitive matching using ILIKE
    const { data, error } = await supabase
      .from("exercises")
      .select("exercise_id, name, gif_url, instructions")
      .or(exerciseNames.map(name => `name.ilike.%${name}%`).join(','));

    if (error) {
      console.error("❌ [DB] Error querying exercises for enrichment", {
        error: error.message,
        exerciseNames,
      });
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Transform data into object map
    const enrichedData: EnrichResponse = {};
    
    if (data) {
      data.forEach(exercise => {
        // Use case-insensitive matching to find the original exercise name
        const originalName = exerciseNames.find(name => 
          name.toLowerCase() === exercise.name.toLowerCase()
        );
        
        if (originalName) {
          enrichedData[originalName] = {
            gif_url: `https://www.ceku.ai/${exercise.exercise_id}.gif`,
            instructions: exercise.instructions,
          };
        }
      });
    }

    console.log("✅ [API] Exercise enrichment successful", {
      requested: exerciseNames.length,
      found: Object.keys(enrichedData).length,
      missing: exerciseNames.filter(name => !enrichedData[name]),
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
