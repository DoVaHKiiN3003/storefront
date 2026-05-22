import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock");
    const threshold = Math.max(1, Number(searchParams.get("threshold")) || 10);

    const products = await prisma.product.findMany({
      include: {
        variants: true,
        productStats: true,
      },
      orderBy: { stock: "asc" },
    });

    const inventory = (products as Array<{ id: number; name: string; slug: string; category: string; stock: number; image: string; price: number; variants: Array<{ stock: number }>; productStats: { purchases: number } | null }>).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      stock: p.stock,
      image: p.image,
      price: p.price,
      isLowStock: p.stock <= threshold,
      isOutOfStock: p.stock === 0,
      totalVariantStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      variantCount: p.variants.length,
      purchases: p.productStats?.purchases ?? 0,
    }));

    const lowStockItems = inventory.filter((p) => p.isLowStock);
    const outOfStockItems = inventory.filter((p) => p.isOutOfStock);

    const filtered = lowStock === "true" ? lowStockItems : inventory;

    return NextResponse.json({
      products: filtered,
      summary: {
        total: inventory.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length,
        threshold,
      },
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stock } = body;

    if (!productId || stock === undefined || stock < 0) {
      return NextResponse.json({ error: "Valid productId and stock (>= 0) are required" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });

    return NextResponse.json({
      id: product.id,
      name: product.name,
      stock: product.stock,
    });
  } catch (error) {
    console.error("Failed to update inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
