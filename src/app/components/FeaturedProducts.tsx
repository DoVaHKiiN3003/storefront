"use client";

import { useRef } from "react";
import { ArrowRight, Plus, Check } from "lucide-react";
import Link from "next/link";
import AnimateOnView, { useOnView } from "./AnimateOnView";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { products } from "../lib/products";
import type { Product } from "../lib/types";

const productSpans: Record<number, string> = {
  1: "lg:col-span-1 lg:row-span-2",
  2: "lg:col-span-1 lg:row-span-1",
  3: "lg:col-span-1 lg:row-span-1",
  4: "lg:col-span-1 lg:row-span-2",
  5: "lg:col-span-1 lg:row-span-1",
};

export default function FeaturedProducts() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerVisible = useOnView(headerRef, "-100px");

  return (
    <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      {/* Section Header */}
      <div ref={headerRef}>
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDuration: "600ms" }}
        >
          <div>
            <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1]">
              Featured
              <br />
              <span className="text-espresso-muted">Products</span>
            </h2>
          </div>
          <a
            href="#"
            className="group inline-flex items-center gap-2 text-sm font-medium text-espresso-muted hover:text-espresso transition-colors duration-300 shrink-0"
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 auto-rows-[200px] sm:auto-rows-[240px] lg:auto-rows-[280px]">
        {products.map((product, i) => (
          <AnimateOnView key={product.id} delay={80 * i} rootMargin="-50px">
            <Link
              href={`/products/${product.slug}`}
              className={`group relative block overflow-hidden rounded-[1.5rem] bg-espresso/5 h-full ${productSpans[product.id]}`}
            >
              {/* Image */}
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-espresso/5 to-transparent" />

              {/* Top-right actions */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <WishlistOverlayIcon productId={product.id} />
                <AddToCartButton product={product} />
              </div>

              {/* Product info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
                <span className="text-[10px] uppercase tracking-[0.15em] text-cream/70 font-medium">
                  {product.category}
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <h3 className="text-sm sm:text-base font-semibold text-cream">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium text-cream/80">
                    {product.priceLabel}
                  </span>
                </div>
              </div>
            </Link>
          </AnimateOnView>
        ))}
      </div>
    </section>
  );
}

function WishlistOverlayIcon({ productId }: { productId: number }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFav = isInWishlist(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
        isFav
          ? "bg-red-50/90 text-red-400"
          : "bg-white/80 hover:bg-white text-espresso-muted hover:text-espresso"
      }`}
      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span key={String(isFav)} className={`flex items-center justify-center ${isFav ? "animate-heart-bounce" : ""}`}>
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
      </span>
    </button>
  );
}

function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
      }}
      className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
        inCart
          ? "bg-sage text-cream"
          : "bg-white/80 hover:bg-white text-espresso"
      }`}
      aria-label={inCart ? "Added to cart" : "Add to cart"}
    >
      {inCart ? <Check size={14} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
    </button>
  );
}
