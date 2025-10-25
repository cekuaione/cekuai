import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

// Equipment name mapping for normalization
const EQUIPMENT_MAPPING: Record<string, string> = {
  'bodyweight': 'body weight',
  'resistanceband': 'resistance band',
  'medicineball': 'medicine ball',
  'bosuball': 'bosu ball',
  'ezbarbell': 'ez barbell',
  'olympicbarbell': 'olympic barbell',
  'sledmachine': 'sled machine',
  'skiergmachine': 'skierg machine',
  'leveragemachine': 'leverage machine',
  'ellipticalmachine': 'elliptical machine',
  'smithmachine': 'smith machine',
};

// Normalize equipment name function
function normalizeEquipment(equipment: string): string {
  const lower = equipment.toLowerCase().trim();
  return EQUIPMENT_MAPPING[lower.replace(/\s+/g, '')] || lower;
}

// Query parameters validation schema
const querySchema = z.object({
  equipment: z.string().optional(),
  bodyPart: z.string().optional(),
  targetMuscle: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  fields: z.string().optional(),
});

// Response type for exercises API
interface ExercisesApiResponse {
  data: Record<string, unknown>[];
  count: number;
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const parseResult = querySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid parameters", 
          details: parseResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { equipment, bodyPart, targetMuscle, search, limit, fields } = parseResult.data;
    
    // Normalize equipment name using mapping
    const normalizedEquipment = equipment ? normalizeEquipment(equipment) : undefined;

    console.log("🔍 [API] Querying exercises", {
      equipment,
      bodyPart,
      targetMuscle,
      search,
      limit,
      fields,
    });

    const supabase = getSupabaseServiceClient();
    
    // Determine select fields
    const selectFields = fields ? fields.split(',').map(f => f.trim()) : "*";
    const selectString = Array.isArray(selectFields) 
      ? selectFields.join(',') 
      : selectFields;
    
    // Build the query
    let query = supabase
      .from("exercises")
      .select(selectString, { count: "exact" });

    // Apply filters
    if (normalizedEquipment) {
      query = query.contains("equipments", [normalizedEquipment]);
    }

    if (bodyPart) {
      query = query.contains("body_parts", [bodyPart]);
    }

    if (targetMuscle) {
      query = query.contains("target_muscles", [targetMuscle]);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply ordering and limit
    query = query.order("name", { ascending: true }).limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [DB] Error querying exercises", {
        error: error.message,
        query: { equipment: normalizedEquipment, bodyPart, targetMuscle, search, limit },
      });
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Transform gif_url to use ceku.ai domain as specified in requirements
    // Only transform when selecting all fields (backward compatibility)
    const transformedData = data?.map(exercise => {
      // If using selective fields, return as-is
      if (fields && fields !== '*') {
        return exercise;
      }
      // When selecting all fields, transform the URL
      return Object.assign({}, exercise, {
        gif_url: `https://www.ceku.ai/${(exercise as unknown as { exercise_id: string }).exercise_id}.gif`
      });
    }) || [];

    const response: ExercisesApiResponse = {
      data: transformedData as unknown as Record<string, unknown>[],
      count: transformedData.length,
      total: count || 0,
    };

    console.log("✅ [API] Exercises query successful", {
      count: transformedData.length,
      total: count,
      filters: { equipment: normalizedEquipment, bodyPart, targetMuscle, search },
    });

    // Add caching headers for 1 hour
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    headers.set('Content-Type', 'application/json');

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("❌ [API] Unexpected error in exercises endpoint", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
