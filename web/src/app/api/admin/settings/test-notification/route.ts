import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerPhone, getPropertyName, getPropertyEmail, getOwnerEmail } from "@/lib/property";
import { sendBookingReceivedEmail } from "@/lib/email";
import { sendWANotification } from "@/lib/wa";

export const dynamic = "force-dynamic";

// POST - Send test notification to owner
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body; // "email" | "wa" | "both"

    const ownerPhone = await getOwnerPhone();
    const ownerEmail = await getOwnerEmail();
    const propertyEmail = await getPropertyEmail();
    const propertyName = await getPropertyName();
    const results: Record<string, any> = {};

    // Test WhatsApp
    if ((type === "wa" || type === "both") && ownerPhone) {
      const waMessage = `Test Notification

Halo Owner!

Ini adalah pesan test dari sistem.

Property: ${propertyName}
Waktu: ${new Date().toLocaleString("id-ID")}

Jika Anda menerima pesan ini, berarti pengaturan WhatsApp sudah benar.`;

      const waResult = await sendWANotification(ownerPhone, waMessage);
      results.whatsapp = {
        phone: ownerPhone,
        success: waResult.status,
        detail: waResult.detail || "Message sent",
      };
    }

    // Test Email - send to owner's email for testing
    if (type === "email" || type === "both") {
      const replyTo = propertyEmail;
      const sendToEmail = ownerEmail || session.user?.email || "test@example.com";

      const emailResult = await sendBookingReceivedEmail({
        guestEmail: sendToEmail,
        guestName: "Property Owner",
        bookingNumber: "TEST-" + Date.now(),
        unitNumber: "TEST-001",
        propertyName,
        checkInDate: new Date().toLocaleDateString("id-ID"),
        duration: 1,
        durationType: "bulan",
        totalPrice: 1000000,
        notes: "Test notification - this email includes property contact info in the footer",
        ownerPhone: ownerPhone || undefined,
        replyTo,
      });
      results.email = {
        sentTo: sendToEmail,
        replyTo: replyTo,
        success: emailResult.success,
        error: emailResult.error || null,
      };
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} notification sent`,
      results,
      settings: {
        ownerPhone,
        ownerEmail,
        propertyEmail,
        propertyName,
      },
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json({ error: "Failed to send test" }, { status: 500 });
  }
}

// GET - Get current notification settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerPhone = await getOwnerPhone();
    const ownerEmail = await getOwnerEmail();
    const propertyEmail = await getPropertyEmail();
    const propertyName = await getPropertyName();

    return NextResponse.json({
      settings: {
        ownerPhone,
        ownerEmail,
        propertyEmail,
        propertyName,
        whatsappConfigured: !!ownerPhone,
        emailConfigured: !!propertyEmail,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}
