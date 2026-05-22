import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const days = Math.min(Number(searchParams.get("days")) || 90, 365);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: Record<string, unknown> = {
      createdAt: { gte: since },
    };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "Order ID",
      "Date",
      "Status",
      "Customer Name",
      "Email",
      "Items",
      "Subtotal",
      "Shipping",
      "Tax",
      "Total",
      "Coupon",
      "Ship City",
      "Ship State",
    ];

    const rows = (orders as Array<{ id: number; createdAt: Date; status: string; shipName: string | null; email: string | null; items: Array<{ quantity: number; name: string }>; subtotal: number; shipping: number; tax: number; total: number; couponCode: string | null; shipCity: string | null; shipState: string | null }>).map((order) => [
      `#${order.id.toString().padStart(4, "0")}`,
      new Date(order.createdAt).toISOString().split("T")[0],
      order.status,
      order.shipName,
      order.email,
      order.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
      order.subtotal.toFixed(2),
      order.shipping.toFixed(2),
      order.tax.toFixed(2),
      order.total.toFixed(2),
      order.couponCode || "",
      order.shipCity,
      order.shipState,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export orders:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
