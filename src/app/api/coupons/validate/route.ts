import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon code is no longer active" },
        { status: 400 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This coupon code has expired" },
        { status: 400 }
      );
    }

    // Check max uses
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "This coupon code has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check minimum order amount
    const orderSubtotal = subtotal ?? 0;
    if (orderSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required`,
          minOrderAmount: coupon.minOrderAmount,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    let label = "";

    if (coupon.type === "percentage") {
      discount = orderSubtotal * (coupon.value / 100);
      label = `${coupon.value}% off your order`;
    } else if (coupon.type === "fixed") {
      discount = Math.min(coupon.value, orderSubtotal);
      label = `$${coupon.value.toFixed(0)} off your order`;
    } else if (coupon.type === "freeshipping") {
      label = "Free shipping";
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      label,
      minOrderAmount: coupon.minOrderAmount,
    });
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
