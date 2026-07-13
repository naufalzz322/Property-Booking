import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Get property settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.propertySettings.findFirst();

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.propertySettings.create({
        data: {},
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching property settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update property settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      defaultCheckInTime,
      defaultCheckOutTime,
      minimumStayNights,
      maximumAdvanceBooking,
      depositPercentage,
      defaultDueDateDays,
      lateFeePercentage,
      whatsappOwner,
      emailOwner,
      notifyNewBooking,
      notifyPaymentReceived,
      notifyOverdue,
      notifyVacancyReport,
      reminderDays,
    } = body;

    let settings = await prisma.propertySettings.findFirst();

    if (!settings) {
      settings = await prisma.propertySettings.create({
        data: {
          defaultCheckInTime: defaultCheckInTime || "14:00",
          defaultCheckOutTime: defaultCheckOutTime || "12:00",
          minimumStayNights: minimumStayNights || 1,
          maximumAdvanceBooking: maximumAdvanceBooking || 90,
          depositPercentage: depositPercentage || 100,
          defaultDueDateDays: defaultDueDateDays || 7,
          lateFeePercentage: lateFeePercentage || 2,
          whatsappOwner: whatsappOwner || null,
          emailOwner: emailOwner || null,
          notifyNewBooking: notifyNewBooking ?? true,
          notifyPaymentReceived: notifyPaymentReceived ?? true,
          notifyOverdue: notifyOverdue ?? true,
          notifyVacancyReport: notifyVacancyReport ?? true,
          reminderDays: reminderDays || "1,3,7",
        },
      });
    } else {
      settings = await prisma.propertySettings.update({
        where: { id: settings.id },
        data: {
          defaultCheckInTime,
          defaultCheckOutTime,
          minimumStayNights,
          maximumAdvanceBooking,
          depositPercentage,
          defaultDueDateDays,
          lateFeePercentage,
          whatsappOwner,
          emailOwner,
          notifyNewBooking,
          notifyPaymentReceived,
          notifyOverdue,
          notifyVacancyReport,
          reminderDays,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating property settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
