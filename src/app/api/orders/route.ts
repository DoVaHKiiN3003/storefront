import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      email,
      couponCode,
      discount,
      paymentIntent,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.name || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      return NextResponse.json(
        { error: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    // Upsert customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name: shippingAddress.name },
      create: {
        email,
        name: shippingAddress.name,
      },
    });

    // Create the order
    const order = await prisma.order.create({
      data: {
        email,
        subtotal,
        shipping: shipping ?? 0,
        tax: tax ?? 0,
        total,
        status: "confirmed",
        couponCode: couponCode ?? null,
        discount: discount ?? 0,
        shipName: shippingAddress.name,
        shipLine1: shippingAddress.line1,
        shipLine2: shippingAddress.line2 ?? "",
        shipCity: shippingAddress.city,
        shipState: shippingAddress.state,
        shipZip: shippingAddress.zip,
        paymentIntent: paymentIntent ?? null,
        customerId: customer.id,
        items: {
          create: items.map(
            (item: {
              id: number;
              name: string;
              price: number;
              image: string;
              quantity: number;
              variant?: string;
            }) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              variant: item.variant ?? null,
            })
          ),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Update product analytics (purchases + revenue)
    for (const item of items) {
      await prisma.productAnalytics.upsert({
        where: { productId: item.id },
        update: {
          purchases: { increment: item.quantity },
          revenue: { increment: item.price * item.quantity },
        },
        create: {
          productId: item.id,
          purchases: item.quantity,
          revenue: item.price * item.quantity,
        },
      });
    }

    // Increment coupon usage if applied
    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;
    const myOrders = searchParams.get("my") === "true";

    const where: Record<string, unknown> = {};

    // If filtering by customer account
    if (myOrders) {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      if (token) {
        const account = await prisma.customerAccount.findUnique({
          where: { sessionToken: token },
          select: { id: true },
        });
        if (account) {
          where.customerAccountId = account.id;
        } else {
          // Invalid or missing token — return empty
          return NextResponse.json({ orders: [], total: 0, limit, offset });
        }
      } else {
        return NextResponse.json({ orders: [], total: 0, limit, offset });
      }
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { shipName: { contains: search } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, limit, offset });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
