import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Max dimensions and quality for compression
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

async function compressImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Skip compression for small images or non-image files
  if (!metadata.width || !metadata.height) {
    return buffer;
  }

  // Only compress if larger than max dimensions
  if (metadata.width <= MAX_WIDTH && metadata.height <= MAX_HEIGHT) {
    // Still optimize quality for JPEG/PNG
    if (contentType === "image/jpeg") {
      return image.jpeg({ quality: QUALITY * 100 }).toBuffer();
    }
    if (contentType === "image/png") {
      return image.png({ compressionLevel: 9 }).toBuffer();
    }
    return buffer;
  }

  // Resize and compress
  const compressed = image.resize(MAX_WIDTH, MAX_HEIGHT, {
    fit: "inside",
    withoutEnlargement: true,
  });

  if (contentType === "image/jpeg") {
    return compressed.jpeg({ quality: QUALITY * 100 }).toBuffer();
  }
  if (contentType === "image/png") {
    return compressed.png({ compressionLevel: 9 }).toBuffer();
  }

  // Default to WebP for other formats
  return compressed.webp({ quality: QUALITY * 100 }).toBuffer();
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is a tenant session (not admin)
    const userRole = (session.user as any).role;
    if (userRole === "ADMIN" || userRole === "OWNER") {
      return NextResponse.json(
        { error: "Harap logout dari akun admin terlebih dahulu" },
        { status: 401 }
      );
    }

    // Get tenant from session email
    const tenant = await prisma.tenant.findFirst({
      where: { email: session.user.email },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const invoiceId = formData.get("invoiceId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const notes = formData.get("notes") as string;

    if (!file || !invoiceId) {
      return NextResponse.json(
        { error: "File and invoiceId are required" },
        { status: 400 }
      );
    }

    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.tenantId !== tenant.id) {
      return NextResponse.json(
        { error: "Invoice not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice already paid" },
        { status: 400 }
      );
    }

    // Compress and upload file to Supabase
    const fileBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(fileBuffer);

    // Compress the image
    const compressedBuffer = await compressImage(originalBuffer, file.type);

    // Generate filename with proper extension for compressed format
    let extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (file.type === "image/jpeg") extension = "jpg";
    else if (file.type === "image/png") extension = "png";
    else if (file.type === "image/webp") extension = "webp";

    const fileName = `${invoiceId}-${Date.now()}.${extension}`;
    const filePath = `${tenant.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, compressedBuffer, {
        contentType: `image/${extension}`,
        upsert: true,
      });

    console.log("Upload result:", { uploadData, uploadError });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(uploadData.path);

    // Update invoice with payment proof
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: urlData.publicUrl,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      paymentProofUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
