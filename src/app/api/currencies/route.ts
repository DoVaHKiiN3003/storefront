import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const currencies = await prisma.currencyRate.findMany({
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, symbol, rateToUSD } = body;

    if (!code || !name || !symbol || rateToUSD === undefined) {
      return NextResponse.json({ error: "Code, name, symbol, and rateToUSD are required" }, { status: 400 });
    }

    const currency = await prisma.currencyRate.upsert({
      where: { code: code.toUpperCase() },
      update: { rateToUSD, name, symbol },
      create: {
        code: code.toUpperCase(),
        name,
        symbol,
        rateToUSD,
      },
    });

    return NextResponse.json(currency, { status: 201 });
  } catch (error) {
    console.error("Failed to create/update currency:", error);
    return NextResponse.json({ error: "Failed to save currency" }, { status: 500 });
  }
}
