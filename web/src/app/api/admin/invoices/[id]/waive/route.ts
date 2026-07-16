import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
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
    const body = await request.json();
    const { reason, sendNotification = true } = body;

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

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Cannot waive already paid invoice" },
        { status: 400 }
      );
    }

    if (invoice.status === "WAIVED") {
      return NextResponse.json(
        { error: "Invoice already waived" },
        { status: 400 }
      );
    }

    // Update invoice status to WAIVED
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: "WAIVED",
        notes: reason ? `DIBEBASKAN: ${reason}` : "Dibebaskan oleh admin",
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "PAYMENT_REMINDER", // Reusing type since we don't have a specific waive type
        title: "Invoice Dibebaskan",
        message: `Invoice ${invoice.invoiceNumber} untuk ${invoice.tenant.name} periode ${invoice.period} telah dibebaskan${reason ? `: ${reason}` : ""}`,
        entityId: invoice.id,
        entityType: "INVOICE",
        tenantId: invoice.tenantId,
      },
    });

    // Send notification if requested
    if (sendNotification) {
      const dueDateFormatted = format(invoice.dueDate, "dd MMMM yyyy", { locale: idLocale });

      // Send WhatsApp notification to tenant
      const waMessage = `Invoice Dibebaskan

Halo ${invoice.tenant.name},

Tagihan ${invoice.invoiceNumber} untuk periode ${invoice.period} telah dibebaskan oleh admin.

Rincian:
- Unit: ${invoice.unit.name || ""} - ${invoice.unit.unitNumber}
- Jumlah: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}
- Jatuh Tempo: ${dueDateFormatted}
${reason ? `\nAlasan: ${reason}` : ""}

Jika ada pertanyaan, silakan hubungi kami.

Terima kasih.`;

      try {
        await sendWANotification(invoice.tenant.phone, waMessage);
      } catch (waError) {
        console.error("Failed to send WhatsApp notification for waived invoice:", waError);
      }

      // Create notification for tenant
      await prisma.notification.create({
        data: {
          recipient: "TENANT",
          type: "PAYMENT_REMINDER", // Reusing type
          title: "Invoice Dibebaskan",
          message: `Tagihan ${invoice.period} telah dibebaskan${reason ? `: ${reason}` : ""}`,
          entityId: invoice.id,
          entityType: "INVOICE",
          tenantId: invoice.tenantId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: "Invoice berhasil dibebaskan",
    });
  } catch (error) {
    console.error("Error waiving invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
