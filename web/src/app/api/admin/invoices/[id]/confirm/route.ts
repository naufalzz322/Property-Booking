import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { getPropertyEmail } from "@/lib/property";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
        { error: "Invoice already paid" },
        { status: 400 }
      );
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Update related booking status to PAID
    if (invoice.bookingId) {
      await prisma.booking.update({
        where: { id: invoice.bookingId },
        data: { status: "PAID" },
      });

      // Create booking event
      await prisma.bookingEvent.create({
        data: {
          bookingId: invoice.bookingId,
          eventType: "PAID",
          message: `Pembayaran invoice ${invoice.invoiceNumber} dikonfirmasi`,
          metadata: {
            invoiceId: invoice.id,
            totalAmount: Number(invoice.totalAmount),
            paidAt: new Date().toISOString(),
          },
        },
      });
    }

    // Send WhatsApp notification to tenant
    try {
      const paidAtFormatted = format(new Date(), "dd MMMM yyyy", { locale: idLocale });
      const waMessage = `Pembayaran Dikonfirmasi

Halo ${invoice.tenant.name},

Pembayaran tagihan ${invoice.invoiceNumber} untuk periode ${invoice.period} telah kami terima dan konfirmasi.

Jumlah: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}
Tanggal Bayar: ${paidAtFormatted}

Terima kasih atas pembayarannya!

Salam,
${process.env.NEXT_PUBLIC_PROPERTY_NAME || "Graha Maju"}`;

      await sendWANotification(invoice.tenant.phone, waMessage);
    } catch (waError) {
      console.error("Failed to send WhatsApp notification:", waError);
      // Don't fail the request if WA notification fails
    }

    // Send email notification
    try {
      const replyTo = await getPropertyEmail();
      await sendPaymentConfirmationEmail({
        tenantEmail: invoice.tenant.email,
        tenantName: invoice.tenant.name,
        invoiceNumber: invoice.invoiceNumber,
        period: invoice.period,
        amount: Number(invoice.totalAmount),
        paidAt: format(new Date(), "dd MMMM yyyy", { locale: idLocale }),
        replyTo,
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
