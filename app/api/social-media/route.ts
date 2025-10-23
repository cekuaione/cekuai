import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createSocialMediaProject } from "@/lib/supabase/social-media-projects";
import { OperationType, ProjectStatus, ProjectType } from "@/lib/types/social-media";

const requestSchema = z.object({
  imageUrl: z.string().url("Geçerli bir URL giriniz"),
  operationType: z.enum([
    OperationType.ANIME_STYLE,
    OperationType.OIL_PAINTING,
    OperationType.WATERCOLOR,
    OperationType.QUALITY_ENHANCE,
    OperationType.VINTAGE_LOOK,
    OperationType.SKETCH_DRAWING,
    OperationType.CYBERPUNK_STYLE,
    OperationType.RENDER_3D,
    OperationType.POP_ART,
    OperationType.FANTASY_ART,
  ]),
  projectType: z.enum([
    ProjectType.TEXT_TO_IMAGE,
    ProjectType.IMAGE_TO_IMAGE,
    ProjectType.IMAGE_TO_VIDEO,
  ]),
  projectName: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  console.log("🚀 [SOCIAL-MEDIA] Starting project generation");
  console.log("🔧 [SOCIAL-MEDIA] Environment check", {
    hasWebhookUrl: Boolean(process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL),
    webhookUrlPreview: process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL
      ? `${process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL.slice(0, 40)}...`
      : null,
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });

  // Authentication check
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

  // Input validation
  const parseResult = requestSchema.safeParse(body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Validation error" }, { status: 400 });
  }

  const payload = parseResult.data;

  try {
    // Create project in database
    const project = await createSocialMediaProject({
      user_id: session.user.id,
      project_name: payload.projectName || null,
      input_image_url: payload.imageUrl,
      operation_type: payload.operationType,
      project_type: payload.projectType,
      status: ProjectStatus.PENDING,
    });

    console.log("✅ [SOCIAL-MEDIA] Project created in DB", {
      projectId: project.id,
      userId: session.user.id,
      status: "pending",
    });

    // Call n8n webhook
    const webhookPayload = {
      userId: session.user.id,
      projectId: project.id,
      operationType: payload.operationType,
      projectType: payload.projectType,
      imageUrl: payload.imageUrl,
    };

    console.log("📡 [SOCIAL-MEDIA] Triggering webhook", {
      projectId: project.id,
      operationType: payload.operationType,
    });

    const webhookUrl = process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL || "https://cekuai.duckdns.org/webhook/social-media-image-transform";
    
    console.log("🔗 [SOCIAL-MEDIA] Webhook URL resolved", {
      webhookUrl: webhookUrl.slice(0, 50) + "...",
      isFromEnv: Boolean(process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL),
      isFallback: !process.env.N8N_SOCIAL_MEDIA_WEBHOOK_URL,
    });
    
    if (!webhookUrl) {
      console.warn("⚠️ [SOCIAL-MEDIA] Webhook URL not configured, skipping webhook call");
    } else {
      console.log("📤 [SOCIAL-MEDIA] Sending webhook payload", {
        url: webhookUrl,
        payload: webhookPayload,
      });
      
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        console.error("❌ [SOCIAL-MEDIA] Webhook failed", {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
        });
        // Don't fail the request if webhook fails, just log the error
      } else {
        const webhookResult = await webhookResponse.json();
        console.log("📥 [SOCIAL-MEDIA] Webhook response received", webhookResult);
      }
    }

    console.log("✅ [SOCIAL-MEDIA] Returning response with projectId", { projectId: project.id });
    return NextResponse.json(
      { success: true, projectId: project.id, status: ProjectStatus.PENDING },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ [SOCIAL-MEDIA] Project creation failed", error);

    const message = error instanceof Error ? error.message : "Görsel dönüşümü başlatılamadı";
    const statusCode = 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}