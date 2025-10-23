import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import { authOptions } from "@/lib/auth";
import { getSocialMediaProject } from "@/lib/supabase/social-media-projects";

const paramsSchema = z.object({ projectId: z.string().uuid("Geçersiz proje kimliği") });

// Initialize S3 client for OCI
const s3Client = new S3Client({
  endpoint: process.env.OCI_ENDPOINT,
  region: process.env.OCI_REGION || "us-ashburn-1",
  credentials: {
    accessKeyId: process.env.OCI_ACCESS_KEY_ID!,
    secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for OCI S3 compatible API
});

export async function GET(_req: Request, context: unknown) {
  console.log("🖼️ [SOCIAL-MEDIA-IMAGES] Starting image proxy request");

  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.warn("⚠️ [SOCIAL-MEDIA-IMAGES] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = (context as { params?: Promise<Record<string, string | string[]>> })?.params;
  if (!params) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  
  const resolvedParams = await params;
  const rawId = resolvedParams.projectId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // Validate project ID
  const parseResult = paramsSchema.safeParse({ projectId: id });
  if (!parseResult.success) {
    return NextResponse.json({ 
      error: parseResult.error.issues[0]?.message ?? "Invalid project id" 
    }, { status: 400 });
  }

  const projectId = parseResult.data.projectId;

  console.log("🔍 [SOCIAL-MEDIA-IMAGES] Fetching project", {
    projectId,
    userId: session.user.id,
  });

  try {
    // Fetch project from database
    const project = await getSocialMediaProject(projectId, session.user.id, true);

    if (!project) {
      console.warn("⚠️ [SOCIAL-MEDIA-IMAGES] Project not found", {
        projectId,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Authorization check - ensure user owns this project
    if (project.user_id !== session.user.id) {
      console.warn("⚠️ [SOCIAL-MEDIA-IMAGES] Access denied", {
        projectId,
        userId: session.user.id,
        projectUserId: project.user_id,
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if project has output image
    if (!project.file_path) {
      console.warn("⚠️ [SOCIAL-MEDIA-IMAGES] No file path for project", {
        projectId,
        status: project.status,
      });
      return NextResponse.json({ error: "Image not available" }, { status: 404 });
    }

    console.log("📁 [SOCIAL-MEDIA-IMAGES] Fetching image from OCI", {
      projectId,
      filePath: project.file_path,
      bucket: "cekuai-image",
    });

    // Fetch image from OCI bucket
    const getObjectCommand = new GetObjectCommand({
      Bucket: "cekuai-image",
      Key: project.file_path,
    });

    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      console.error("❌ [SOCIAL-MEDIA-IMAGES] No body in OCI response", {
        projectId,
        filePath: project.file_path,
      });
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Determine content type from file extension or response
    const contentType = response.ContentType || getContentTypeFromPath(project.file_path);
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    console.log("✅ [SOCIAL-MEDIA-IMAGES] Successfully fetched image", {
      projectId,
      filePath: project.file_path,
      size: buffer.length,
      contentType,
    });

    // Stream image to frontend
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600", // Cache for 1 hour
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error) {
    console.error("❌ [SOCIAL-MEDIA-IMAGES] Error fetching image", {
      projectId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Handle specific S3 errors
    if (error instanceof Error) {
      if (error.name === "NoSuchKey") {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      if (error.name === "AccessDenied") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}

/**
 * Determine content type from file extension
 */
function getContentTypeFromPath(filePath: string): string {
  const extension = filePath.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
