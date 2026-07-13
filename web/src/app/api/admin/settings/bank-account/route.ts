import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Get bank account
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { isActive: true },
    });

    return NextResponse.json({ bankAccount });
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or update bank account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, accountName, accountNumber } = body;

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Bank name, account name, and account number are required" },
        { status: 400 }
      );
    }

    // Deactivate all existing bank accounts
    await prisma.bankAccount.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        isActive: true,
      },
    });

    return NextResponse.json({ bankAccount }, { status: 201 });
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
