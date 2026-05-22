"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useQuickView } from "../lib/QuickViewContext";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { useAnalytics } from "../lib/AnalyticsContext";
import { useCurrency } from "../lib/CurrencyContext";
import type { Product } from "../lib/types";

export default function QuickViewModal() {
  const { product, closeQuickView } = useQuickView();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open, clean up on unmount
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [product]);

  if (!product) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] bg-espresso/30 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        style={{ animation: "overlayFadeIn 0.3s cubic-bezier(0.32,0.72,0,1) both" }}
        onClick={(e) => {
          if (e.target === overlayRef.current) closeQuickView();
        }}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-4xl max-h-[90vh] bg-cream rounded-3xl shadow-[0_24px_80px_-16px_rgba(0,0,0,0.2)] flex flex-col lg:flex-row overflow-hidden"
          style={{
            animation: "modalScaleIn 0.35s cubic-bezier(0.32,0.72,0,1) both",
          }}
        >
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] hover:bg-white transition-all duration-300"
            aria-label="Close quick view"
          >
            <X size={16} className="text-espresso" />
          </button>

          {/* Left — Image Gallery */}
          <div className="lg:w-1/2 shrink-0">
            <QuickGallery product={product} />
          </div>

          {/* Right — Product Info */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
            <QuickInfo product={product} onClose={closeQuickView} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Quick Gallery (simplified, no zoom) ─────────────────

function QuickGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] lg:min-h-[400px] bg-espresso/5">
      {/* Main image */}
      <img
        src={product.images[selected]}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Thumbnails strip — overlaid at bottom */}
      {product.images.length > 1 && (
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-10 h-12 sm:w-12 sm:h-14 rounded-lg overflow-hidden transition-all duration-300 ring-2 ${
                selected === i
                  ? "ring-white ring-offset-1 ring-offset-transparent opacity-100"
                  : "ring-white/60 opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={img}
                alt={`${product.name} view ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Category badge */}
      <span className="absolute top-4 left-4 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-medium text-espresso/70 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
        {product.category}
      </span>
    </div>
  );
}

// ── Quick Info Panel ─────────────────────────────────────

function QuickInfo({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem, items, setCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { trackViewItem } = useAnalytics();
  const { formatPrice } = useCurrency();

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants?.find(
    (v) => v.label === (selectedVariant ?? product.variants?.[0].label)
  );
  const currentPrice = variant ? product.price + variant.priceDelta : product.price;
  const isFav = isInWishlist(product.id);

  // Track view_item on mount
  useEffect(() => {
    trackViewItem(product, selectedVariant ?? product.variants?.[0].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inCart = items.some(
    (item) =>
      item.id === product.id &&
      item.variant === (selectedVariant ?? product.variants?.[0].label)
  );

  const handleAdd = () => {
    addItem(
      product,
      quantity,
      selectedVariant ?? product.variants?.[0].label,
      currentPrice
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(
      product,
      quantity,
      selectedVariant ?? product.variants?.[0].label,
      currentPrice
    );
    onClose();
    setCartOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Category + Name */}
      <div>
        <span className="inline-block rounded-full px-3 py-0.5 text-[9px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-3">
          {product.category}
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tighter text-espresso leading-[1.1]">
          {product.name}
        </h2>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl font-semibold tracking-tight text-espresso tabular-nums">
          {formatPrice(currentPrice, { decimals: 0 })}
        </span>
        <span className="text-xs text-espresso-muted/50 line-through">
          {formatPrice(product.price * 1.15, { decimals: 0 })}
        </span>
      </div>

      {/* Description (truncated) */}
      <p className="text-sm text-espresso-muted leading-relaxed line-clamp-3">
        {product.description}
      </p>

      {/* Details list — first 3 */}
      <ul className="space-y-1.5">
        {product.details.slice(0, 3).map((detail, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-xs text-espresso-muted"
          >
            <span className="mt-1.5 w-1 h-1 rounded-full bg-sage shrink-0" />
            {detail}
          </li>
        ))}
      </ul>

      {/* Variant selectors */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          {/* Size */}
          {(() => {
            const sizes = product.variants.filter((v) => v.type === "size");
            if (sizes.length === 0) return null;
            return (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.15em] font-medium text-espresso-muted/60 mb-2">
                  Size —{" "}
                  <span className="text-espresso font-semibold">
                    {selectedVariant && sizes.some((s) => s.label === selectedVariant)
                      ? selectedVariant
                      : sizes[0].label}
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((v) => (
                    <button
                      key={v.label}
                      onClick={() => setSelectedVariant(v.label)}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                        (selectedVariant && selectedVariant === v.label) ||
                        (!selectedVariant && sizes.indexOf(v) === 0)
                          ? "bg-espresso text-cream shadow-[0_2px_8px_-2px_rgba(60,47,42,0.2)]"
                          : "bg-white text-espresso-muted border border-espresso/10 hover:border-espresso/20 hover:text-espresso"
                      }`}
                    >
                      {v.label}
                      {v.priceDelta > 0 && (
                        <span className="ml-1 text-[9px] opacity-70">
                          +${v.priceDelta}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Color */}
          {(() => {
            const colors = product.variants.filter((v) => v.type === "color");
            if (colors.length === 0) return null;
            return (
              <div>
                <span className="block text-[9px] uppercase tracking-[0.15em] font-medium text-espresso-muted/60 mb-2">
                  Color —{" "}
                  <span className="text-espresso font-semibold">
                    {selectedVariant && colors.some((c) => c.label === selectedVariant)
                      ? selectedVariant
                      : colors[0].label}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((v) => (
                    <button
                      key={v.label}
                      onClick={() => setSelectedVariant(v.label)}
                      className={`group relative flex flex-col items-center gap-1 ${
                        (selectedVariant && selectedVariant === v.label) ||
                        (!selectedVariant && colors.indexOf(v) === 0)
                          ? ""
                          : "opacity-60 hover:opacity-90"
                      }`}
                      aria-label={v.label}
                    >
                      <div
                        className={`w-8 h-8 rounded-full transition-all duration-300 ${
                          (selectedVariant && selectedVariant === v.label) ||
                          (!selectedVariant && colors.indexOf(v) === 0)
                            ? "ring-2 ring-espresso ring-offset-2 ring-offset-cream scale-110"
                            : "ring-1 ring-espresso/10 hover:ring-espresso/30"
                        }`}
                        style={{ backgroundColor: v.color || "#ccc" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quantity + Actions */}
      <div className="space-y-3 pt-1">
        {/* Wishlist + Quantity row */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              isFav
                ? "bg-red-50 text-red-400 border border-red-200/50"
                : "bg-espresso/5 text-espresso-muted hover:text-espresso hover:bg-espresso/10 border border-transparent"
            }`}
          >
            <Heart
              size={12}
              fill={isFav ? "currentColor" : "none"}
              strokeWidth={isFav ? 0 : 2}
            />
            {isFav ? "Saved" : "Save"}
          </button>

          {/* Quantity */}
          <div className="flex items-center gap-1 rounded-full bg-espresso/5 px-2 py-1 ml-auto">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-espresso/10 transition-colors duration-300"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={10} className="text-espresso" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-espresso tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-espresso/10 transition-colors duration-300"
              disabled={quantity >= 99}
              aria-label="Increase quantity"
            >
              <Plus size={10} className="text-espresso" />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          className={`w-full group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
            added
              ? "bg-sage text-cream"
              : "bg-espresso text-cream hover:bg-espresso-light"
          }`}
        >
          <span className="relative z-10 flex items-center gap-2.5">
            {added ? (
              <>
                <Check size={15} strokeWidth={3} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag size={15} strokeWidth={2} />
                Add to Cart — {formatPrice(currentPrice, { decimals: 0 })}
              </>
            )}
          </span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          className="w-full rounded-full border border-espresso/20 px-6 py-2.5 text-sm font-medium text-espresso hover:bg-espresso/5 transition-all duration-300 active:scale-[0.97]"
        >
          Buy Now
        </button>

        {/* View full details */}
        <div className="text-center pt-1">
          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="text-[11px] text-espresso-muted/50 hover:text-espresso underline underline-offset-2 transition-colors duration-300"
          >
            View full product details
          </Link>
        </div>
      </div>
    </div>
  );
}
