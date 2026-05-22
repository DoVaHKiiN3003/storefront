"use client";

import { ArrowRight, Leaf, Shield, Hand, Eye } from "lucide-react";
import Link from "next/link";
import AnimateOnView from "../components/AnimateOnView";

const values = [
  {
    icon: Hand,
    title: "Handcrafted with Purpose",
    description:
      "Every piece in our collection is made by skilled artisans using techniques refined over generations. We believe in the value of things made slowly and carefully.",
  },
  {
    icon: Leaf,
    title: "Sustainably Sourced",
    description:
      "From ethically harvested clay to organically grown linen, we source materials that honor the earth. Our packaging is 100% plastic-free and fully recyclable.",
  },
  {
    icon: Shield,
    title: "Built to Last",
    description:
      "We design for longevity — not trends. Our pieces are made to be worn, used, and loved for years. If anything ever breaks, we'll repair or replace it.",
  },
  {
    icon: Eye,
    title: "Thoughtful Design",
    description:
      "Form follows intention. Every curve, texture, and proportion is considered for how it feels in the hand and fits into daily life. Nothing is arbitrary.",
  },
];

const team = [
  {
    name: "Mira Vasquez",
    role: "Founder & Creative Director",
    bio: "Former architect turned product designer. Mira founded STORE to bridge the gap between functional design and artistic expression.",
    image: "https://picsum.photos/seed/mira-portrait/400/500",
  },
  {
    name: "Takuya Mori",
    role: "Head of Craftsmanship",
    bio: "Fourth-generation ceramicist from Kyoto. Takuya oversees all ceramic production, ensuring every piece meets exacting standards.",
    image: "https://picsum.photos/seed/takuya-portrait/400/500",
  },
  {
    name: "Lena Osei",
    role: "Sustainability Director",
    bio: "With a background in environmental science, Lena ensures every material and process in our supply chain meets rigorous ethical standards.",
    image: "https://picsum.photos/seed/lena-portrait/400/500",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-cream overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/about-hero/1920/1080"
            alt="Artisan workshop"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 xl:px-28 pt-32 pb-16">
          <div className="max-w-3xl">
            <AnimateOnView delay={0} duration={700} rootMargin="-100px">
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-6">
                Our Story
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
              <p className="mt-6 text-base sm:text-lg text-espresso-muted leading-relaxed max-w-xl">
                STORE was born from a simple belief: the objects we surround
                ourselves with shape how we live. We partner with master artisans
                around the world to create everyday pieces that bring quiet joy
                and lasting value.
              </p>
            </AnimateOnView>
          </div>
        </div>
      </section>

      {/* ── Manifesto ─────────────────────────── */}
      <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-4xl mx-auto">
          <AnimateOnView delay={0} rootMargin="-80px">
            <div className="border-t border-espresso/10 pt-12 sm:pt-16">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tighter text-espresso leading-[1.2] max-w-2xl">
                We believe in the beauty of things made by hand — objects that
                carry the quiet dignity of craft, patience, and care.
              </p>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                <p className="text-sm sm:text-base text-espresso-muted leading-relaxed">
                  Founded in 2020, STORE began as a small workshop in Brooklyn
                  with a single kiln and a vision. Today, we work with artisans
                  across four continents, bringing together traditional
                  techniques and contemporary design to create pieces that
                  transcend trend and season.
                </p>
                <p className="text-sm sm:text-base text-espresso-muted leading-relaxed">
                  Every material we use is chosen with intention — from the clay
                  in our ceramics to the linen in our textiles. We prioritize
                  slow production, fair wages, and relationships built on trust
                  and mutual respect. The result is a collection that feels as
                  good as it looks.
                </p>
              </div>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* ── Values Grid ───────────────────────── */}
      <section className="bg-espresso/3 py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-6xl mx-auto">
          <AnimateOnView delay={0} rootMargin="-80px">
            <div className="max-w-2xl mb-16">
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
                What We Stand For
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">
                Our values guide
                <br />
                <span className="text-espresso-muted">everything we make</span>
              </h2>
            </div>
          </AnimateOnView>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value, i) => (
              <AnimateOnView key={value.title} delay={80 * i} rootMargin="-60px">
                <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-8 h-full transition-all duration-300 hover:border-espresso/10 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 rounded-full bg-sage/10 flex items-center justify-center mb-5">
                    <value.icon size={18} className="text-sage" />
                  </div>
                  <h3 className="text-base font-semibold text-espresso mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-espresso-muted/80 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimateOnView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ───────────────────────────────── */}
      <section className="bg-cream py-24 sm:py-32 px-6 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-6xl mx-auto">
          <AnimateOnView delay={0} rootMargin="-80px">
            <div className="max-w-2xl mb-16">
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
                The Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">
                The people behind
                <br />
                <span className="text-espresso-muted">the craft</span>
              </h2>
            </div>
          </AnimateOnView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {team.map((member, i) => (
              <AnimateOnView key={member.name} delay={80 * i} rootMargin="-60px">
                <div className="group">
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso/5 aspect-[4/5] mb-5">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-base font-semibold text-espresso">
                    {member.name}
                  </h3>
                  <p className="text-xs text-sage font-medium mt-1">
                    {member.role}
                  </p>
                  <p className="text-sm text-espresso-muted/70 leading-relaxed mt-2">
                    {member.bio}
                  </p>
                </div>
              </AnimateOnView>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="bg-cream pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28">
        <AnimateOnView delay={0} rootMargin="-80px">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-5">
              Join us
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1] mb-6">
              Ready to find
              <br />
              <span className="text-espresso-muted">your new essential?</span>
            </h2>
            <p className="text-sm sm:text-base text-espresso-muted max-w-md mx-auto mb-10 leading-relaxed">
              Explore our collection of thoughtfully crafted objects, made to
              enrich your everyday rituals.
            </p>
            <Link
              href="/search"
              className="group relative inline-flex items-center gap-3 rounded-full bg-espresso px-8 py-3.5 text-sm font-medium text-cream overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-espresso-light active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Shop the Collection
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </Link>
          </div>
        </AnimateOnView>
      </section>
    </div>
  );
}
