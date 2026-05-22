"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useProducts } from "../lib/useProducts";
import { useCurrency } from "../lib/CurrencyContext";
import type { Product } from "../lib/types";

const STORAGE_KEY = "storefront-recently-viewed";
const MAX_ITEMS = 8;

// ── Helper ───────────────────────────────────────────────

export function trackProductView(slug: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const list: string[] = stored ? JSON.parse(stored) : [];
    // Remove if exists, add to front
    const filtered = list.filter((s) => s !== slug);
    filtered.unshift(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

function loadRecentSlugs(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────

export default function RecentlyViewed({ currentSlug }: { currentSlug?: string }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const { products } = useProducts();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const slugs = loadRecentSlugs();
    const filtered = slugs.filter((s) => s !== currentSlug).slice(0, 4);
    const resolved = filtered
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is Product => !!p);
    setRecentProducts(resolved);
  }, [currentSlug, products]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-20 sm:mt-28 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={14} className="text-espresso-muted/50" />
        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">
          Recently Viewed
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-6 sm:-mx-12 lg:-mx-20 xl:-mx-28 px-6 sm:px-12 lg:px-20 xl:px-28">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group shrink-0 w-32 sm:w-36"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-espresso/5">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="mt-2.5">
              <p className="text-[10px] uppercase tracking-[0.1em] text-espresso-muted/50 font-medium truncate">
                {product.category}
              </p>
              <p className="text-xs font-semibold text-espresso truncate mt-0.5">
                {product.name}
              </p>
              <p className="text-[11px] text-espresso-muted/60 font-medium mt-0.5">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
