"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-md border border-espresso/10 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] text-espresso-muted hover:text-espresso hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp size={16} strokeWidth={2} />
    </button>
  );
}
