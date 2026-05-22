import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category");

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { category: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      include: {
        variants: true,
        productStats: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = (products as Array<Record<string, unknown>>).map((p) => ({
      ...p,
      images: JSON.parse(p.images as string),
      details: JSON.parse(p.details as string),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
