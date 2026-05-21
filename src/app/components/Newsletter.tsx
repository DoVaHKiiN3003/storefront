"use client";

import { useRef } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { useOnView } from "./AnimateOnView";

export default function Newsletter() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useOnView(ref, "-100px");

  return (
    <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div ref={ref}>
        <div
          className={`max-w-6xl mx-auto transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDuration: "600ms" }}
        >
          <div className="rounded-[2rem] bg-sage/5 p-1.5">
            <div className="rounded-[calc(2rem-0.375rem)] bg-espresso overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-espresso-light/20 via-espresso to-espresso" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cream/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 px-8 sm:px-14 lg:px-20 py-16 sm:py-20">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                      <Mail size={16} className="text-cream" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-cream/60">
                      Stay Connected
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-cream leading-[1.1]">
                    Join the
                    <br />
                    <span className="text-cream/70">Inner Circle</span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-cream/60 max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Be the first to know about new collections, early access,
                    and exclusive stories from our makers.
                  </p>
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  aria-label="Newsletter signup"
                  className="w-full max-w-md"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full rounded-full bg-white/10 border border-cream/20 px-5 py-3.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/50 focus:bg-white/15 transition-all duration-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-espresso hover:bg-cream/90 active:scale-[0.98] transition-all duration-300 shrink-0"
                    >
                      <span>Subscribe</span>
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform duration-300"
                      />
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-cream/40">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
