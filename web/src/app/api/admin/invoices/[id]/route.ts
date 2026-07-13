import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            contractStart: true,
            contractEnd: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            pricePerMonth: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Convert Decimal to number
    const invoiceData = {
      ...invoice,
      rentAmount: Number(invoice.rentAmount),
      electricAmount: Number(invoice.electricAmount),
      waterAmount: Number(invoice.waterAmount),
      otherAmount: Number(invoice.otherAmount),
      totalAmount: Number(invoice.totalAmount),
      unit: {
        ...invoice.unit,
        pricePerMonth: invoice.unit.pricePerMonth
          ? Number(invoice.unit.pricePerMonth)
          : null,
      },
    };

    return NextResponse.json({ invoice: invoiceData });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rentAmount, electricAmount, waterAmount, otherAmount, dueDate, notes } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Can only edit UNPAID invoices
    if (invoice.status !== "UNPAID") {
      return NextResponse.json({ error: "Hanya invoice dengan status UNPAID yang bisa diedit" }, { status: 400 });
    }

    // Calculate total
    const newRentAmount = rentAmount ?? Number(invoice.rentAmount);
    const newElectricAmount = electricAmount ?? Number(invoice.electricAmount);
    const newWaterAmount = waterAmount ?? Number(invoice.waterAmount);
    const newOtherAmount = otherAmount ?? Number(invoice.otherAmount);
    const totalAmount = newRentAmount + newElectricAmount + newWaterAmount + newOtherAmount;

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        rentAmount: newRentAmount,
        electricAmount: newElectricAmount,
        waterAmount: newWaterAmount,
        otherAmount: newOtherAmount,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
        notes: notes ?? invoice.notes,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        rentAmount: Number(updatedInvoice.rentAmount),
        electricAmount: Number(updatedInvoice.electricAmount),
        waterAmount: Number(updatedInvoice.waterAmount),
        otherAmount: Number(updatedInvoice.otherAmount),
        totalAmount: Number(updatedInvoice.totalAmount),
        dueDate: updatedInvoice.dueDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
