"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAnalytics } from "./AnalyticsContext";
import { products } from "./products";

// ── Context ──────────────────────────────────────────────

interface WishlistContextValue {
  ids: Set<number>;
  count: number;
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (id: number) => void;
  addToWishlist: (id: number) => void;
  removeFromWishlist: (id: number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "storefront-wishlist";

// ── Provider ─────────────────────────────────────────────

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIds(new Set(parsed));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes (only after initial hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
      } catch {
        // ignore
      }
    }
  }, [ids, hydrated]);

  const isInWishlist = useCallback(
    (id: number) => ids.has(id),
    [ids]
  );

  const { trackWishlistToggle } = useAnalytics();

  const toggleWishlist = useCallback((id: number) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const product = products.find((p) => p.id === id);
        if (product) trackWishlistToggle(product, "remove");
      } else {
        next.add(id);
        const product = products.find((p) => p.id === id);
        if (product) trackWishlistToggle(product, "add");
      }
      return next;
    });
  }, [trackWishlistToggle]);

  const addToWishlist = useCallback((id: number) => {
    setIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setIds(new Set());
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        ids,
        count: ids.size,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
