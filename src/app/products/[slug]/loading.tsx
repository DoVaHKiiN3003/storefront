import { ImageGallerySkeleton, ProductInfoSkeleton, ReviewsSkeleton } from "../../components/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      {/* Back link */}
      <div className="skeleton h-4 w-12 rounded-md mb-8" />

      {/* Main content split */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20">
        {/* Left: Gallery skeleton */}
        <div className="lg:sticky lg:top-32 lg:self-start w-full lg:w-[55%] xl:w-[60%]">
          <ImageGallerySkeleton />
        </div>

        {/* Right: Product info skeleton */}
        <div className="flex-1 min-w-0">
          <ProductInfoSkeleton />
        </div>
      </div>

      {/* Reviews skeleton */}
      <ReviewsSkeleton />
    </div>
  );
}
