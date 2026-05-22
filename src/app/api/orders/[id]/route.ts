import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

async function sendStatusEmail(order: {
  id: number;
  email: string;
  shipName: string;
  status: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  // Attempt to send email via the send-confirmation pattern
  // Uses the same Resend integration if available
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being processed.",
    shipped: "Your order has been shipped and is on its way!",
    delivered: "Your order has been delivered. We hope you love it!",
    cancelled: "Your order has been cancelled. If you have questions, please contact us.",
  };

  const message = statusMessages[order.status];
  if (!message) return;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return; // Silently skip if Resend not configured

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "STORE <orders@store.example.com>",
        to: order.email,
        subject: `Order #${String(order.id).padStart(4, "0")} — ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Order Status Update</h1>
            <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Hi ${order.shipName},</p>
            <p style="color: #666; font-size: 14px; margin: 0 0 24px;">${message}</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #999; margin: 0 0 8px;">Order #${String(order.id).padStart(4, "0")}</p>
              ${order.items.slice(0, 5).map((item) => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; border-bottom: 1px solid #eee;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join("")}
              <div style="display: flex; justify-content: space-between; padding: 8px 0 0; font-size: 14px; font-weight: 600;">
                <span>Total</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>
            <p style="color: #999; font-size: 12px; margin: 0;">Thank you for shopping at STORE.</p>
          </div>
        `,
      }),
    });
  } catch {
    // Email sending is best-effort; don't block the order update
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, paymentIntent } = body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentIntent) updateData.paymentIntent = paymentIntent;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        customer: true,
      },
    });

    // Send email notification for status changes (non-blocking)
    if (status && status !== "pending") {
      sendStatusEmail(order).catch(() => {});
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
