"use client";

import { ArrowRight } from "lucide-react";
import AnimateOnView from "./AnimateOnView";

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] bg-cream overflow-hidden">
      {/* Background decorative ellipse */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sage/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-espresso/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[100dvh]">
        {/* Left: Editorial Content */}
        <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 xl:px-28 pt-32 pb-16 lg:pb-0">
          <div className="max-w-xl">
            <AnimateOnView delay={0} duration={700} rootMargin="-100px">
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-6">
                Spring Summer 2025
              </span>
            </AnimateOnView>

            <AnimateOnView delay={100} duration={700} rootMargin="-100px">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.9] text-espresso">
                Essentials
                <br />
                <span className="text-espresso-muted">Reimagined</span>
              </h1>
            </AnimateOnView>

            <AnimateOnView delay={200} duration={700} rootMargin="-100px">
              <p className="mt-6 text-base sm:text-lg text-espresso-muted leading-relaxed max-w-md">
                Thoughtfully crafted everyday pieces, designed to last.
                Discover our latest collection where form meets function.
              </p>
            </AnimateOnView>

            <AnimateOnView delay={300} duration={700} rootMargin="-100px">
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="#"
                  className="group relative inline-flex items-center gap-3 rounded-full bg-espresso px-8 py-3.5 text-sm font-medium text-cream overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-espresso-light active:scale-[0.97]"
                >
                  <span className="relative z-10">Shop the Collection</span>
                  <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-cream/20 group-hover:bg-cream/30 transition-colors duration-300">
                    <ArrowRight
                      size={12}
                      strokeWidth={3}
                      className="text-cream group-hover:translate-x-[1px] transition-transform duration-300"
                    />
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </a>
                <a
                  href="#"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-espresso-muted hover:text-espresso transition-colors duration-300"
                >
                  <span>Explore Lookbook</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform duration-300"
                  />
                </a>
              </div>
            </AnimateOnView>

            <AnimateOnView delay={400} duration={700} rootMargin="-100px">
              <div className="mt-16 flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] text-espresso-muted/60">
                <span>Free Shipping</span>
                <span className="w-px h-3 bg-espresso/10" />
                <span>30-Day Returns</span>
                <span className="w-px h-3 bg-espresso/10" />
                <span>Sustainable</span>
              </div>
            </AnimateOnView>
          </div>
        </div>

        {/* Right: Visual Asset */}
        <div className="relative flex-1 min-h-[50vh] lg:min-h-full overflow-hidden">
          <div
            className={`absolute inset-0 m-6 sm:m-8 lg:m-12 rounded-[2rem] overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]`}
          >
            <div className="hero-image-enter absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-espresso/20 via-transparent to-espresso/10 z-10" />
              <img
                src="https://picsum.photos/seed/hero-essentials/1200/1600"
                alt="Premium lifestyle collection"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Floating badge */}
          <div
            className="absolute bottom-12 right-12 lg:bottom-16 lg:right-16 z-20"
            style={{
              animation: "heroFadeUp 0.7s 0.6s cubic-bezier(0.32,0.72,0,1) both",
            }}
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 px-5 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                  >
                    <img
                      src={`https://picsum.photos/seed/avatar-${i}/100/100`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-espresso">2.4k+</p>
                <p className="text-espresso-muted/70">Happy customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
