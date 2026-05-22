"use client";

import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
  } = useCart();
  const router = useRouter();
  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    if (cartOpen) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-espresso/20 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ animation: "overlayFadeIn 0.4s cubic-bezier(0.32,0.72,0,1) both" }}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-[110] h-full w-full sm:w-[420px] lg:w-[480px] bg-cream shadow-2xl flex flex-col"
        style={{
          animation: "drawerSlideIn 0.5s cubic-bezier(0.32,0.72,0,1) both",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-espresso/10 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={2} className="text-espresso" />
            <span className="text-base font-semibold tracking-tight text-espresso">
              Cart
            </span>
            <span className="text-xs text-espresso-muted/70 font-medium">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-espresso/5 transition-colors duration-300"
            aria-label="Close cart"
          >
            <X size={18} className="text-espresso" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center">
              <ShoppingBag size={28} className="text-sage" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-semibold text-espresso">Your cart is empty</p>
              <p className="text-sm text-espresso-muted/70 mt-1 max-w-xs">
                Looks like you haven&apos;t added anything yet. Explore our collection and find
                something you love.
              </p>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="mt-2 rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-hide">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-2xl bg-white border border-espresso/5 transition-all duration-300"
              >
                {/* Image */}
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-espresso/5 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-espresso truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-espresso-muted/70 mt-0.5">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-50 transition-colors duration-300 shrink-0 group"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2
                        size={13}
                        className="text-espresso-muted/50 group-hover:text-red-400 transition-colors duration-300"
                      />
                    </button>
                  </div>

                  {/* Quantity controls */}
                  <div className="mt-auto flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-espresso/5 hover:bg-espresso/10 transition-colors duration-300"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus size={12} className="text-espresso" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-espresso tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-espresso/5 hover:bg-espresso/10 transition-colors duration-300"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={12} className="text-espresso" />
                    </button>
                    <span className="ml-auto text-sm font-semibold text-espresso tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-espresso/10 px-6 py-5 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-espresso-muted">Subtotal</span>
              <span className="text-lg font-semibold tracking-tight text-espresso tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-espresso-muted/50">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={() => {
                // Store cart items for checkout page
                sessionStorage.setItem(
                  "storefront-checkout-cart",
                  JSON.stringify({
                    items,
                    subtotal,
                    timestamp: Date.now(),
                  })
                );
                setCartOpen(false);
                router.push("/checkout");
              }}
              className="group w-full rounded-full bg-espresso py-3.5 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-2"
            >
              Checkout
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full text-center text-xs text-espresso-muted/60 hover:text-espresso transition-colors duration-300"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
