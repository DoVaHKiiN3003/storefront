"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
} from "lucide-react";
import { products } from "../lib/products";
import { useWishlist } from "../lib/WishlistContext";
import AnimateOnView from "../components/AnimateOnView";
import type { Product } from "../lib/types";

const categories = ["All", "Objects", "Bags", "Dining", "Textiles", "Lighting"];

const priceRanges = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 – $250", min: 100, max: 250 },
  { label: "$250 – $400", min: 250, max: 400 },
  { label: "$400+", min: 400, max: 999999 },
];

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A–Z", value: "name-asc" },
  { label: "Name: Z–A", value: "name-desc" },
];

export default function SearchPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="pt-36 pb-32 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-sage/10 mx-auto mb-6 animate-pulse" />
            <div className="h-8 w-48 bg-espresso/5 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : null;
  const initialMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : null;

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(
    initialMinPrice !== null && initialMaxPrice !== null && initialMaxPrice !== 999999
      ? { min: initialMinPrice, max: initialMaxPrice }
      : initialMinPrice !== null && initialMaxPrice === 999999
      ? { min: initialMinPrice, max: 999999 }
      : null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter products
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      // Text search
      if (query) {
        const q = query.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q) ||
          p.details.some((d) => d.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      // Category
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }
      // Price range
      if (priceRange) {
        if (p.price < priceRange.min || p.price > priceRange.max) {
          return false;
        }
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default: sort by ID (original order)
        result = [...result].sort((a, b) => a.id - b.id);
    }

    return result;
  }, [query, selectedCategory, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (priceRange) {
      params.set("minPrice", String(priceRange.min));
      params.set("maxPrice", String(priceRange.max));
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    setQuery("");
    setSelectedCategory("All");
    setPriceRange(null);
    setSortBy("relevance");
    router.push("/search", { scroll: false });
  };

  const hasActiveFilters =
    query || selectedCategory !== "All" || priceRange !== null;

  const resultsCount = filtered.length;

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto">
      {/* Header */}
      <AnimateOnView delay={0} rootMargin="-80px">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-5">
            Explore
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-espresso leading-[1.08]">
            Find your piece
          </h1>
        </div>
      </AnimateOnView>

      {/* Search form */}
      <AnimateOnView delay={100} rootMargin="-80px">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-espresso-muted/50 pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, materials, categories..."
              className="w-full pl-13 pr-14 py-4 rounded-full bg-white border border-espresso/10 text-sm text-espresso placeholder:text-espresso-muted/30 focus:outline-none focus:border-sage/40 focus:ring-2 focus:ring-sage/10 transition-all duration-300"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full hover:bg-espresso/5 transition-colors duration-300"
                aria-label="Clear search"
              >
                <X size={14} className="text-espresso-muted/60" />
              </button>
            )}
          </div>
        </form>
      </AnimateOnView>

      {/* Filter toggles row */}
      <AnimateOnView delay={150} rootMargin="-80px">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 mb-8">
          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  const params = new URLSearchParams(searchParams.toString());
                  if (cat !== "All") params.set("category", cat);
                  else params.delete("category");
                  if (query) params.set("q", query);
                  if (priceRange) {
                    params.set("minPrice", String(priceRange.min));
                    params.set("maxPrice", String(priceRange.max));
                  }
                  router.push(`/search?${params.toString()}`, { scroll: false });
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-espresso text-cream shadow-[0_2px_8px_-2px_rgba(60,47,42,0.2)]"
                    : "bg-white text-espresso-muted border border-espresso/10 hover:border-espresso/20 hover:text-espresso"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Filters */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                  sortBy !== "relevance"
                    ? "bg-espresso text-cream shadow-[0_2px_8px_-2px_rgba(60,47,42,0.2)]"
                    : "bg-white text-espresso-muted border border-espresso/10 hover:border-espresso/20 hover:text-espresso"
                }`}
              >
                <ArrowUpDown size={12} strokeWidth={2} />
                Sort
                {sortBy !== "relevance" && <span className="ml-1 opacity-70">•</span>}
              </button>

              {showSort && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSort(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-44 rounded-2xl bg-white border border-espresso/10 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] p-2">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSort(false);
                        }}
                        className={`w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 ${
                          sortBy === opt.value
                            ? "bg-espresso/5 text-espresso"
                            : "text-espresso-muted hover:bg-espresso/3 hover:text-espresso"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Price filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                  priceRange
                    ? "bg-espresso text-cream shadow-[0_2px_8px_-2px_rgba(60,47,42,0.2)]"
                    : "bg-white text-espresso-muted border border-espresso/10 hover:border-espresso/20 hover:text-espresso"
                }`}
              >
                <SlidersHorizontal size={12} strokeWidth={2} />
                Price
                {priceRange && <span className="ml-1 opacity-70">•</span>}
              </button>

              {/* Price dropdown */}
              {showFilters && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilters(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-2xl bg-white border border-espresso/10 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] p-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          if (
                            priceRange?.min === range.min &&
                            priceRange?.max === range.max
                          ) {
                            setPriceRange(null);
                          } else {
                            setPriceRange({ min: range.min, max: range.max });
                          }
                          setShowFilters(false);
                        }}
                        className={`w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 ${
                          priceRange?.min === range.min &&
                          priceRange?.max === range.max
                            ? "bg-espresso/5 text-espresso"
                            : "text-espresso-muted hover:bg-espresso/3 hover:text-espresso"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                    {priceRange && (
                      <button
                        onClick={() => {
                          setPriceRange(null);
                          setShowFilters(false);
                        }}
                        className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium text-espresso-muted/50 hover:text-espresso hover:bg-espresso/3 transition-all duration-300 mt-1 border-t border-espresso/5 pt-3"
                      >
                        Clear price filter
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-espresso-muted/50 hover:text-espresso transition-colors duration-300"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      </AnimateOnView>

      {/* Results count */}
      <AnimateOnView delay={200} rootMargin="-60px">
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-xs text-espresso-muted/50 font-medium">
            {hasActiveFilters ? (
              <>
                <span className="text-espresso font-semibold">{resultsCount}</span>{" "}
                {resultsCount === 1 ? "result" : "results"}
                {(query || selectedCategory !== "All" || priceRange) && (
                  <span className="ml-1.5 opacity-60">
                    for
                    {query && <span className="ml-1">"{query}"</span>}
                    {selectedCategory !== "All" && (
                      <span className="ml-1">in {selectedCategory}</span>
                    )}
                    {priceRange && (
                      <span className="ml-1">
                        ${priceRange.min}–${priceRange.max === 999999 ? "∞" : priceRange.max}
                      </span>
                    )}
                  </span>
                )}
              </>
            ) : (
              "All products"
            )}
          </p>
        </div>
      </AnimateOnView>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <AnimateOnView
              key={product.id}
              delay={Math.min(i * 60, 300)}
              rootMargin="-40px"
            >
              <ProductCard product={product} />
            </AnimateOnView>
          ))}
        </div>
      ) : (
        /* Empty state */
        <AnimateOnView delay={250} rootMargin="-60px">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
              <Search size={24} className="text-sage" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-espresso mb-2">
              No results found
            </h2>
            <p className="text-sm text-espresso-muted/70 mb-8 leading-relaxed">
              {query
                ? `We couldn't find anything matching "${query}"`
                : "Try adjusting your filters"}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {priceRange && ` within the selected price range`}.
            </p>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300 active:scale-[0.98]"
            >
              Clear all filters
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </AnimateOnView>
      )}
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFav = isInWishlist(product.id);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso/5 aspect-[4/5]">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-espresso/3 animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top-left category badge / Top-right wishlist */}
        <span className="absolute top-4 left-4 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-0.5 text-[8px] uppercase tracking-[0.15em] font-medium text-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
          {product.category}
        </span>

        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
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
          <h3 className="text-sm font-semibold text-espresso truncate">
            {product.name}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.1em] text-espresso-muted/50 font-medium mt-0.5">
            {product.category}
          </p>
        </div>
        <span className="text-sm font-medium text-espresso tabular-nums shrink-0">
          {product.priceLabel}
        </span>
      </div>
    </Link>
  );
}
