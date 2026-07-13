import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Generate new password
  const newPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.tenant.update({
    where: { id },
    data: { passwordHash },
  });

  // TODO: Send email to tenant with new password
  // await sendResetPasswordEmail({ email: tenant.email, password: newPassword });

  return NextResponse.json({
    success: true,
    message: "Password berhasil direset",
    // For demo purposes, return the password (remove in production)
    tempPassword: newPassword,
  });
}
