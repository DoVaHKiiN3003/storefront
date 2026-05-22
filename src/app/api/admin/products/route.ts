import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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
    console.error("Failed to fetch admin products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variants, images, details, ...productData } = body;

    // Validate required fields
    const required = ["slug", "name", "price", "category", "image", "description"];
    for (const field of required) {
      if (!productData[field]) {
        return NextResponse.json(
          { error: `Field "${field}" is required` },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        price: parseFloat(productData.price),
        stock: productData.stock ?? 100,
        isFeatured: productData.isFeatured ?? false,
        images: JSON.stringify(images ?? []),
        details: JSON.stringify(details ?? []),
        variants: variants?.length
          ? {
              create: variants.map(
                (v: { label: string; type: string; priceDelta?: number; color?: string }) => ({
                  label: v.label,
                  type: v.type,
                  priceDelta: v.priceDelta ?? 0,
                  color: v.color ?? null,
                })
              ),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    // Create product analytics row
    await prisma.productAnalytics.create({
      data: { productId: product.id },
    });

    return NextResponse.json(
      {
        ...product,
        images: JSON.parse(product.images),
        details: JSON.parse(product.details),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, variants, images, details, ...productData } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...productData };
    if (productData.price) updateData.price = parseFloat(productData.price);
    if (images) updateData.images = JSON.stringify(images);
    if (details) updateData.details = JSON.stringify(details);

    // Update product
    const product = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    // Update variants if provided
    if (variants?.length) {
      // Delete existing variants and recreate
      await prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });
      await prisma.productVariant.createMany({
        data: variants.map(
          (v: { label: string; type: string; priceDelta?: number; color?: string }) => ({
            productId: product.id,
            label: v.label,
            type: v.type,
            priceDelta: v.priceDelta ?? 0,
            color: v.color ?? null,
          })
        ),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true },
    });

    return NextResponse.json({
      ...updated,
      images: JSON.parse(updated!.images),
      details: JSON.parse(updated!.details),
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
