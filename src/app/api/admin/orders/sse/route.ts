import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Store connected clients
const clients = new Set<(data: string) => void>();

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  
  // Simple auth check for SSE
  if (!token || token !== process.env.ADMIN_SSE_TOKEN) {
    // Allow unauthenticated in dev mode
    if (process.env.NODE_ENV !== "development") {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let lastCheck = Date.now();
  let lastOrderCount = await prisma.order.count();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Stream closed
        }
      };

      // Initial connection message
      send(JSON.stringify({ type: "connected", message: "SSE connected" }));

      clients.add(send);

      // Poll for new orders every 3 seconds
      const interval = setInterval(async () => {
        try {
          const currentCount = await prisma.order.count();
          if (currentCount > lastOrderCount) {
            const newOrders = await prisma.order.findMany({
              where: {
                createdAt: { gte: new Date(lastCheck) },
              },
              include: {
                items: true,
              },
              orderBy: { createdAt: "desc" },
            });

            for (const order of newOrders) {
              send(JSON.stringify({
                type: "new_order",
                order: {
                  id: order.id,
                  email: order.email,
                  total: order.total,
                  status: order.status,
                  shipName: order.shipName,
                  shipCity: order.shipCity,
                  items: order.items,
                  createdAt: order.createdAt,
                },
              }));
            }

            lastOrderCount = currentCount;
          }

          // Send heartbeat every 10 seconds
          send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));

          lastCheck = Date.now();
        } catch {
          clearInterval(interval);
          clients.delete(send);
        }
      }, 3000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clients.delete(send);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
