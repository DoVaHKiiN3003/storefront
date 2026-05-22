"use client";

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Search, User, Sun, Moon, Heart, LogIn, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../lib/CartContext";
import { useWishlist } from "../lib/WishlistContext";
import { useTheme } from "../lib/ThemeContext";
import { useCurrency } from "../lib/CurrencyContext";

const navLinks = [
  { label: "New Arrivals", href: "#" },
  { label: "Shop All", href: "#" },
  { label: "Collections", href: "/collections" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, setCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { currencies, selectedCurrency, setCurrency } = useCurrency();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("storefront-session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) setUser(parsed.user);
      }
    } catch {}
  }, [pathname]);

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
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span className="relative w-4 h-4">
                <Sun
                  size={16}
                  className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    theme === "light"
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 rotate-90 scale-75"
                  }`}
                />
                <Moon
                  size={16}
                  className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    theme === "dark"
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-75"
                  }`}
                />
              </span>
            </button>
            <button
              onClick={() => router.push("/search")}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
              aria-label="Search products"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => router.push("/wishlist")}
              className="hidden sm:flex relative items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Heart size={16} strokeWidth={2} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-400 text-white text-[8px] font-bold flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </button>
            {user ? (
              <button
                onClick={() => router.push("/account")}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
                aria-label="My account"
              >
                <User size={16} />
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
                aria-label="Sign in"
              >
                <LogIn size={16} />
              </button>
            )}
            {/* Currency selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-semibold text-espresso-muted hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
                aria-label="Select currency"
              >
                {selectedCurrency.code}
                <ChevronDown size={10} className={`transition-transform duration-300 ${showCurrencyPicker ? 'rotate-180' : ''}`} />
              </button>
              {showCurrencyPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyPicker(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 w-36 rounded-2xl bg-white border border-espresso/10 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] p-2 overflow-y-auto max-h-60">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }}
                        className={`w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                          selectedCurrency.code === c.code
                            ? "bg-espresso/5 text-espresso"
                            : "text-espresso-muted hover:bg-espresso/3 hover:text-espresso"
                        }`}
                      >
                        <span className="w-6 text-center">{c.symbol}</span>
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-espresso text-cream"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                onClick={() => router.push("/search")}
                className="p-3 rounded-full bg-espresso text-cream"
                aria-label="Search products"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => router.push("/wishlist")}
                className="p-3 rounded-full bg-espresso text-cream"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </button>
              <button
                onClick={() => router.push(user ? "/account" : "/login")}
                className="p-3 rounded-full bg-espresso text-cream"
              >
                <User size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
