"use client";

import { ArrowRight, ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";
import AnimateOnView from "../components/AnimateOnView";
import RecentlyViewed from "../components/RecentlyViewed";
import { useProducts, getProductsByCategory } from "../lib/useProducts";
import { useWishlist } from "../lib/WishlistContext";
import { useQuickView } from "../lib/QuickViewContext";
import { useCurrency } from "../lib/CurrencyContext";
import type { Product } from "../lib/types";

const categoryVisuals: Record<
  string,
  {
    description: string;
    tagline: string;
    seed: string;
    gradient: string;
    accent: string;
  }
> = {
  Objects: {
    description:
      "Sculptural pieces that transform functional objects into works of art. Each form is carefully considered, every curve intentional.",
    tagline: "Form meets function",
    seed: "cat-objects",
    gradient: "from-espresso/50 via-espresso/20 to-transparent",
    accent: "text-espresso",
  },
  Bags: {
    description:
      "Everyday carriers crafted from the finest materials. Designed to accompany you through the rhythms of daily life, growing better with age.",
    tagline: "Carry with intention",
    seed: "cat-bags",
    gradient: "from-espresso-light/40 via-espresso/10 to-transparent",
    accent: "text-espresso",
  },
  Dining: {
    description:
      "Objects that elevate the ritual of gathering. From morning coffee to dinner with friends, each piece is designed to be held, used, and cherished.",
    tagline: "Ceremonies worth gathering for",
    seed: "cat-dining",
    gradient: "from-sage/40 via-espresso/10 to-transparent",
    accent: "text-sage",
  },
  Textiles: {
    description:
      "Woven stories for your home. Natural fibers, time-honored techniques, and contemporary design converge in pieces meant to last generations.",
    tagline: "Woven stories, natural fibers",
    seed: "cat-textiles",
    gradient: "from-sage/30 via-espresso/5 to-transparent",
    accent: "text-sage",
  },
  Lighting: {
    description:
      "Architectural illumination that shapes space and mood. Each fixture balances precision engineering with warm, ambient light.",
    tagline: "Ambient glow, architectural form",
    seed: "cat-lighting",
    gradient: "from-espresso/40 via-transparent to-transparent",
    accent: "text-espresso",
  },
};

const categoryOrder = ["Objects", "Textiles", "Dining", "Lighting", "Bags"];

export default function CollectionsPage() {
  const { products } = useProducts();
  const grouped = getProductsByCategory(products);

  return (
    <div>
      {/* ── Global Hero ─────────────────────────── */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center bg-cream overflow-hidden">
        {/* Background decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sage/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-espresso/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 xl:px-28 pt-32 pb-16">
          <div className="max-w-3xl">
            <AnimateOnView delay={0} duration={700} rootMargin="-100px">
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-6">
                Curated by Category
              </span>
            </AnimateOnView>

            <AnimateOnView delay={100} duration={700} rootMargin="-100px">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.9] text-espresso">
                Our
                <br />
                <span className="text-espresso-muted">Collections</span>
              </h1>
            </AnimateOnView>

            <AnimateOnView delay={200} duration={700} rootMargin="-100px">
              <p className="mt-6 text-base sm:text-lg text-espresso-muted leading-relaxed max-w-xl">
                Explore our thoughtfully curated categories — each collection
                represents a dedication to craft, material, and enduring design.
              </p>
            </AnimateOnView>

            {/* Quick nav chips */}
            <AnimateOnView delay={300} duration={700} rootMargin="-100px">
              <div className="mt-10 flex flex-wrap gap-3">
                {categoryOrder.map((cat) => (
                  <a
                    key={cat}
                    href={`#collection-${cat.toLowerCase()}`}
                    className="rounded-full bg-white/70 border border-espresso/10 px-4 py-2 text-xs font-medium text-espresso-muted hover:text-espresso hover:bg-white hover:border-espresso/20 transition-all duration-300"
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </AnimateOnView>
          </div>
        </div>
      </section>

      {/* ── Category Sections ────────────────────── */}
      {categoryOrder.map((categoryName, sectionIndex) => {
        const products = grouped.get(categoryName) || [];
        const visual = categoryVisuals[categoryName];

        return (
          <section
            key={categoryName}
            id={`collection-${categoryName.toLowerCase()}`}
            className="bg-cream"
          >
            {/* Hero header */}
            <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${visual.seed}/1800/1200`}
                alt={categoryName}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  animation: `heroScaleIn 1.4s 0.1s cubic-bezier(0.32,0.72,0,1) both`,
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${visual.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-transparent to-cream/80" />

              {/* Overlay content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-6 sm:px-12 lg:px-20 xl:px-28 pb-12 sm:pb-16 lg:pb-20">
                <div className="max-w-3xl">
                  <AnimateOnView delay={100} rootMargin="-100px">
                    <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-cream/70 border border-cream/20 mb-5 backdrop-blur-sm bg-cream/10">
                      Collection {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                  </AnimateOnView>

                  <AnimateOnView delay={200} rootMargin="-100px">
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-cream leading-[0.9]">
                      {categoryName}
                    </h2>
                  </AnimateOnView>

                  <AnimateOnView delay={300} rootMargin="-100px">
                    <p className="mt-4 text-sm sm:text-base text-cream/80 max-w-lg leading-relaxed">
                      {visual.tagline}
                    </p>
                  </AnimateOnView>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="absolute bottom-6 right-6 sm:right-12 lg:right-20 z-10">
                <div className="flex flex-col items-center gap-2 text-cream/40">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-medium">
                    Scroll
                  </span>
                  <div className="w-px h-8 bg-cream/30" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className="px-6 sm:px-12 lg:px-20 xl:px-28 -mt-16 relative z-20">
              <div className="max-w-6xl mx-auto">
                {/* Category description */}
                <AnimateOnView delay={100} rootMargin="-80px">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                      <p className="text-base sm:text-lg text-espresso-muted leading-relaxed">
                        {visual.description}
                      </p>
                    </div>
                    <Link
                      href={`/search?category=${categoryName}`}
                      className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 shrink-0"
                    >
                      View all {categoryName}
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-0.5 transition-transform duration-300"
                      />
                    </Link>
                  </div>
                </AnimateOnView>

                {/* Product cards */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 sm:pb-32">
                    {products.map((product, i) => (
                      <AnimateOnView
                        key={product.id}
                        delay={80 * i}
                        rootMargin="-50px"
                      >
                        <ProductCard product={product} />
                      </AnimateOnView>
                    ))}
                  </div>
                ) : (
                  <div className="pb-24 sm:pb-32">
                    <div className="rounded-[1.5rem] bg-espresso/3 border border-dashed border-espresso/10 p-12 text-center">
                      <p className="text-sm text-espresso-muted/50">
                        More {categoryName.toLowerCase()} coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Recently Viewed */}
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-6xl mx-auto">
          <RecentlyViewed />
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────── */}
      <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
        <AnimateOnView delay={0} rootMargin="-80px">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-5">
              Can't decide?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1] mb-6">
              Explore everything
              <br />
              <span className="text-espresso-muted">we have to offer</span>
            </h2>
            <p className="text-sm sm:text-base text-espresso-muted max-w-md mx-auto mb-10 leading-relaxed">
              Browse our complete catalog of thoughtfully crafted essentials,
              from ceramic objects to woven textiles.
            </p>
            <Link
              href="/search"
              className="group relative inline-flex items-center gap-3 rounded-full bg-espresso px-8 py-3.5 text-sm font-medium text-cream overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-espresso-light active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-3">
                <ShoppingBag size={16} strokeWidth={2.5} />
                Shop All Products
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </Link>
          </div>
        </AnimateOnView>
      </section>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const { formatPrice } = useCurrency();
  const isFav = isInWishlist(product.id);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso/5 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 bg-white/80 hover:bg-white text-espresso-muted hover:text-espresso"
            aria-label="Quick view"
          >
            <Eye size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
              isFav
                ? "bg-red-50/90 text-red-400"
                : "bg-white/80 hover:bg-white text-espresso-muted hover:text-espresso"
            }`}
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill={isFav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isFav ? 0 : 2}
              className="transition-all duration-300"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-espresso-muted/50 font-medium">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-espresso truncate mt-0.5">
            {product.name}
          </h3>
        </div>
        <span className="text-sm font-medium text-espresso tabular-nums shrink-0">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}
