"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Search,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Package,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";
import { analyticsStore, type StoredEvent } from "../lib/analyticsStore";
import InventoryTab from "./components/InventoryTab";
import ReviewsTab from "./components/ReviewsTab";
import BlogTab from "./components/BlogTab";
import CurrenciesTab from "./components/CurrenciesTab";

// ── Types ──────────────────────────────────────────────

interface Metrics {
  totalPageViews: number;
  uniquePaths: number;
  totalAddToCarts: number;
  totalPurchases: number;
  totalRevenue: number;
  totalSearches: number;
  totalWishlistAdds: number;
  conversionRate: number;
  cartToPurchaseRate: number;
  topProducts: Array<{
    id: number;
    name: string;
    category: string;
    views: number;
    addToCarts: number;
    wishlistAdds: number;
    purchases: number;
    revenue: number;
  }>;
  recentEvents: StoredEvent[];
  topPaths: Array<[string, number]>;
  eventsByDay: Array<[string, number]>;
  trafficSource: {
    source: string;
    medium: string;
    campaign: string | null;
    firstSeen: number;
    pageViews: number;
  } | null;
}

interface DbOrder {
  id: number;
  email: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  couponCode: string | null;
  shipName: string;
  shipCity: string;
  shipState: string;
  createdAt: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface DbMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalPageViews: number;
  totalAddToCarts: number;
  totalPurchases: number;
  conversionRate: number;
  cartToPurchaseRate: number;
  productStats: Array<{
    id: number;
    name: string;
    category: string;
    views: number;
    addToCarts: number;
    wishlistAdds: number;
    purchases: number;
    revenue: number;
  }>;
  orderCountByStatus: Array<{ status: string; count: number }>;
}

// ── Helpers ────────────────────────────────────────────

const eventColors: Record<string, string> = {
  view_item: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  add_to_cart: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  remove_from_cart: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  begin_checkout: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  add_shipping_info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  add_payment_info: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  purchase: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  add_to_wishlist: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  remove_from_wishlist: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  search: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
};



