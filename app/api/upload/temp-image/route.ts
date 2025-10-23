import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { randomUUID } from "crypto";
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { authOptions } from "@/lib/auth";

const requestSchema = z.object({
  filename: z.string().min(1).max(255, "Filename too long"),
  contentType: z.enum([
    "image/jpeg",
    "image/png", 
    "image/webp",
    "image/gif"
  ], { 
    message: "Invalid content type. Only JPEG, PNG, WebP, and GIF are allowed."
  }),
  fileSize: z.number()
    .min(1, "File size must be greater than 0")
    .max(10485760, "File size cannot exceed 10MB"), // 10MB max
});

// Initialize S3 client for OCI
const s3Client = new S3Client({
  endpoint: process.env.OCI_ENDPOINT,
  region: process.env.OCI_REGION || "eu-frankfurt-1",
  credentials: {
    accessKeyId: process.env.OCI_ACCESS_KEY_ID!,
    secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for OCI S3 compatible API
});

export async function POST(req: NextRequest) {
  console.log("📤 [TEMP-UPLOAD] Starting temp image upload request");

  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.warn("⚠️ [TEMP-UPLOAD] Unauthorized access attempt");
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
    console.warn("⚠️ [TEMP-UPLOAD] Validation failed", {
      error: issue?.message,
      userId: session.user.id,
    });
    return NextResponse.json({ error: issue?.message ?? "Validation error" }, { status: 400 });
  }

  const { filename, contentType, fileSize } = parseResult.data;

  try {
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);
    if (!sanitizedFilename) {
      console.warn("⚠️ [TEMP-UPLOAD] Invalid filename after sanitization", {
        originalFilename: filename,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Generate random file ID and build file path
    const fileId = randomUUID();
    const fileExtension = getFileExtension(contentType);
    const filePath = `temp-uploads/${session.user.id}/${fileId}${fileExtension}`;

    console.log("🔧 [TEMP-UPLOAD] Creating pre-signed URLs", {
      userId: session.user.id,
      fileId,
      filePath,
      contentType,
      fileSize,
      bucket: process.env.OCI_BUCKET_NAME || "cekuai-image",
    });

    // Create pre-signed PUT URL for upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.OCI_BUCKET_NAME || "cekuai-image",
      Key: filePath,
      ContentType: contentType,
      Metadata: {
        userId: session.user.id,
        fileId,
        originalFilename: sanitizedFilename,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Create pre-signed GET URL for download (for Replicate API)
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.OCI_BUCKET_NAME || "cekuai-image",
      Key: filePath,
    });

    const downloadUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    console.log("✅ [TEMP-UPLOAD] Successfully created pre-signed URLs", {
      userId: session.user.id,
      fileId,
      filePath,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      downloadUrl,
      fileId,
      filePath,
      expiresAt,
    }, { status: 201 });

  } catch (error) {
    console.error("❌ [TEMP-UPLOAD] Error creating pre-signed URLs", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ 
      error: "Failed to create upload URLs" 
    }, { status: 500 });
  }
}

/**
 * Sanitize filename by removing special characters and keeping only alphanumeric, dots, hyphens, underscores
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

  // Ensure filename is not empty and has reasonable length
  if (!sanitized || sanitized.length > 100) {
    return '';
  }

  return sanitized;
}

/**
 * Get file extension from content type
 */
function getFileExtension(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.bin';
  }
}
