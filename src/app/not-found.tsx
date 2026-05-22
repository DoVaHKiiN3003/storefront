import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg mx-auto text-center space-y-10">
        {/* 404 graphic */}
        <div className="relative">
          <div className="w-36 h-36 mx-auto rounded-full bg-sage/10 flex items-center justify-center">
            <span className="text-6xl font-semibold tracking-tighter text-sage/40">
              404
            </span>
          </div>
          <div className="absolute -top-2 -right-2 sm:right-[calc(50%-5rem)] w-8 h-8 rounded-full bg-espresso/5 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute -bottom-1 -left-2 sm:left-[calc(50%-5rem)] w-5 h-5 rounded-full bg-sage/10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">
            Page not found
          </h1>
          <p className="text-sm sm:text-base text-espresso-muted/70 leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-3 text-sm font-medium text-espresso hover:bg-espresso/5 active:scale-[0.98] transition-all duration-300"
          >
            <Search size={14} />
            Search Products
          </Link>
        </div>

        {/* Quick links */}
        <div className="pt-6 border-t border-espresso/10">
          <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-espresso-muted/50 mb-4">
            Popular categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Objects", "Bags", "Dining", "Textiles", "Lighting"].map((cat) => (
              <Link
                key={cat}
                href={`/collections#collection-${cat.toLowerCase()}`}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-espresso-muted/60 hover:text-espresso bg-espresso/3 hover:bg-espresso/10 transition-all duration-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
