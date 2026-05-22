import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { variants, images, details, ...productData } = body;

    const updateData: Record<string, unknown> = { ...productData };
    if (productData.price !== undefined) updateData.price = parseFloat(productData.price);
    if (images) updateData.images = JSON.stringify(images);
    if (details) updateData.details = JSON.stringify(details);

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Update variants if provided
    if (variants?.length) {
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
      include: { variants: true, productStats: true },
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
