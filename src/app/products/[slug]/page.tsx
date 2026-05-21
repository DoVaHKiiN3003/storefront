"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "../../lib/CartContext";
import { getProductBySlug, getRelatedProducts, products } from "../../lib/products";
import AnimateOnView from "../../components/AnimateOnView";
import type { Product } from "../../lib/types";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center">
          <ShoppingBag size={28} className="text-sage" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-espresso">
            Product not found
          </h1>
          <p className="text-sm text-espresso-muted/70 mt-2">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      {/* Back link */}
      <AnimateOnView delay={0} rootMargin="-80px" className="mb-8">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform duration-300"
          />
          Back
        </button>
      </AnimateOnView>

      {/* Main content — editorial split */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20">
        {/* Left: Image gallery */}
        <AnimateOnView
          delay={100}
          rootMargin="-100px"
          direction="left"
          className="lg:sticky lg:top-32 lg:self-start w-full lg:w-[55%] xl:w-[60%]"
        >
          <ImageGallery product={product} />
        </AnimateOnView>

        {/* Right: Product info */}
        <div className="flex-1 min-w-0">
          <AnimateOnView delay={150} rootMargin="-100px">
            <div className="space-y-8 max-w-lg">
              {/* Category & name */}
              <div>
                <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-5">
                  {product.category}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter text-espresso leading-[1.05]">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-tight text-espresso tabular-nums">
                  {product.priceLabel}
                </span>
                <span className="text-xs text-espresso-muted/50 line-through">
                  {product.priceLabel === "$450"
                    ? "$520"
                    : `$${(product.price * 1.15).toFixed(0)}`}
                </span>
              </div>

              {/* Description */}
              <p className="text-base text-espresso-muted leading-relaxed">
                {product.description}
              </p>

              {/* Details list */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">
                  Details
                </h3>
                <ul className="space-y-2">
                  {product.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-espresso-muted"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-sage shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-espresso/10">
                <SpecItem label="Material" value={product.materials} />
                <SpecItem label="Dimensions" value={product.dimensions} />
                <SpecItem label="Origin" value={product.origin} />
              </div>

              {/* Quantity + Add to Cart */}
              <ProductActions product={product} />

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <TrustItem
                  icon={Truck}
                  label="Free Shipping"
                  subtext="On orders over $200"
                />
                <TrustItem
                  icon={Shield}
                  label="Secure Checkout"
                  subtext="SSL encrypted"
                />
                <TrustItem
                  icon={RotateCcw}
                  label="30-Day Returns"
                  subtext="No questions asked"
                />
              </div>
            </div>
          </AnimateOnView>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentSlug={slug} />
    </div>
  );
}

// ── Image Gallery ────────────────────────────────────────

function ImageGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-[2rem] bg-espresso/5">
        <div className="aspect-[3/4] sm:aspect-[4/5]">
          <img
            src={product.images[selected]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          />
        </div>
        {/* Category badge inset */}
        <span className="absolute top-5 left-5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-medium text-espresso/70 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
          {product.category}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {product.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              selected === i
                ? "ring-2 ring-espresso ring-offset-2 ring-offset-cream"
                : "opacity-50 hover:opacity-80 ring-1 ring-espresso/10"
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
    </div>
  );
}

// ── Product Actions ──────────────────────────────────────

function ProductActions({ product }: { product: Product }) {
  const { addItem, items, setCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.some((item) => item.id === product.id);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    setCartOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/70">
          Quantity
        </span>
        <div className="flex items-center gap-1.5 rounded-full bg-espresso/5 px-2 py-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-espresso/10 transition-colors duration-300"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={12} className="text-espresso" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-espresso tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-espresso/10 transition-colors duration-300"
            disabled={quantity >= 99}
            aria-label="Increase quantity"
          >
            <Plus size={12} className="text-espresso" />
          </button>
        </div>
        {inCart && (
          <span className="flex items-center gap-1.5 text-xs text-sage font-medium">
            <Check size={12} strokeWidth={3} />
            In cart
          </span>
        )}
      </div>

      {/* Add to Cart + Buy Now */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAdd}
          className={`flex-1 group relative inline-flex items-center justify-center gap-3 rounded-full px-8 py-3.5 text-sm font-medium overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
            added
              ? "bg-sage text-cream"
              : "bg-espresso text-cream hover:bg-espresso-light"
          }`}
        >
          <span className="relative z-10 flex items-center gap-3">
            {added ? (
              <>
                <Check size={16} strokeWidth={3} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2} />
                Add to Cart — {product.priceLabel}
              </>
            )}
          </span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </button>
        <button
          onClick={handleBuyNow}
          className="rounded-full border border-espresso/20 px-6 py-3.5 text-sm font-medium text-espresso hover:bg-espresso/5 transition-all duration-300 active:scale-[0.98]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

// ── Spec Item ────────────────────────────────────────────

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-espresso-muted/50">
        {label}
      </p>
      <p className="text-sm font-medium text-espresso leading-snug">{value}</p>
    </div>
  );
}

// ── Trust Item ───────────────────────────────────────────

function TrustItem({
  icon: Icon,
  label,
  subtext,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtext: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sage/10 mx-auto mb-2">
        <Icon size={16} className="text-sage" />
      </div>
      <p className="text-xs font-semibold text-espresso">{label}</p>
      <p className="text-[10px] text-espresso-muted/50 mt-0.5">{subtext}</p>
    </div>
  );
}

// ── Related Products ─────────────────────────────────────

function RelatedProducts({ currentSlug }: { currentSlug: string }) {
  const current = getProductBySlug(currentSlug);
  const related = getRelatedProducts(currentSlug, 3);

  if (related.length === 0) {
    // Fallback: show other products from different categories
    const others = products
      .filter((p) => p.slug !== currentSlug)
      .slice(0, 3);
    if (others.length === 0) return null;
    return <RelatedGrid products={others} title="More from the collection" />;
  }

  return <RelatedGrid products={related} title={`More ${current?.category}`} />;
}

function RelatedGrid({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) {
  return (
    <section className="mt-28 sm:mt-40">
      <AnimateOnView delay={0} rootMargin="-80px">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
              Continue Exploring
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tighter text-espresso">
              {title}
            </h2>
          </div>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300"
          >
            View All
          </Link>
        </div>
      </AnimateOnView>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, i) => (
          <AnimateOnView key={product.id} delay={80 * i} rootMargin="-50px">
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
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-espresso-muted/60 font-medium">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-semibold text-espresso mt-0.5">
                    {product.name}
                  </h3>
                </div>
                <span className="text-sm font-medium text-espresso tabular-nums">
                  {product.priceLabel}
                </span>
              </div>
            </Link>
          </AnimateOnView>
        ))}
      </div>
    </section>
  );
}
