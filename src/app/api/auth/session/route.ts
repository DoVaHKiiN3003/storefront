import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const account = await prisma.customerAccount.findUnique({
      where: { sessionToken: token },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!account) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({ authenticated: true, user: account });
  } catch (error) {
    console.error("Session check failed:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
