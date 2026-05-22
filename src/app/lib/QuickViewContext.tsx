"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Product } from "./types";

interface QuickViewContextValue {
  product: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((p: Product) => {
    setProduct(p);
  }, []);

  const closeQuickView = useCallback(() => {
    setProduct(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickView();
    };
    if (product) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [product, closeQuickView]);

  return (
    <QuickViewContext.Provider value={{ product, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) {
    throw new Error("useQuickView must be used within a QuickViewProvider");
  }
  return ctx;
}
