import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.paymentProofUrl) {
      return NextResponse.json(
        { error: "No payment proof uploaded" },
        { status: 400 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Cannot reject already paid invoice" },
        { status: 400 }
      );
    }

    // Clear payment proof and update notes
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        paymentProofUrl: null,
        paymentMethod: null,
        notes: `PEMBAYARAN DITOLAK: ${reason}`,
        // Keep status as UNPAID or OVERDUE
      },
    });

    // Send WhatsApp notification to tenant
    try {
      const message = `Pembayaran Ditolak

Halo ${invoice.tenant.name},

Mohon maaf, pembayaran untuk tagihan ${invoice.invoiceNumber} periode ${invoice.period} tidak dapat kami terima.

Alasan: ${reason}

Mohon untuk mengupload bukti pembayaran yang benar dan sesuai.

Jumlah Tagihan: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}

Terima kasih atas perhatiannya.

Salam,
${process.env.NEXT_PUBLIC_PROPERTY_NAME || "Graha Maju"}`;

      await sendWANotification(invoice.tenant.phone, message);
    } catch (waError) {
      console.error("Failed to send WhatsApp notification:", waError);
      // Don't fail the request if WA notification fails
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
