import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getSocialMediaProject } from "@/lib/supabase/social-media-projects";

const paramsSchema = z.object({ projectId: z.string().uuid("Geçersiz proje kimliği") });

export async function GET(_req: Request, context: unknown) {
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = (context as { params?: Promise<Record<string, string | string[]>> })?.params;
  if (!params) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const resolvedParams = await params;
  const rawId = resolvedParams.projectId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const parseResult = paramsSchema.safeParse({ projectId: id });
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? "Invalid project id" }, { status: 400 });
  }

  const projectId = parseResult.data.projectId;

  console.log("🗄️ [SOCIAL-MEDIA] Fetching project", {
    projectId,
    userId: session.user.id,
  });

  try {
    const project = await getSocialMediaProject(projectId, session.user.id, true);

    if (!project) {
      console.warn("⚠️ [SOCIAL-MEDIA] Project not found", {
        projectId,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Authorization check - ensure user owns this project
    if (project.user_id !== session.user.id) {
      console.warn("⚠️ [SOCIAL-MEDIA] Access denied", {
        projectId,
        userId: session.user.id,
        projectUserId: project.user_id,
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("📊 [SOCIAL-MEDIA] Project status", {
      projectId: project.id,
      status: project.status,
      hasOutputImage: Boolean(project.output_image_url),
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        projectName: project.project_name,
        inputImageUrl: project.input_image_url,
        outputImageUrl: project.output_image_url,
        operationType: project.operation_type,
        status: project.status,
        errorMessage: project.error_message,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ [SOCIAL-MEDIA] Error fetching project", {
      projectId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}