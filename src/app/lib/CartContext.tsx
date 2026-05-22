"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "./types";
import { useAnalytics } from "./AnalyticsContext";

// ── State & Actions ──────────────────────────────────────

interface CartState {
  items: CartItem[];
}

// Composite key for variant-unique cart items
function itemKey(id: number, variant?: string): string {
  return variant ? `${id}-${variant}` : `${id}`;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { product: Product; quantity?: number; variant?: string; price?: number };
    }
  | { type: "REMOVE_ITEM"; payload: { id: number; variant?: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: number; variant?: string; quantity: number };
    }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity = 1, variant, price } = action.payload;
      const key = itemKey(product.id, variant);
      const existing = state.items.find(
        (item) => itemKey(item.id, item.variant) === key
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            itemKey(item.id, item.variant) === key
              ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: price ?? product.price,
            image: product.image,
            quantity: Math.min(quantity, 99),
            variant,
          },
        ],
      };
    }
    case "REMOVE_ITEM": {
      const { id, variant } = action.payload;
      const key = itemKey(id, variant);
      return {
        items: state.items.filter(
          (item) => itemKey(item.id, item.variant) !== key
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const { id, variant, quantity } = action.payload;
      const key = itemKey(id, variant);
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => itemKey(item.id, item.variant) !== key
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          itemKey(item.id, item.variant) === key
            ? { ...item, quantity: Math.min(quantity, 99) }
            : item
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.payload };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variant?: string, price?: number) => void;
  removeItem: (id: number, variant?: string) => void;
  updateQuantity: (id: number, quantity: number, variant?: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "storefront-cart";

// ── Provider ─────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on cart changes (only after initial hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch {
        // ignore
      }
    }
  }, [state.items, hydrated]);

  const { trackAddToCart, trackRemoveFromCart } = useAnalytics();

  const addItem = useCallback(
    (product: Product, quantity = 1, variant?: string, price?: number) => {
      dispatch({
        type: "ADD_ITEM",
        payload: { product, quantity, variant, price },
      });
      trackAddToCart(product, quantity, variant, price);
    },
    [trackAddToCart]
  );

  const removeItem = useCallback((id: number, variant?: string) => {
    // Find item before removing so we have its data for analytics
    const item = state.items.find(
      (i) => (variant ? `${i.id}-${i.variant}` : `${i.id}`) === (variant ? `${id}-${variant}` : `${id}`)
    );
    dispatch({ type: "REMOVE_ITEM", payload: { id, variant } });
    if (item) {
      trackRemoveFromCart(item);
    }
  }, [state.items, trackRemoveFromCart]);

  const updateQuantity = useCallback(
    (id: number, quantity: number, variant?: string) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, variant, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
