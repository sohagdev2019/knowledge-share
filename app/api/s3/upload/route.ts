import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "@/lib/S3Client";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { canUploadFile } from "@/lib/teacher-plan-limits";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function POST(request: Request) {
  const session = await requireAdmin();
  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "dudde not good" }, { status: 429 });
    }

    // Validate required environment variables
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials are missing");
      return NextResponse.json(
        { error: "AWS credentials are not configured" },
        { status: 500 }
      );
    }

    if (!env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES) {
      console.error("S3 bucket name is missing");
      return NextResponse.json(
        { error: "S3 bucket name is not configured" },
        { status: 500 }
      );
    }

    if (!env.AWS_ENDPOINT_URL_S3) {
      console.error("AWS S3 endpoint URL is missing");
      return NextResponse.json(
        { error: "AWS S3 endpoint URL is not configured" },
        { status: 500 }
      );
    }

    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (images: 5MB, videos: 5GB)
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 5000 * 1024 * 1024; // 5GB
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? maxImageSize : maxVideoSize;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds limit (max: ${isImage ? "5MB" : "5GB"})` },
        { status: 400 }
      );
    }

    // Check teacher plan storage limit
    const fileSizeMB = file.size / (1024 * 1024);
    const storageCheck = await canUploadFile(fileSizeMB);
    if (!storageCheck.allowed) {
      return NextResponse.json(
        { error: storageCheck.reason || "Storage limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Generate unique key
    const uniqueKey = `${uuidv4()}-${file.name}`;

    // Convert File to Buffer/ArrayBuffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to S3 using PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: uniqueKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await S3.send(command);

    return NextResponse.json({
      key: uniqueKey,
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
