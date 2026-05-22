import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(Number(searchParams.get("days")) || 30, 365);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Run all queries in parallel
    const [
      totalOrders,
      totalRevenue,
      recentOrders,
      recentAnalyticsEvents,
      recentPageViews,
      productStats,
      orderCountByStatus,
      ordersByDay,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
      }),

      // Recent orders (last 20)
      prisma.order.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          customer: true,
        },
      }),

      // Recent analytics events (last 50)
      prisma.analyticsEvent.findMany({
        take: 50,
        orderBy: { timestamp: "desc" },
      }),

      // Recent page views (last 100)
      prisma.pageView.findMany({
        take: 100,
        orderBy: { timestamp: "desc" },
      }),

      // Product analytics with product data
      prisma.productAnalytics.findMany({
        include: {
          product: true,
        },
        orderBy: { views: "desc" },
        take: 20,
      }),

      // Order count by status
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Orders in the last 7 days (bucketed by day for chart)
      prisma.$queryRawUnsafe<Array<{ day: string; count: number; revenue: number }>>(
        `SELECT DATE(created_at) as day, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
         FROM "Order"
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY day ASC`
      ),
    ]);

    // Compute page view stats
    const totalPageViews = recentPageViews.length;
    const uniquePaths = new Set(recentPageViews.map((v: { path: string }) => v.path)).size;

    // Compute analytics event stats
    const purchaseEvents = recentAnalyticsEvents.filter(
      (e: { name: string }) => e.name === "purchase"
    );
    const addToCartEvents = recentAnalyticsEvents.filter(
      (e: { name: string }) => e.name === "add_to_cart"
    );
    const totalPurchases = purchaseEvents.length;
    const totalAddToCarts = addToCartEvents.length;
    const totalRevenueFromEvents = purchaseEvents.reduce((sum: number, e: { params: string }) => {
      try {
        const params = JSON.parse(e.params);
        return sum + (params.value ?? 0);
      } catch {
        return sum;
      }
    }, 0);

    const conversionRate =
      totalPageViews > 0
        ? (totalAddToCarts / totalPageViews) * 100
        : 0;

    const cartToPurchaseRate =
      totalAddToCarts > 0
        ? (totalPurchases / totalAddToCarts) * 100
        : 0;

    // Top paths from page views
    const viewsByPath = new Map<string, number>();
    for (const v of recentPageViews as { path: string }[]) {
      viewsByPath.set(v.path, (viewsByPath.get(v.path) ?? 0) + 1);
    }
    const topPaths = [...viewsByPath.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Analytics events over time (last 7 days bucketed by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFiltered = recentAnalyticsEvents.filter(
      (e: { timestamp: Date | string }) => new Date(e.timestamp) >= sevenDaysAgo
    );
    const eventsByDay = new Map<string, number>();
    for (const e of recentFiltered as { timestamp: Date | string }[]) {
      const day = new Date(e.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
    }

    return NextResponse.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      recentOrders,
      totalPageViews,
      uniquePaths,
      totalAddToCarts,
      totalPurchases,
      totalRevenueFromEvents,
      conversionRate,
      cartToPurchaseRate,
      productStats: (productStats as Array<{ productId: number; product: { name: string; category: string }; views: number; addToCarts: number; wishlistAdds: number; purchases: number; revenue: number }>).map((ps) => ({
        id: ps.productId,
        name: ps.product.name,
        category: ps.product.category,
        views: ps.views,
        addToCarts: ps.addToCarts,
        wishlistAdds: ps.wishlistAdds,
        purchases: ps.purchases,
        revenue: ps.revenue,
      })),
      topPaths,
      eventsByDay: [...eventsByDay.entries()],
      ordersByDay,
      orderCountByStatus: (orderCountByStatus as Array<{ status: string; _count: number }>).map((o) => ({
        status: o.status,
        count: o._count,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
