"use client";

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { useCart } from "../lib/CartContext";

const navLinks = [
  { label: "New Arrivals", href: "#" },
  { label: "Shop All", href: "#" },
  { label: "Collections", href: "#" },
  { label: "About", href: "#" },
  { label: "Journal", href: "#" },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { itemCount, setCartOpen } = useCart();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Island Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-6 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-2xl border border-espresso/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <ShoppingBag size={18} strokeWidth={2.5} className="text-espresso" />
            <span className="text-sm font-semibold tracking-tight text-espresso">
              STORE
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-espresso-muted hover:text-espresso transition-colors duration-300 rounded-full hover:bg-espresso/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300">
              <Search size={16} />
            </button>
            <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300">
              <User size={16} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
              aria-label={`Open cart, ${itemCount} items`}
            >
              <ShoppingBag size={16} strokeWidth={2.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-espresso text-white text-[8px] font-bold flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-full text-espresso hover:bg-espresso/5 transition-all duration-300"
              aria-label="Menu"
            >
              <div
                className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                {isOpen ? <X size={16} /> : <Menu size={16} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-40 bg-cream/95 backdrop-blur-3xl md:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold tracking-tight text-espresso hover:text-espresso-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  transitionDelay: isOpen ? `${50 * i}ms` : `${50 * (navLinks.length - 1 - i)}ms`,
                  transform: isOpen ? "translateY(0)" : "translateY(24px)",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                {link.label}
              </a>
            ))}
            <div
              className="flex items-center gap-4 mt-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transitionDelay: isOpen ? "250ms" : "50ms",
                transform: isOpen ? "translateY(0)" : "translateY(24px)",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <button className="p-3 rounded-full bg-espresso text-cream">
                <Search size={18} />
              </button>
              <button className="p-3 rounded-full bg-espresso text-cream">
                <User size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
