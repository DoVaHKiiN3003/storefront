"use client";

import { useState, useEffect } from "react";
import { products as staticProducts, getProductBySlug as staticGetProduct, getProductsByCategory as staticGetByCategory, getRelatedProducts as staticGetRelated } from "./products";
import type { Product } from "./types";

// ── Hook: Fetches all products from API with static fallback ──

export function useProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        const res = await globalThis.fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      } catch {
        // Fallback to static data
      }
      if (!cancelled) setLoading(false);
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  return { products: allProducts, loading };
}

// ── Hook: Fetches a single product by slug ──

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | undefined>(
    staticGetProduct(slug)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      try {
        const res = await globalThis.fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } catch {
        // Fallback to static
      }
      if (!cancelled) setLoading(false);
    }
    fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);

  return { product, loading };
}

// ── Helper: Get products by category (sync, works with static data) ──

export function getProductsByCategory(products: Product[]): Map<string, Product[]> {
  const grouped = new Map<string, Product[]>();
  for (const product of products) {
    const existing = grouped.get(product.category);
    if (existing) {
      existing.push(product);
    } else {
      grouped.set(product.category, [product]);
    }
  }
  return grouped;
}

// ── Hook: Fetches products for search page ──

export function useSearchProducts(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(staticProducts);
      return;
    }

    setLoading(true);
    let cancelled = false;

    async function fetchSearchResults() {
      try {
        const res = await globalThis.fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setResults(data);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback below
      }

      // Static fallback
      if (!cancelled) {
        const q = query.toLowerCase();
        const filtered = staticProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.materials.toLowerCase().includes(q) ||
            p.details.some((d) => d.toLowerCase().includes(q))
        );
        setResults(filtered);
        setLoading(false);
      }
    }

    fetchSearchResults();
    return () => { cancelled = true; };
  }, [query]);

  return { results, loading };
}

// ── Helper: Get related products by category ──

export function getRelatedProducts(products: Product[], slug: string, limit = 3): Product[] {
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}

// ── Re-export static helpers for direct use ──

export { staticProducts, staticGetProduct as getProductBySlug, staticGetByCategory as getProductsByCategoryStatic };
