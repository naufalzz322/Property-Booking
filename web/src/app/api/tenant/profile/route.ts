import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify this is a tenant session (not admin)
    const userRole = (session.user as any).role;
    if (userRole === "ADMIN" || userRole === "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tenant from session
    const tenant = await prisma.tenant.findFirst({
      where: { email: session.user.email },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const body = await request.json();
    const { phone, emergencyName, emergencyPhone } = body;

    const updateData: any = {};

    if (phone !== undefined) {
      // Validate phone format
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      const cleanPhone = phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: "Invalid phone number format" },
          { status: 400 }
        );
      }
      updateData.phone = cleanPhone;
    }

    if (emergencyName !== undefined) {
      updateData.emergencyName = emergencyName || null;
    }

    if (emergencyPhone !== undefined) {
      if (emergencyPhone) {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
        const cleanPhone = emergencyPhone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanPhone)) {
          return NextResponse.json(
            { error: "Invalid emergency phone number format" },
            { status: 400 }
          );
        }
        updateData.emergencyPhone = cleanPhone;
      } else {
        updateData.emergencyPhone = null;
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      tenant: {
        id: updatedTenant.id,
        phone: updatedTenant.phone,
        emergencyName: updatedTenant.emergencyName,
        emergencyPhone: updatedTenant.emergencyPhone,
      },
    });
  } catch (error) {
    console.error("Error updating tenant profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
