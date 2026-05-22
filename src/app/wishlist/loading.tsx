import { ProductGridSkeleton, SkeletonBlock } from "../components/Skeleton";

export default function WishlistLoading() {
  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <SkeletonBlock className="h-5 w-28 rounded-full mb-5" />
          <SkeletonBlock className="h-9 sm:h-10 w-64 rounded-lg" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SkeletonBlock className="h-3 w-16 rounded-md" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Product grid */}
      <ProductGridSkeleton count={4} />
    </div>
  );
}
