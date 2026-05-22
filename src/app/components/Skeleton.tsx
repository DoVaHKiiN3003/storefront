/**
 * Reusable skeleton loading components with shimmer animation.
 * Each component mirrors the layout of its corresponding page section
 * to minimize layout shift (CLS).
 */

// ── Base Block ───────────────────────────────────────────

export function SkeletonBlock({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ── Text lines ──────────────────────────────────────────

export function SkeletonText({
  lines = 1,
  lastWidth = "60%",
  className = "",
}: {
  lines?: number;
  lastWidth?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className="h-3 rounded-md"
          style={{ width: i === lines - 1 ? lastWidth : "100%" }}
        />
      ))}
    </div>
  );
}

// ── Product Card Skeleton ────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="block" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso/3 aspect-[4/5]">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-3 w-3/5 rounded-md" />
          <SkeletonBlock className="h-3 w-12 rounded-md shrink-0" />
        </div>
        <SkeletonBlock className="h-2.5 w-1/3 rounded-md" />
      </div>
    </div>
  );
}

// ── Product Grid Skeleton ────────────────────────────────

export function ProductGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Image Gallery Skeleton (product detail page) ────────

export function ImageGallerySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[2rem] bg-espresso/3 aspect-[3/4] sm:aspect-[4/5]">
        <div className="absolute inset-0 skeleton" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ── Product Info Skeleton (product detail page right side) ─

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-8 max-w-lg" aria-hidden="true">
      {/* Category badge */}
      <SkeletonBlock className="h-6 w-24 rounded-full" />

      {/* Title */}
      <SkeletonBlock className="h-10 w-full rounded-lg" />
      <SkeletonBlock className="h-10 w-3/4 rounded-lg" />

      {/* Price */}
      <SkeletonBlock className="h-8 w-28 rounded-md" />

      {/* Description */}
      <SkeletonText lines={3} className="pt-2" />

      {/* Details */}
      <div className="space-y-3 pt-4">
        <SkeletonBlock className="h-4 w-16 rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <SkeletonBlock className="mt-1.5 w-1 h-1 rounded-full shrink-0" />
            <SkeletonBlock className="h-3 flex-1 rounded-md" />
          </div>
        ))}
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-4 py-6 border-y border-espresso/5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-2.5 w-16 rounded-md" />
            <SkeletonBlock className="h-3.5 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        <SkeletonBlock className="h-12 w-full rounded-full" />
        <SkeletonBlock className="h-12 w-full rounded-full" />
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <SkeletonBlock className="w-10 h-10 rounded-full mx-auto" />
            <SkeletonBlock className="h-3 w-20 mx-auto rounded-md" />
            <SkeletonBlock className="h-2.5 w-14 mx-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reviews Section Skeleton ─────────────────────────────

export function ReviewsSkeleton() {
  return (
    <div className="mt-28 sm:mt-40" aria-hidden="true">
      <SkeletonBlock className="h-5 w-48 rounded-full mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div className="space-y-6">
          <SkeletonBlock className="h-16 w-32 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonBlock className="h-2 flex-1 rounded-full" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 border-b border-espresso/5 pb-6">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="w-8 h-8 rounded-full" />
                <SkeletonBlock className="h-3 w-24 rounded-md" />
              </div>
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Checkout Page Skeleton ───────────────────────────────

export function CheckoutSkeleton() {
  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28" aria-hidden="true">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <SkeletonBlock className="h-4 w-12 rounded-md mb-8" />

        {/* Header */}
        <div className="mb-10">
          <SkeletonBlock className="h-4 w-32 rounded-full mb-3" />
          <SkeletonBlock className="h-9 w-64 rounded-lg" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
              {i < 2 && <SkeletonBlock className="flex-1 h-px mx-4" />}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left: Form skeleton */}
          <div className="lg:col-span-3">
            <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
              {/* Form icon + title */}
              <div className="flex items-center gap-3 mb-8">
                <SkeletonBlock className="w-8 h-8 rounded-full" />
                <SkeletonBlock className="h-4 w-40 rounded-md" />
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-20 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-20 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-16 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-14 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-16 rounded-md" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-12 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-12 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3 w-20 rounded-md" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <div className="mt-8 pt-6 border-t border-espresso/5 flex justify-end">
                <SkeletonBlock className="h-11 w-44 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right: Order summary skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-espresso/5">
                <SkeletonBlock className="h-3 w-28 rounded-md" />
                <SkeletonBlock className="h-3 w-12 rounded-md" />
              </div>
              <div className="space-y-4 mb-6 pb-6 border-b border-espresso/5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <SkeletonBlock className="w-14 h-16 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-3 w-3/5 rounded-md" />
                      <SkeletonBlock className="h-2.5 w-1/4 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm mb-6 pb-6 border-b border-espresso/5">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-16 rounded-md" />
                  <SkeletonBlock className="h-3 w-12 rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-16 rounded-md" />
                  <SkeletonBlock className="h-3 w-12 rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-12 rounded-md" />
                  <SkeletonBlock className="h-3 w-12 rounded-md" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-12 rounded-md" />
                <SkeletonBlock className="h-6 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Search Page Skeleton ─────────────────────────────────

export function SearchPageSkeleton() {
  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto" aria-hidden="true">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
        <SkeletonBlock className="h-5 w-24 rounded-full mx-auto" />
        <SkeletonBlock className="h-10 sm:h-12 w-64 mx-auto rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <SkeletonBlock className="h-12 w-full rounded-full" />
      </div>

      {/* Filter chips */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-7 w-20 rounded-full shrink-0" />
          ))}
          <SkeletonBlock className="h-7 w-16 rounded-full shrink-0 ml-auto" />
          <SkeletonBlock className="h-7 w-16 rounded-full shrink-0" />
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-2xl mx-auto mb-8">
        <SkeletonBlock className="h-3 w-32 rounded-md" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Home Page Skeleton ───────────────────────────────────

export function HomePageSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Hero skeleton */}
      <div className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="absolute inset-0 skeleton opacity-30" />
        <div className="relative z-10 w-full max-w-2xl">
          <SkeletonBlock className="h-5 w-32 rounded-full mb-6" />
          <SkeletonBlock className="h-16 sm:h-20 md:h-24 w-full rounded-lg mb-4" />
          <SkeletonBlock className="h-16 sm:h-20 md:h-24 w-3/4 rounded-lg mb-6" />
          <SkeletonBlock className="h-4 w-96 max-w-full rounded-md mb-10" />
          <div className="flex gap-4">
            <SkeletonBlock className="h-12 w-40 rounded-full" />
            <SkeletonBlock className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Featured products skeleton */}
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 py-24 sm:py-32">
        <SkeletonBlock className="h-5 w-32 rounded-full mb-4" />
        <SkeletonBlock className="h-9 w-72 rounded-lg mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 py-24 sm:py-32">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-48 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
