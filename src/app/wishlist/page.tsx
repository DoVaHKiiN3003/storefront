"use client";

import { Heart, Trash2, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "../lib/WishlistContext";
import { useQuickView } from "../lib/QuickViewContext";
import { useProducts } from "../lib/useProducts";
import type { Product } from "../lib/types";
import AnimateOnView from "../components/AnimateOnView";
import { useCurrency } from "../lib/CurrencyContext";

export default function WishlistPage() {
  const { ids, count, clearWishlist } = useWishlist();
  const { products } = useProducts();

  // Get full product data for wishlist IDs
  const wishlistProducts = products.filter((p) => ids.has(p.id));

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto">
      {/* Header */}
      <AnimateOnView delay={0} rootMargin="-80px">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-5">
              Saved Items
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-espresso leading-[1.08]">
              Your Wishlist
            </h1>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-espresso-muted/60">
                {count} {count === 1 ? "item" : "items"}
              </span>
              <button
                onClick={clearWishlist}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-espresso-muted/50 hover:text-red-400 hover:bg-red-50/50 border border-espresso/10 hover:border-red-200/50 transition-all duration-300"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
          )}
        </div>
      </AnimateOnView>

      {/* Content */}
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product, i) => (
            <AnimateOnView
              key={product.id}
              delay={Math.min(i * 60, 300)}
              rootMargin="-40px"
            >
              <WishlistCard product={product} />
            </AnimateOnView>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ── Wishlist Card ────────────────────────────────────────

function WishlistCard({ product }: { product: Product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const { formatPrice } = useCurrency();
  const isFav = isInWishlist(product.id);

  return (
    <div className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso/5 aspect-[4/5]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>

      {/* Top-right actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
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
          aria-label="Remove from wishlist"
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} strokeWidth={isFav ? 0 : 2} />
        </button>
      </div>

      {/* Card info */}
      <div className="relative mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-espresso-muted/50 font-medium">
            {product.category}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="block text-sm font-semibold text-espresso truncate mt-0.5 hover:text-espresso-muted transition-colors duration-300"
          >
            {product.name}
          </Link>
          <p className="text-xs text-espresso-muted/60 mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={() => toggleWishlist(product.id)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-espresso/5 hover:bg-red-50 hover:text-red-400 transition-all duration-300 shrink-0"
          aria-label={`Remove ${product.name} from wishlist`}
        >
          <Trash2 size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────

function EmptyState() {
  return (
    <AnimateOnView delay={100} rootMargin="-60px">
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
          <Heart size={24} className="text-sage" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-espresso mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-sm text-espresso-muted/70 mb-8 leading-relaxed">
          Save your favorite pieces here by tapping the heart icon on any product.
          They&apos;ll be waiting for you whenever you&apos;re ready.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300 active:scale-[0.98]"
        >
          <ShoppingBag size={14} />
          Discover Products
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </AnimateOnView>
  );
}
