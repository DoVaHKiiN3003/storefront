"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Product, CartItem } from "./types";
import { analyticsStore } from "./analyticsStore";

// ── Types ──────────────────────────────────────────────

interface AnalyticsContextValue {
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

// ── Page view tracker ─────────────────────────────────

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
  }, [pathname, searchParams]);

  return null;
}

// ── Provider ──────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const value: AnalyticsContextValue = useMemo(() => ({
    // ── E-commerce event helpers ──────────────────────

    trackViewItem(product: Product, variant?: string) {
      analyticsStore.trackEvent("view_item", {
        currency: "USD",
        value: variant
          ? product.price +
            (product.variants?.find((v) => v.label === variant)?.priceDelta ?? 0)
          : product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: 1,
            item_variant: variant,
          },
        ],
      });
    },

    trackAddToCart(product: Product, quantity: number, variant?: string, price?: number) {
      analyticsStore.trackEvent("add_to_cart", {
        currency: "USD",
        value: (price ?? product.price) * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: price ?? product.price,
            quantity,
            item_variant: variant,
          },
        ],
      });
    },

    trackRemoveFromCart(item: CartItem) {
      analyticsStore.trackEvent("remove_from_cart", {
        currency: "USD",
        value: item.price * item.quantity,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_variant: item.variant,
          },
        ],
      });
    },

    trackBeginCheckout(items: CartItem[], subtotal: number) {
      analyticsStore.trackEvent("begin_checkout", {
        currency: "USD",
        value: subtotal,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: item.variant,
        })),
      });
    },

    trackAddShippingInfo(value: number, coupon?: string) {
      analyticsStore.trackEvent("add_shipping_info", {
        currency: "USD",
        value,
        coupon: coupon ?? undefined,
        shipping_tier: "standard",
      });
    },

    trackAddPaymentInfo(value: number, coupon?: string) {
      analyticsStore.trackEvent("add_payment_info", {
        currency: "USD",
        value,
        coupon: coupon ?? undefined,
        payment_type: "credit_card",
      });
    },

    trackPurchase(
      transactionId: string,
      value: number,
      items: CartItem[],
      coupon?: string,
      shipping?: number,
      tax?: number
    ) {
      analyticsStore.trackEvent("purchase", {
        transaction_id: transactionId,
        currency: "USD",
        value,
        coupon: coupon ?? undefined,
        shipping: shipping ?? 0,
        tax: tax ?? 0,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: item.variant,
        })),
      });
    },

    trackWishlistToggle(product: Product, action: "add" | "remove") {
      analyticsStore.trackEvent(
        action === "add" ? "add_to_wishlist" : "remove_from_wishlist",
        {
          currency: "USD",
          value: product.price,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              item_category: product.category,
              price: product.price,
              quantity: 1,
            },
          ],
        }
      );
    },

    trackSearch(query: string) {
      analyticsStore.trackEvent("search", {
        search_term: query,
      });
    },
  }), []);

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
