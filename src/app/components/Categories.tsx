"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import AnimateOnView, { useOnView } from "./AnimateOnView";

const categories = [
  {
    name: "Objects",
    description: "Sculptural pieces for modern living",
    count: "24 items",
    seed: "cat-objects",
    color: "from-espresso/40 to-espresso/10",
  },
  {
    name: "Textiles",
    description: "Woven stories, natural fibers",
    count: "18 items",
    seed: "cat-textiles",
    color: "from-sage/40 to-sage/10",
  },
  {
    name: "Dining",
    description: "Ceremonies worth gathering for",
    count: "31 items",
    seed: "cat-dining",
    color: "from-espresso-light/30 to-transparent",
  },
  {
    name: "Lighting",
    description: "Ambient glow, architectural form",
    count: "14 items",
    seed: "cat-lighting",
    color: "from-espresso/30 to-transparent",
  },
  {
    name: "Bags",
    description: "Carry the everyday with grace",
    count: "9 items",
    seed: "cat-bags",
    color: "from-sage/30 to-transparent",
  },
];

export default function Categories() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerVisible = useOnView(headerRef, "-100px");

  return (
    <section className="bg-cream py-24 sm:py-32 overflow-hidden">
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28">
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
                Browse by
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1]">
                Our
                <br />
                <span className="text-espresso-muted">Categories</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto pb-4 -mb-4 scrollbar-hide">
        <div className="flex gap-4 sm:gap-5 px-6 sm:px-12 lg:px-20 xl:px-28 w-max">
          {categories.map((cat, i) => (
            <AnimateOnView key={cat.name} delay={50 * i} direction="left" rootMargin="-50px">
              <a
                href="#"
                className="group relative w-[280px] sm:w-[340px] lg:w-[380px] h-[420px] sm:h-[480px] rounded-[2rem] overflow-hidden shrink-0 block"
              >
                <img
                  src={`https://picsum.photos/seed/${cat.seed}/800/1000`}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.color}`}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-cream/60 font-medium">
                    {cat.count}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-cream mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-cream/70 mt-1.5 max-w-[200px]">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-medium text-cream/80 group-hover:text-cream transition-colors duration-300">
                    <span>Explore</span>                  <ArrowRight
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform duration-300"
                />
                  </div>
                </div>
              </a>
            </AnimateOnView>
          ))}
        </div>
      </div>
    </section>
  );
}
