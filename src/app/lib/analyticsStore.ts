"use client";

// ── Types ──────────────────────────────────────────────

export interface StoredPageView {
  path: string;
  title: string;
  timestamp: number;
}

export interface StoredEvent {
  id: string;
  name: string;
  params: Record<string, unknown>;
  timestamp: number;
  path: string;
}

export interface TrafficSource {
  source: string;
  medium: string;
  campaign: string | null;
  firstSeen: number;
  pageViews: number;
}

export interface ProductAnalytics {
  id: number;
  name: string;
  category: string;
  views: number;
  addToCarts: number;
  wishlistAdds: number;
  purchases: number;
  revenue: number;
}

// ── Store Keys ─────────────────────────────────────────

const KEYS = {
  pageViews: "storefront-analytics-pageviews",
  events: "storefront-analytics-events",
  trafficSource: "storefront-analytics-traffic",
  products: "storefront-analytics-products",
} as const;

const MAX_EVENTS = 2000;
const MAX_PAGEVIEWS = 500;
const STORAGE_VERSION = 1;

// ── Helpers ────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

// ── Traffic Source Detection ───────────────────────────

function detectTrafficSource(): { source: string; medium: string; campaign: string | null } {
  if (typeof window === "undefined") {
    return { source: "direct", medium: "(none)", campaign: null };
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  if (utmSource) {
    return {
      source: utmSource,
      medium: utmMedium || "(cpc)",
      campaign: utmCampaign,
    };
  }

  // Check referrer
  const referrer = document.referrer;
  if (!referrer) {
    return { source: "direct", medium: "(none)", campaign: null };
  }

  try {
    const url = new URL(referrer);
    if (url.hostname.includes("google")) {
      return { source: "google", medium: "organic", campaign: null };
    }
    if (url.hostname.includes("facebook") || url.hostname.includes("fb.com")) {
      return { source: "facebook", medium: "social", campaign: null };
    }
    if (url.hostname.includes("instagram")) {
      return { source: "instagram", medium: "social", campaign: null };
    }
    if (url.hostname.includes("twitter") || url.hostname.includes("x.com")) {
      return { source: "twitter", medium: "social", campaign: null };
    }
    if (url.hostname.includes("pinterest")) {
      return { source: "pinterest", medium: "social", campaign: null };
    }
    if (url.hostname.includes("tiktok")) {
      return { source: "tiktok", medium: "social", campaign: null };
    }
    if (url.hostname.includes("bing")) {
      return { source: "bing", medium: "organic", campaign: null };
    }
    return { source: url.hostname, medium: "referral", campaign: null };
  } catch {
    return { source: "direct", medium: "(none)", campaign: null };
  }
}

// ── Public Store API ───────────────────────────────────

export const analyticsStore = {
  // ── Page Views ────────────────────────────────────

  trackPageView(path: string, title: string) {
    const views = read<StoredPageView[]>(KEYS.pageViews, []);
    views.push({ path, title, timestamp: Date.now() });
    // Keep only recent
    if (views.length > MAX_PAGEVIEWS) {
      views.splice(0, views.length - MAX_PAGEVIEWS);
    }
    write(KEYS.pageViews, views);

    // Track first-seen traffic source
    const existing = read<TrafficSource | null>(KEYS.trafficSource, null);
    if (!existing) {
      const detected = detectTrafficSource();
      write(KEYS.trafficSource, {
        ...detected,
        firstSeen: Date.now(),
        pageViews: 1,
      });
    } else {
      existing.pageViews += 1;
      write(KEYS.trafficSource, existing);
    }
  },

  // ── Events ─────────────────────────────────────────

  trackEvent(name: string, params: Record<string, unknown>) {
    const events = read<StoredEvent[]>(KEYS.events, []);
    events.push({
      id: generateId(),
      name,
      params,
      timestamp: Date.now(),
      path: window.location.pathname,
    });
    // Trim excess
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }
    write(KEYS.events, events);

    // Also update product stats if applicable
    this._updateProductStats(name, params);
  },

  // ── Product Stats ─────────────────────────────────

  _updateProductStats(name: string, params: Record<string, unknown>) {
    const items = (params.items as Array<{
      item_id?: number;
      item_name?: string;
      item_category?: string;
      price?: number;
      quantity?: number;
    }>) ?? [];

    for (const item of items) {
      if (!item.item_id && !item.item_name) continue;

      const products = read<ProductAnalytics[]>(KEYS.products, []);
      let product = products.find((p) => p.id === item.item_id);
      if (!product) {
        product = {
          id: item.item_id ?? -1,
          name: item.item_name ?? "Unknown",
          category: item.item_category ?? "Uncategorized",
          views: 0,
          addToCarts: 0,
          wishlistAdds: 0,
          purchases: 0,
          revenue: 0,
        };
        products.push(product);
      }

      switch (name) {
        case "view_item":
          product.views += 1;
          break;
        case "add_to_cart":
          product.addToCarts += 1;
          break;
        case "remove_from_cart":
          product.addToCarts = Math.max(0, product.addToCarts - 1);
          break;
        case "add_to_wishlist":
          product.wishlistAdds += 1;
          break;
        case "remove_from_wishlist":
          product.wishlistAdds = Math.max(0, product.wishlistAdds - 1);
          break;
        case "purchase":
          product.purchases += 1;
          product.revenue += (item.price ?? 0) * (item.quantity ?? 1);
          break;
      }

      write(KEYS.products, products);
    }
  },

  // ── Readers ────────────────────────────────────────

  getPageViews(): StoredPageView[] {
    return read<StoredPageView[]>(KEYS.pageViews, []);
  },

  getEvents(): StoredEvent[] {
    return read<StoredEvent[]>(KEYS.events, []);
  },

  getTrafficSource(): TrafficSource | null {
    return read<TrafficSource | null>(KEYS.trafficSource, null);
  },

  getProductStats(): ProductAnalytics[] {
    return read<ProductAnalytics[]>(KEYS.products, []);
  },

  // ── Computed Metrics ──────────────────────────────

  getMetrics() {
    const pageViews = this.getPageViews();
    const events = this.getEvents();
    const products = this.getProductStats();
    const traffic = this.getTrafficSource();

    const totalPageViews = pageViews.length;
    const uniquePaths = new Set(pageViews.map((v) => v.path)).size;
    const totalAddToCarts = events.filter((e) => e.name === "add_to_cart").length;
    const totalPurchases = events.filter((e) => e.name === "purchase").length;
    const totalRevenue = events
      .filter((e) => e.name === "purchase")
      .reduce((sum, e) => sum + ((e.params.value as number) ?? 0), 0);
    const totalSearches = events.filter((e) => e.name === "search").length;
    const totalWishlistAdds = events.filter((e) => e.name === "add_to_wishlist").length;

    const conversionRate =
      totalPageViews > 0
        ? ((totalAddToCarts / totalPageViews) * 100)
        : 0;

    const cartToPurchaseRate =
      totalAddToCarts > 0
        ? ((totalPurchases / totalAddToCarts) * 100)
        : 0;

    // Top products by views
    const topProducts = [...products]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Recent events (last 50)
    const recentEvents = [...events]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    // Page views by path
    const viewsByPath = new Map<string, number>();
    for (const v of pageViews) {
      viewsByPath.set(v.path, (viewsByPath.get(v.path) ?? 0) + 1);
    }
    const topPaths = [...viewsByPath.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Events over time (last 7 days, bucketed by hour)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentEventsFiltered = events.filter((e) => e.timestamp >= sevenDaysAgo);
    const eventsByDay = new Map<string, number>();
    for (const e of recentEventsFiltered) {
      const day = new Date(e.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
    }

    return {
      totalPageViews,
      uniquePaths,
      totalAddToCarts,
      totalPurchases,
      totalRevenue,
      totalSearches,
      totalWishlistAdds,
      conversionRate,
      cartToPurchaseRate,
      topProducts,
      recentEvents,
      topPaths,
      eventsByDay: [...eventsByDay.entries()],
      trafficSource: traffic,
    };
  },

  // ── Clear ──────────────────────────────────────────

  clear() {
    Object.values(KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  },
};
