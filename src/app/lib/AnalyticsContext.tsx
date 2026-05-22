"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Product, CartItem } from "./types";
import { analyticsStore } from "./analyticsStore";

// ── Types ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GTagParams = Record<string, any>;

type GTagEvent = {
  name: string;
  params?: GTagParams;
};

interface ItemData {
  item_id: string | number;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
}

interface AnalyticsContextValue {
  trackEvent: (name: string, params?: Record<string, unknown>) => void;
  trackViewItem: (product: Product, variant?: string) => void;
  trackAddToCart: (product: Product, quantity: number, variant?: string, price?: number) => void;
  trackRemoveFromCart: (item: CartItem) => void;
  trackBeginCheckout: (items: CartItem[], subtotal: number) => void;
  trackAddShippingInfo: (value: number, coupon?: string) => void;
  trackAddPaymentInfo: (value: number, coupon?: string) => void;
  trackPurchase: (
    transactionId: string,
    value: number,
    items: CartItem[],
    coupon?: string,
    shipping?: number,
    tax?: number
  ) => void;
  trackWishlistToggle: (product: Product, action: "add" | "remove") => void;
  trackSearch: (query: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

// ── GA4 Script Injection ─────────────────────────────

function useGtagScript() {
  useEffect(() => {
    const measurementId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();

    if (!measurementId || typeof window === "undefined") return;

    // Prevent double injection
    if (document.querySelector(`script[src*="${measurementId}"]`)) return;

    // Inline gtag snippet (before the main script)
    const inline = document.createElement("script");
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        send_page_view: false,
        cookie_flags: 'max-age=63072000;secure;samesite=none',
      });
    `;
    document.head.appendChild(inline);

    // Load the gtag.js script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);
}  // ── Page view tracker (isolated — this is the only part needing useSearchParams) ─

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (prevPath.current === url) return;
    prevPath.current = url;

    // Store locally for admin dashboard
    analyticsStore.trackPageView(url, document.title);

    const measurementId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
    if (!measurementId) return;

    try {
      // @ts-expect-error — gtag is injected at runtime
      if (typeof window.gtag === "function") {
        // @ts-expect-error
        window.gtag("config", measurementId, {
          page_path: url,
          page_title: document.title,
        });
      }
    } catch {
      // Silently fail
    }
  }, [pathname, searchParams]);

  return null;
}

// ── Provider (no useSearchParams dependency — context always available) ─

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Inject GA4 gtag script once
  useGtagScript();

  const gtag = useCallback((event: GTagEvent) => {
    // Store locally for admin dashboard
    analyticsStore.trackEvent(event.name, (event.params ?? {}) as Record<string, unknown>);

    if (typeof window === "undefined") return;
    const measurementId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
    if (!measurementId) return;

    try {
      // @ts-expect-error — gtag is injected at runtime
      if (typeof window.gtag === "function") {
        // @ts-expect-error
        window.gtag("event", event.name, event.params);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const trackEvent = useCallback(
    (name: string, params?: Record<string, unknown>) => {
      gtag({ name, params: params as GTagParams });
    },
    [gtag]
  );

  // ── Item converters ──────────────────────────────

  const itemToGA4 = useCallback(
    (
      product: Product,
      quantity?: number,
      variant?: string,
      price?: number
    ): ItemData => ({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: price ?? product.price,
      quantity: quantity ?? 1,
      item_variant: variant,
    }),
    []
  );

  const cartItemToGA4 = useCallback(
    (item: CartItem): ItemData => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_variant: item.variant,
    }),
    []
  );

  // ── E-commerce event helpers ──────────────────────

  const trackViewItem = useCallback(
    (product: Product, variant?: string) => {
      gtag({
        name: "view_item",
        params: {
          currency: "USD",
          value: variant
            ? product.price +
              (product.variants?.find((v) => v.label === variant)?.priceDelta ?? 0)
            : product.price,
          items: [itemToGA4(product, 1, variant)],
        },
      });
    },
    [gtag, itemToGA4]
  );

  const trackAddToCart = useCallback(
    (product: Product, quantity: number, variant?: string, price?: number) => {
      gtag({
        name: "add_to_cart",
        params: {
          currency: "USD",
          value: (price ?? product.price) * quantity,
          items: [itemToGA4(product, quantity, variant, price)],
        },
      });
    },
    [gtag, itemToGA4]
  );

  const trackRemoveFromCart = useCallback(
    (item: CartItem) => {
      gtag({
        name: "remove_from_cart",
        params: {
          currency: "USD",
          value: item.price * item.quantity,
          items: [cartItemToGA4(item)],
        },
      });
    },
    [gtag, cartItemToGA4]
  );

  const trackBeginCheckout = useCallback(
    (items: CartItem[], subtotal: number) => {
      gtag({
        name: "begin_checkout",
        params: {
          currency: "USD",
          value: subtotal,
          items: items.map(cartItemToGA4),
        },
      });
    },
    [gtag, cartItemToGA4]
  );

  const trackAddShippingInfo = useCallback(
    (value: number, coupon?: string) => {
      gtag({
        name: "add_shipping_info",
        params: {
          currency: "USD",
          value,
          coupon: coupon ?? undefined,
          shipping_tier: "standard",
        },
      });
    },
    [gtag]
  );

  const trackAddPaymentInfo = useCallback(
    (value: number, coupon?: string) => {
      gtag({
        name: "add_payment_info",
        params: {
          currency: "USD",
          value,
          coupon: coupon ?? undefined,
          payment_type: "credit_card",
        },
      });
    },
    [gtag]
  );

  const trackPurchase = useCallback(
    (
      transactionId: string,
      value: number,
      items: CartItem[],
      coupon?: string,
      shipping?: number,
      tax?: number
    ) => {
      gtag({
        name: "purchase",
        params: {
          transaction_id: transactionId,
          currency: "USD",
          value,
          coupon: coupon ?? undefined,
          shipping: shipping ?? 0,
          tax: tax ?? 0,
          items: items.map(cartItemToGA4),
        },
      });
    },
    [gtag, cartItemToGA4]
  );

  const trackWishlistToggle = useCallback(
    (product: Product, action: "add" | "remove") => {
      gtag({
        name: action === "add" ? "add_to_wishlist" : "remove_from_wishlist",
        params: {
          currency: "USD",
          value: product.price,
          items: [itemToGA4(product)],
        },
      });
    },
    [gtag, itemToGA4]
  );

  const trackSearch = useCallback(
    (query: string) => {
      gtag({
        name: "search",
        params: {
          search_term: query,
        },
      });
    },
    [gtag]
  );

  const value: AnalyticsContextValue = {
    trackEvent,
    trackViewItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackAddShippingInfo,
    trackAddPaymentInfo,
    trackPurchase,
    trackWishlistToggle,
    trackSearch,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {/* Isolate useSearchParams behind a Suspense boundary so it never
          blocks the context from being available to children */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return ctx;
}
