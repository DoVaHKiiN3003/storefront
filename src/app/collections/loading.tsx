import { ProductCardSkeleton, SkeletonBlock } from "../components/Skeleton";

export default function CollectionsLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center bg-cream overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sage/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 xl:px-28 pt-32 pb-16">
          <div className="max-w-3xl space-y-6">
            <SkeletonBlock className="h-5 w-36 rounded-full" />
            <SkeletonBlock className="h-20 sm:h-24 md:h-28 w-80 rounded-lg" />
            <SkeletonBlock className="h-8 w-64 rounded-lg" />
            <SkeletonBlock className="h-4 w-96 max-w-full rounded-md" />
            <div className="flex gap-3 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category section skeletons */}
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <section key={sectionIdx}>
          {/* Category hero */}
          <div className="relative h-[60vh] sm:h-[70vh] skeleton opacity-20" />

          {/* Products grid */}
          <div className="px-6 sm:px-12 lg:px-20 xl:px-28 -mt-16 relative z-20">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl space-y-2">
                  <SkeletonBlock className="h-4 w-full rounded-md" />
                  <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                </div>
                <SkeletonBlock className="h-3 w-28 rounded-md shrink-0" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 sm:pb-32">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
