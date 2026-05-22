export interface ProductVariant {
  label: string;
  type: "size" | "color";
  priceDelta: number; // difference from base price
  color?: string; // hex for color swatches
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  priceLabel: string;
  category: string;
  image: string;
  images: string[];
  description: string;
  details: string[];
  materials: string;
  dimensions: string;
  origin: string;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string; // e.g. "Large" or "Oatmeal"
}

export type VariantKey = `${string}-${string}`; // composite key: variant-label-variant-type

// ── Order types (shared between confirmation page, email, and API route) ──

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

// ── Review types ────────────────────────────────────────

export interface Review {
  id: string;
  productId: number;
  name: string;
  rating: number; // 1–5
  title: string;
  comment: string;
  date: string; // ISO string
}

export interface ProductReviews {
  [productId: number]: Review[];
}

export interface OrderData {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  timestamp: number;
  shippingAddress: ShippingAddress;
  email: string;
}
