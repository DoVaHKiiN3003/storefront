"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import AnimateOnView, { useOnView } from "./AnimateOnView";

const testimonials = [
  {
    name: "Margot Chen",
    role: "Interior Designer",
    avatar: "margot",
    quote:
      "Every piece feels intentional. The ceramic collection has completely transformed how I approach table settings — it's art you can live with.",
    rating: 5,
  },
  {
    name: "James Okonkwo",
    role: "Architect",
    avatar: "james",
    quote:
      "The quality of the wool throws is unmatched. You can feel the weight and craftsmanship the moment you hold one. Trimately heirloom-grade.",
    rating: 5,
  },
  {
    name: "Elena Voss",
    role: "Fashion Editor",
    avatar: "elena",
    quote:
      "I've been searching for objects that feel both modern and timeless. This is the first collection that actually delivers on that promise.",
    rating: 5,
  },
];

export default function Testimonials() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerVisible = useOnView(headerRef, "-100px");

  return (
    <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div ref={headerRef}>
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDuration: "600ms" }}
        >
          <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
            Kind Words
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1]">
            What Our
            <br />
            <span className="text-espresso-muted">Community Says</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <AnimateOnView key={t.name} delay={100 * i} rootMargin="-50px">
            <div className="group relative rounded-[1.5rem] bg-white/70 backdrop-blur-sm border border-espresso/5 p-7 sm:p-8 hover:bg-white/90 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (                  <Star
                  key={j}
                  size={14}
                  fill="currentColor"
                  className="text-sage"
                />
                ))}
              </div>
              <p className="text-sm sm:text-base text-espresso-muted leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src={`https://picsum.photos/seed/${t.avatar}/100/100`}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-espresso">
                    {t.name}
                  </p>
                  <p className="text-xs text-espresso-muted/60">{t.role}</p>
                </div>
              </div>
            </div>
          </AnimateOnView>
        ))}
      </div>
    </section>
  );
}