function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function eventLabel(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Bar Chart Component (pure CSS, no deps) ───────────

function BarChart({
  data,
  height = 160,
  barColor = "bg-espresso/50 dark:bg-cream/40",
  maxValue,
}: {
  data: Array<[string, number]>;
  height?: number;
  barColor?: string;
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map(([label, value]) => {
        const pct = (value / max) * 100;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-mono font-medium text-espresso-muted/60 dark:text-espresso-muted/50 tabular-nums">
              {value}
            </span>
            <div
              className={`w-full rounded-sm transition-all duration-500 ease-out ${barColor}`}
              style={{ height: `${Math.max(pct, 2)}%` }}
              title={`${label}: ${value}`}
            />
            <span className="text-[9px] text-espresso-muted/40 dark:text-espresso-muted/30 whitespace-nowrap overflow-hidden text-ellipsis max-w-[48px] text-center">
              {label.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────

function KpiCard({
  label,
  value,
  prefix,
  suffix,
  change,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: React.ElementType;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-5 transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(60,47,42,0.08)] dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-espresso-muted/50 dark:text-espresso-muted/40">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-espresso/5 dark:bg-cream/5 flex items-center justify-center text-espresso/50 dark:text-cream/50 shrink-0">
          <Icon size={14} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        {prefix && (
          <span className="text-sm text-espresso-muted/50 dark:text-espresso-muted/40 font-medium">
            {prefix}
          </span>
        )}
        <span className="text-2xl font-semibold tracking-tight text-espresso dark:text-cream tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {suffix && (
          <span className="text-sm text-espresso-muted/50 dark:text-espresso-muted/40 font-medium">
            {suffix}
          </span>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" ? (
            <ArrowUpRight size={12} className="text-emerald-500" />
          ) : trend === "down" ? (
            <ArrowDownRight size={12} className="text-rose-500" />
          ) : null}
          <span
            className={`text-[11px] font-medium tabular-nums ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-espresso-muted/40"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "products" | "orders" | "inventory" | "reviews" | "blog" | "currencies">("overview");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dbMetrics, setDbMetrics] = useState<DbMetrics | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setMetrics(analyticsStore.getMetrics());
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders?limit=50");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      console.warn("Failed to fetch orders");
    }
    setOrdersLoading(false);
  }, []);

  const fetchDbMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard?days=30");
      const data = await res.json();
      if (data.totalOrders !== undefined) setDbMetrics(data);
    } catch {
      console.warn("Failed to fetch DB metrics");
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: number, status: string) => {
    setUpdatingOrder(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
      fetchDbMetrics();
    } catch {
      console.warn("Failed to update order status");
    }
    setUpdatingOrder(null);
  }, [fetchOrders, fetchDbMetrics]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem("storefront-session");
        if (!stored) {
          router.push("/login");
          return;
        }
        const { token } = JSON.parse(stored);
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/login");
          return;
        }
        if (data.user?.role !== "admin") {
          router.push("/");
          return;
        }
        setCheckingAuth(false);
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    refresh();
    fetchOrders();
    fetchDbMetrics();
  }, [refresh, fetchOrders, fetchDbMetrics]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refresh();
      if (activeTab === "orders") fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh, activeTab, fetchOrders]);

  const handleClear = () => {
    analyticsStore.clear();
    refresh();
  };

  if (checkingAuth) {
    return (
      <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-[1400px] mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="h-4 w-72 skeleton rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-[1400px] mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="h-4 w-72 skeleton rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = metrics.totalPageViews > 0;

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-espresso dark:bg-cream text-cream dark:text-espresso flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-espresso dark:text-cream">
              Analytics
            </h1>
          </div>
          <p className="text-sm text-espresso-muted/60 dark:text-espresso-muted/50 mt-1">
            Real-time storefront analytics from the current session.
            {hasData && (
              <span className="text-espresso-muted/40 dark:text-espresso-muted/30 ml-1">
                Last updated {formatTime(Date.now())}.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all duration-300 ${
              autoRefresh
                ? "bg-espresso text-cream dark:bg-cream dark:text-espresso"
                : "bg-espresso/5 text-espresso-muted hover:bg-espresso/10 dark:bg-cream/5 dark:text-espresso-muted"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {autoRefresh ? "Live" : "Paused"}
            </span>
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-rose-50 hover:text-rose-600 dark:bg-cream/5 dark:text-espresso-muted dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all duration-300"
          >
            Clear Data
          </button>
        </div>
      </div>

      {!hasData ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-espresso/5 dark:bg-cream/5 flex items-center justify-center mb-5">
            <Activity size={24} className="text-espresso/20 dark:text-cream/20" />
          </div>
          <h2 className="text-lg font-medium text-espresso dark:text-cream mb-2">
            No analytics data yet
          </h2>
          <p className="text-sm text-espresso-muted/60 dark:text-espresso-muted/50 max-w-sm">
            Start browsing the storefront — page views, add-to-cart events,
            and purchases will appear here in real time.
          </p>
        </div>
      ) : (
        <>
          {/* ── Tab Navigation ── */}
          <div className="flex gap-1 mb-8 p-1 bg-espresso/5 dark:bg-cream/5 rounded-2xl w-fit">
            {(["overview", "events", "products", "orders", "inventory", "reviews", "blog", "currencies"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-[11px] font-medium uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white dark:bg-white/10 text-espresso dark:text-cream shadow-[0_2px_8px_-2px_rgba(60,47,42,0.08)] dark:shadow-none"
                    : "text-espresso-muted/50 hover:text-espresso dark:text-espresso-muted/50 dark:hover:text-espresso-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              {/* ── KPI Grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard
                  label="Page Views"
                  value={metrics.totalPageViews}
                  icon={Eye}
                  change={0}
                  trend="up"
                />
                <KpiCard
                  label="Add to Cart"
                  value={metrics.totalAddToCarts}
                  icon={ShoppingCart}
                  change={metrics.conversionRate}
                  suffix="%"
                  trend={metrics.conversionRate > 0 ? "up" : undefined}
                />
                <KpiCard
                  label="Conversions"
                  value={metrics.totalPurchases}
                  icon={TrendingUp}
                  change={metrics.cartToPurchaseRate}
                  suffix="%"
                  trend={metrics.cartToPurchaseRate > 0 ? "up" : undefined}
                />
                <KpiCard
                  label="Revenue"
                  value={`$${metrics.totalRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  change={0}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* ── Events Over Time Chart ── */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-espresso dark:text-cream">
                        Events (Last 7 Days)
                      </h3>
                      <p className="text-[11px] text-espresso-muted/40 dark:text-espresso-muted/30 mt-0.5">
                        All tracked events bucketed by day
                      </p>
                    </div>
                    <span className="text-xs font-mono text-espresso-muted/40 dark:text-espresso-muted/30 tabular-nums">
                      {metrics.eventsByDay.reduce((s, [, v]) => s + v, 0)} total
                    </span>
                  </div>
                  {metrics.eventsByDay.length > 0 ? (
                    <BarChart
                      data={metrics.eventsByDay}
                      height={180}
                      barColor="bg-espresso/50 dark:bg-cream/40"
                    />
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-xs text-espresso-muted/30 dark:text-espresso-muted/20">
                      No events in the last 7 days
                    </div>
                  )}
                </div>

                {/* ── Traffic Source ── */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
                  <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">
                    Traffic Source
                  </h3>
                  {metrics.trafficSource ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-espresso/5 dark:border-cream/5">
                        <span className="text-[11px] uppercase tracking-wider text-espresso-muted/50 dark:text-espresso-muted/40">
                          Source
                        </span>
                        <span className="text-sm font-medium text-espresso dark:text-cream capitalize">
                          {metrics.trafficSource.source}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-espresso/5 dark:border-cream/5">
                        <span className="text-[11px] uppercase tracking-wider text-espresso-muted/50 dark:text-espresso-muted/40">
                          Medium
                        </span>
                        <span className="text-sm font-medium text-espresso dark:text-cream">
                          {metrics.trafficSource.medium}
                        </span>
                      </div>
                      {metrics.trafficSource.campaign && (
                        <div className="flex items-center justify-between py-2 border-b border-espresso/5 dark:border-cream/5">
                          <span className="text-[11px] uppercase tracking-wider text-espresso-muted/50 dark:text-espresso-muted/40">
                            Campaign
                          </span>
                          <span className="text-sm font-medium text-espresso dark:text-cream">
                            {metrics.trafficSource.campaign}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[11px] uppercase tracking-wider text-espresso-muted/50 dark:text-espresso-muted/40">
                          Page Views
                        </span>
                        <span className="text-sm font-mono font-semibold text-espresso dark:text-cream tabular-nums">
                          {metrics.trafficSource.pageViews}
                        </span>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[10px] text-espresso-muted/30 dark:text-espresso-muted/20">
                          <span>First visit</span>
                          <span className="font-mono tabular-nums">
                            {new Date(metrics.trafficSource.firstSeen).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-xs text-espresso-muted/30 dark:text-espresso-muted/20">
                      No traffic data yet
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* ── Most Viewed Pages ── */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
                  <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">
                    Most Viewed Pages
                  </h3>
                  {metrics.topPaths.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.topPaths.map(([path, count], i) => {
                        const maxCount = metrics.topPaths[0][1];
                        const pct = (count / maxCount) * 100;
                        return (
                          <div key={path} className="flex items-center gap-3">
                            <span className="w-5 text-[10px] font-mono text-espresso-muted/30 dark:text-espresso-muted/20 text-right tabular-nums">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-espresso dark:text-cream truncate font-medium">
                                  {path === "/" ? "Home" : path}
                                </span>
                                <span className="text-[10px] font-mono text-espresso-muted/50 dark:text-espresso-muted/40 tabular-nums ml-3 shrink-0">
                                  {count}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-espresso/5 dark:bg-cream/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-espresso/40 dark:bg-cream/30 transition-all duration-700 ease-out"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[160px] flex items-center justify-center text-xs text-espresso-muted/30 dark:text-espresso-muted/20">
                      No page views yet
                    </div>
                  )}
                </div>

                {/* ── Funnel Overview ── */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
                  <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">
                    Conversion Funnel
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Page Views",
                        value: metrics.totalPageViews,
                        color: "bg-espresso/50 dark:bg-cream/40",
                        pct: 100,
                      },
                      {
                        label: "Add to Cart",
                        value: metrics.totalAddToCarts,
                        color: "bg-espresso/35 dark:bg-cream/30",
                        pct:
                          metrics.totalPageViews > 0
                            ? (metrics.totalAddToCarts / metrics.totalPageViews) * 100
                            : 0,
                      },
                      {
                        label: "Checkout Started",
                        value: metrics.recentEvents.filter((e) =>
                          ["begin_checkout", "add_shipping_info"].includes(e.name)
                        ).length,
                        color: "bg-espresso/25 dark:bg-cream/20",
                        pct:
                          metrics.totalPageViews > 0
                            ? (metrics.recentEvents.filter((e) =>
                                ["begin_checkout", "add_shipping_info"].includes(e.name)
                              ).length /
                                metrics.totalPageViews) *
                              100
                            : 0,
                      },
                      {
                        label: "Purchases",
                        value: metrics.totalPurchases,
                        color: "bg-espresso/15 dark:bg-cream/10",
                        pct:
                          metrics.totalPageViews > 0
                            ? (metrics.totalPurchases / metrics.totalPageViews) * 100
                            : 0,
                      },
                    ].map((step) => (
                      <div key={step.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-espresso dark:text-cream font-medium">
                            {step.label}
                          </span>
                          <span className="text-[10px] font-mono text-espresso-muted/50 dark:text-espresso-muted/40 tabular-nums">
                            {step.value}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-espresso/5 dark:bg-cream/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${step.color}`}
                            style={{ width: `${Math.max(step.pct, 0.5)}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-espresso-muted/30 dark:text-espresso-muted/20 font-mono tabular-nums">
                          {step.pct.toFixed(1)}% conversion rate
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Quick Stats Row ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { label: "Searches", value: metrics.totalSearches, icon: Search },
                  { label: "Wishlist Adds", value: metrics.totalWishlistAdds, icon: Heart },
                  {
                    label: "Cart → Purchase",
                    value: `${metrics.cartToPurchaseRate.toFixed(1)}%`,
                    icon: TrendingUp,
                  },
                  {
                    label: "Avg. Value",
                    value: `$${metrics.totalPurchases > 0 ? (metrics.totalRevenue / metrics.totalPurchases).toFixed(0) : "0"}`,
                    icon: DollarSign,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 p-3.5 flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-espresso/5 dark:bg-cream/5 flex items-center justify-center text-espresso/40 dark:text-cream/40 shrink-0">
                      <stat.icon size={12} />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30">
                        {stat.label}
                      </div>
                      <div className="text-sm font-semibold text-espresso dark:text-cream tabular-nums mt-px">
                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "events" && (
            <>
              {/* ── Recent Events Feed ── */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-espresso/5 dark:border-cream/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-espresso dark:text-cream">
                      Recent Events
                    </h3>
                    <p className="text-[11px] text-espresso-muted/40 dark:text-espresso-muted/30 mt-0.5">
                      Last {metrics.recentEvents.length} events from this session
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-espresso-muted/30 dark:text-espresso-muted/20 tabular-nums">
                    {metrics.recentEvents.length} events
                  </span>
                </div>
                <div className="divide-y divide-espresso/5 dark:divide-cream/5 max-h-[600px] overflow-y-auto">
                  {metrics.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="px-6 py-3 flex items-center gap-4 hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors duration-200"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium shrink-0 ${
                          eventColors[event.name] ?? "bg-espresso/5 text-espresso/50 dark:bg-cream/5 dark:text-cream/50"
                        }`}
                      >
                        <Activity size={11} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-espresso dark:text-cream">
                            {eventLabel(event.name)}
                          </span>
                          <span className="text-[9px] font-mono text-espresso-muted/30 dark:text-espresso-muted/20 tabular-nums">
                            {event.path}
                          </span>
                        </div>
                        {Array.isArray(event.params.items) && event.params.items.length > 0 && (
                          <div className="text-[10px] text-espresso-muted/50 dark:text-espresso-muted/40 mt-0.5 truncate">
                            {(event.params.items as Array<{ item_name?: string }>)
                              .slice(0, 2)
                              .map((i) => i.item_name)
                              .filter(Boolean)
                              .join(", ")}
                            {(event.params.items as Array<{ item_name?: string }>).length > 2 &&
                              ` +${(event.params.items as Array<{ item_name?: string }>).length - 2} more`}
                          </div>
                        )}
                        {event.name === "search" && typeof event.params.search_term === "string" && (
                          <div className="text-[10px] text-espresso-muted/50 dark:text-espresso-muted/40 mt-0.5">
                            &ldquo;{event.params.search_term}&rdquo;
                          </div>
                        )}
                        {event.name === "purchase" && typeof event.params.value === "number" && (
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                            ${event.params.value.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-espresso-muted/30 dark:text-espresso-muted/20 shrink-0 tabular-nums">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "products" && (
            <>
              {/* ── Top Products Table ── */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-espresso/5 dark:border-cream/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-espresso dark:text-cream">
                      Product Performance
                    </h3>
                    <p className="text-[11px] text-espresso-muted/40 dark:text-espresso-muted/30 mt-0.5">
                      Ranked by total page views
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-espresso-muted/30 dark:text-espresso-muted/20 tabular-nums">
                    {metrics.topProducts.length} products
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-espresso/5 dark:border-cream/5">
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium">
                          Product
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Views
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Cart
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Wishlist
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Purchases
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Conv. Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso/5 dark:divide-cream/5">
                      {metrics.topProducts.length > 0 ? (
                        metrics.topProducts.map((product) => {
                          const convRate =
                            product.views > 0
                              ? ((product.purchases / product.views) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors duration-200"
                            >
                              <td className="px-6 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-espresso/5 dark:bg-cream/5 flex items-center justify-center text-[9px] text-espresso-muted/40 dark:text-espresso-muted/30 font-mono font-medium shrink-0">
                                    {product.id}
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-medium text-espresso dark:text-cream">
                                      {product.name}
                                    </span>
                                    <span className="text-[9px] text-espresso-muted/40 dark:text-espresso-muted/30 ml-2">
                                      {product.category}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                                {product.views}
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                                {product.addToCarts}
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                                {product.wishlistAdds}
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                                {product.purchases}
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-emerald-600 dark:text-emerald-400 tabular-nums font-medium">
                                ${product.revenue.toFixed(0)}
                              </td>
                              <td className="px-6 py-3.5 text-right text-[11px] font-mono text-espresso-muted/50 dark:text-espresso-muted/40 tabular-nums">
                                {convRate}%
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-xs text-espresso-muted/30 dark:text-espresso-muted/20"
                          >
                            No product data yet. Browse some products to see stats.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <>
              {/* ── Orders Management ── */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-espresso/5 dark:border-cream/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-espresso dark:text-cream">
                      Orders
                    </h3>
                    <p className="text-[11px] text-espresso-muted/40 dark:text-espresso-muted/30 mt-0.5">
                      {dbMetrics
                        ? `${dbMetrics.totalOrders} total orders — $${dbMetrics.totalRevenue.toLocaleString()} revenue`
                        : "Loading order data..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/api/export/orders"
                      download
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-espresso/10 dark:bg-cream/5 dark:text-espresso-muted dark:hover:bg-cream/10 transition-all duration-300"
                    >
                      <Download size={11} />
                      CSV
                    </a>
                    <button
                      onClick={fetchOrders}
                      disabled={ordersLoading}
                      className="px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-espresso/10 dark:bg-cream/5 dark:text-espresso-muted dark:hover:bg-cream/10 transition-all duration-300 disabled:opacity-50"
                    >
                      {ordersLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-espresso/5 dark:border-cream/5">
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium">
                          Order
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium">
                          Items
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Total
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Status
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Date
                        </th>
                        <th className="px-6 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 dark:text-espresso-muted/30 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso/5 dark:divide-cream/5">
                      {orders.length > 0 ? (
                        orders.slice(0, 50).map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors duration-200"
                          >
                            <td className="px-6 py-3.5">
                              <span className="text-[11px] font-mono font-medium text-espresso dark:text-cream">
                                #{order.id.toString().padStart(4, "0")}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-espresso dark:text-cream">
                                  {order.shipName}
                                </span>
                                <span className="text-[9px] text-espresso-muted/40 dark:text-espresso-muted/30">
                                  {order.email}
                                </span>
                                <span className="text-[9px] text-espresso-muted/30 dark:text-espresso-muted/20">
                                  {order.shipCity}, {order.shipState}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex flex-col gap-0.5">
                                {order.items?.slice(0, 2).map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-[10px] text-espresso-muted/60 dark:text-espresso-muted/50 truncate max-w-[180px]"
                                  >
                                    {item.quantity}x {item.name}
                                  </span>
                                ))}
                                {order.items?.length > 2 && (
                                  <span className="text-[9px] text-espresso-muted/30 dark:text-espresso-muted/20">
                                    +{order.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-right text-[11px] font-mono font-semibold text-espresso dark:text-cream tabular-nums">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-3.5 text-right text-[10px] font-mono text-espresso-muted/50 dark:text-espresso-muted/40 tabular-nums">
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <OrderActions
                                orderId={order.id}
                                currentStatus={order.status}
                                updating={updatingOrder === order.id}
                                onUpdateStatus={updateOrderStatus}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-xs text-espresso-muted/30 dark:text-espresso-muted/20"
                          >
                            {ordersLoading
                              ? "Loading orders..."
                              : "No orders yet. Complete a checkout to see orders here."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {orders.length > 50 && (
                  <div className="px-6 py-3 border-t border-espresso/5 dark:border-cream/5 text-center text-[10px] text-espresso-muted/40">
                    Showing 50 of {orders.length} orders. Use CSV export for full data.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "reviews" && <ReviewsTab />}
          {activeTab === "blog" && <BlogTab />}
          {activeTab === "currencies" && <CurrenciesTab />}
        </>
      )}
    </div>
  );
}

// ── Status Badge ────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
        STATUS_STYLES[status] ?? "bg-espresso/5 text-espresso-muted/50 dark:bg-cream/5 dark:text-espresso-muted/40"
      }`}
    >
      {status}
    </span>
  );
}

// ── Order Actions ───────────────────────────────────────

function OrderActions({
  orderId,
  currentStatus,
  updating,
  onUpdateStatus,
}: {
  orderId: number;
  currentStatus: string;
  updating: boolean;
  onUpdateStatus: (id: number, status: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const transitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const availableTransitions = transitions[currentStatus] ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating || availableTransitions.length === 0}
        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors duration-200 disabled:opacity-30"
      >
        {updating ? (
          <Loader2 size={12} className="animate-spin text-espresso-muted/50" />
        ) : (
          <MoreHorizontal size={12} className="text-espresso-muted/50" />
        )}
      </button>
      {open && availableTransitions.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl bg-white dark:bg-espresso border border-espresso/10 dark:border-cream/10 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] p-1.5">
            {availableTransitions.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onUpdateStatus(orderId, status);
                  setOpen(false);
                }}
                className="w-full text-left rounded-lg px-3 py-1.5 text-[11px] font-medium text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors duration-200 capitalize"
              >
                {status === "confirmed" && <CheckCircle size={11} className="inline mr-1.5 text-blue-500" />}
                {status === "shipped" && <Truck size={11} className="inline mr-1.5 text-indigo-500" />}
                {status === "delivered" && <CheckCircle size={11} className="inline mr-1.5 text-emerald-500" />}
                {status === "cancelled" && <XCircle size={11} className="inline mr-1.5 text-red-500" />}
                Mark {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
