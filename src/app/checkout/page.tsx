"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ChevronDown,
  Lock,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
  Check,
  MapPin,
  FileText,
  X,
  Percent,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AnimateOnView from "../components/AnimateOnView";
import { CheckoutSkeleton } from "../components/Skeleton";
import { products } from "../lib/products";
import { useCart } from "../lib/CartContext";
import { useToast } from "../lib/ToastContext";
import { useAnalytics } from "../lib/AnalyticsContext";
import { useCurrency } from "../lib/CurrencyContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "pk_test_mock");

// ── Types ────────────────────────────────────────────────

type Step = "shipping" | "payment" | "review";

interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CheckoutCart {
  items: CheckoutItem[];
  subtotal: number;
  timestamp: number;
}

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PromoCode {
  code: string;
  type: "percent" | "fixed" | "freeshipping";
  value: number;
  label: string;
  discount: number;
}

// ── Constants ────────────────────────────────────────────

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const SHIPPING_STORAGE_KEY = "storefront-shipping";

const INITIAL_SHIPPING: ShippingForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

const INITIAL_PAYMENT: PaymentForm = {
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvv: "",
};


const STEPS: { key: Step; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "shipping", label: "Shipping", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: FileText },
];

// ── Helpers ──────────────────────────────────────────────

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(" ") : digits;
}

function detectCardType(number: string): string {
  const clean = number.replace(/\D/g, "");
  if (/^4/.test(clean)) return "Visa";
  if (/^5[1-5]/.test(clean)) return "Mastercard";
  if (/^3[47]/.test(clean)) return "Amex";
  if (/^6[0-9]/.test(clean)) return "Discover";
  return "";
}

function loadSavedShipping(): ShippingForm {
  try {
    const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate shape
      if (parsed.firstName !== undefined) return parsed;
    }
  } catch { /* ignore */ }
  return INITIAL_SHIPPING;
}

// ── Page ─────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();
  const {
    trackBeginCheckout,
    trackAddShippingInfo,
    trackAddPaymentInfo,
    trackPurchase,
  } = useAnalytics();
  const [checkoutCart, setCheckoutCart] = useState<CheckoutCart | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Multi-step
  const [step, setStep] = useState<Step>("shipping");
  const [stepTransition, setStepTransition] = useState<"forward" | "backward">("forward");

  // Forms
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [payment, setPayment] = useState<PaymentForm>(INITIAL_PAYMENT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Same as shipping toggle
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Load cart + saved shipping on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("storefront-checkout-cart");
      if (stored) {
        const parsed = JSON.parse(stored) as CheckoutCart;
        setCheckoutCart(parsed);
      }
    } catch { /* ignore */ }

    // Load saved shipping
    const saved = loadSavedShipping();
    if (saved.firstName) {
      setShipping(saved);
    }

    setLoaded(true);
  }, []);

  // Track begin_checkout once cart loads
  useEffect(() => {
    if (loaded && checkoutCart) {
      const items = checkoutCart.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
        variant: i.variant,
      }));
      trackBeginCheckout(items, checkoutCart.subtotal);
    }
  }, [loaded, checkoutCart, trackBeginCheckout]);

  // ── Step navigation ─────────────────────────

  const goToStep = useCallback((target: Step, direction: "forward" | "backward") => {
    setStepTransition(direction);
    setStep(target);
    setErrors({});
  }, []);

  // ── Form handlers ───────────────────────────

  const updateShipping = useCallback((field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, [errors]);

  const updatePayment = useCallback((field: keyof PaymentForm, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, [errors]);

  // ── Validation ──────────────────────────────

  const validateShipping = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!shipping.firstName.trim()) errs.firstName = "Required";
    if (!shipping.lastName.trim()) errs.lastName = "Required";
    if (!shipping.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errs.email = "Invalid email";
    if (!shipping.phone.trim()) errs.phone = "Required";
    if (!shipping.address1.trim()) errs.address1 = "Required";
    if (!shipping.city.trim()) errs.city = "Required";
    if (!shipping.state) errs.state = "Required";
    if (!shipping.zip.trim()) errs.zip = "Required";
    else if (!/^\d{5}(-\d{4})?$/.test(shipping.zip)) errs.zip = "Invalid ZIP";
    return errs;
  }, [shipping]);

  const validatePayment = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    const digits = payment.cardNumber.replace(/\D/g, "");
    if (!payment.cardNumber.trim()) errs.cardNumber = "Required";
    else if (digits.length < 13 || digits.length > 16) errs.cardNumber = "Enter a valid card number";
    if (!payment.cardName.trim()) errs.cardName = "Required";
    if (!payment.expiry.trim()) errs.expiry = "Required";
    else if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errs.expiry = "Use MM/YY format";
    if (!payment.cvv.trim()) errs.cvv = "Required";
    else if (!/^\d{3,4}$/.test(payment.cvv)) errs.cvv = "Invalid CVV";
    return errs;
  }, [payment]);

  // ── Pricing ─────────────────────────────────

  const subtotal = checkoutCart?.subtotal ?? 0;
  const baseShipping = subtotal >= 200 ? 0 : 12.5;
  const shippingCost = appliedPromo?.type === "freeshipping" ? 0 : baseShipping;
  const subtotalAfterDiscount = useMemo(() => {
    if (!appliedPromo) return subtotal;
    if (appliedPromo.type === "percent") return subtotal * (1 - appliedPromo.value / 100);
    if (appliedPromo.type === "fixed") return Math.max(0, subtotal - appliedPromo.discount);
    return subtotal;
  }, [subtotal, appliedPromo]);
  const tax = Math.round(subtotalAfterDiscount * 0.0875 * 100) / 100;
  const total = subtotalAfterDiscount + shippingCost + tax;

  // ── Promo logic ─────────────────────────────

  const applyPromo = useCallback(async () => {
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: checkoutCart?.subtotal ?? 0 }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.error || "Invalid promo code");
        setPromoLoading(false);
        return;
      }
      setAppliedPromo({
        code: data.code,
        type: data.type,
        value: data.value,
        label: data.label,
        discount: data.discount,
      });
      setPromoInput("");
      addToast(`${data.label} applied!`, "success");
    } catch {
      setPromoError("Could not validate promo code. Please try again.");
    }
    setPromoLoading(false);
  }, [promoInput, subtotal, addToast]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoError("");
  }, []);

  // ── Step transitions ─────────────────────────

  const handleShippingNext = useCallback(() => {
    const errs = validateShipping();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Save shipping to localStorage
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
    } catch { /* ignore */ }

    // Pre-fill card name from shipping name
    if (!payment.cardName && shipping.firstName) {
      setPayment((prev) => ({ ...prev, cardName: `${shipping.firstName} ${shipping.lastName}` }));
    }

    // Track shipping info step
    trackAddShippingInfo(
      subtotalAfterDiscount + shippingCost + tax,
      appliedPromo?.code
    );

    goToStep("payment", "forward");
  }, [shipping, validateShipping, payment.cardName, goToStep, trackAddShippingInfo, subtotalAfterDiscount, shippingCost, tax, appliedPromo]);

  const handlePaymentNext = useCallback(() => {
    const errs = validatePayment();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Track payment info step
    trackAddPaymentInfo(
      subtotalAfterDiscount + shippingCost + tax,
      appliedPromo?.code
    );

    goToStep("review", "forward");
  }, [validatePayment, goToStep, trackAddPaymentInfo, subtotalAfterDiscount, shippingCost, tax, appliedPromo]);

  const handlePlaceOrder = useCallback(async () => {
    if (!checkoutCart) return;
    setSubmitting(true);

    const items = checkoutCart.items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
      variant: i.variant,
    }));

    // Create order data
    const orderData = {
      items,
      subtotal: subtotalAfterDiscount,
      shipping: shippingCost,
      tax,
      total,
      email: shipping.email,
      shippingAddress: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        line1: shipping.address1,
        line2: shipping.address2 || "",
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
      },
      couponCode: appliedPromo?.code ?? null,
      discount: appliedPromo?.type !== "freeshipping" ? (subtotal - subtotalAfterDiscount) : 0,
    };

    try {
      // Create payment intent
      const piRes = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "usd" }),
      });
      const piData = await piRes.json();

      // Save order to database
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          paymentIntent: piData.paymentIntentId ?? null,
        }),
      });

      if (!orderRes.ok) {
        console.warn("Order saved with fallback — DB write failed");
      }
    } catch (err) {
      console.warn("Could not save order to DB:", err);
    }

    // Store final order data for confirmation page
    sessionStorage.setItem(
      "storefront-order",
      JSON.stringify({
        ...orderData,
        timestamp: Date.now(),
      })
    );

    // Generate order number for purchase event
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Track purchase
    trackPurchase(
      orderId,
      total,
      items,
      appliedPromo?.code,
      shippingCost,
      tax
    );

    // Clean up checkout cart
    sessionStorage.removeItem("storefront-checkout-cart");

    // Simulate processing
    setTimeout(() => {
      clearCart();
      router.push("/confirmation");
    }, 800);
  }, [checkoutCart, subtotalAfterDiscount, shippingCost, tax, total, shipping, clearCart, router, trackPurchase, appliedPromo, subtotal]);

  // ── Empty state ─────────────────────────────

  if (loaded && !checkoutCart) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-sage/10 flex items-center justify-center">
            <ShoppingBag size={28} className="text-sage" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-espresso">Your cart is empty</h1>
            <p className="text-sm text-espresso-muted/70 mt-2 leading-relaxed">
              Add some items to your cart before checking out.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300 active:scale-[0.98]">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded || !checkoutCart) {
    return <CheckoutSkeleton />;
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // ── Render ──────────────────────────────────

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <AnimateOnView delay={0} rootMargin="-80px">
          <button
            onClick={() => {
              if (step === "shipping") router.back();
              else goToStep(STEPS[stepIndex - 1].key, "backward");
            }}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 mb-8"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            {step === "shipping" ? "Back" : "Back"}
          </button>
        </AnimateOnView>

        {/* Header */}
        <AnimateOnView delay={40} rootMargin="-80px">
          <div className="mb-10">
            <span className="block text-[10px] uppercase tracking-[0.2em] font-medium text-sage mb-3">Secure Checkout</span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">Complete your order</h1>
          </div>
        </AnimateOnView>

        {/* Step indicator */}
        <AnimateOnView delay={60} rootMargin="-80px">
          <div className="flex items-center gap-0 mb-12">
            {STEPS.map((s, i) => {
              const isActive = s.key === step;
              const isCompleted = i < stepIndex;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isCompleted
                        ? "bg-sage text-cream"
                        : isActive
                        ? "bg-espresso text-cream shadow-[0_2px_12px_-2px_rgba(60,47,42,0.2)]"
                        : "bg-espresso/5 text-espresso-muted/50"
                    }`}>
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold tracking-tight hidden sm:block transition-colors duration-300 ${
                      isActive ? "text-espresso" : "text-espresso-muted/50"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-4 transition-colors duration-500 ${
                      i < stepIndex ? "bg-sage/30" : "bg-espresso/10"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </AnimateOnView>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left: Step content */}
          <div className="lg:col-span-3">
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              stepTransition === "forward" ? "animate-in" : "animate-in"
            }`}>
              {step === "shipping" && (
                <ShippingStep
                  shipping={shipping}
                  updateField={updateShipping}
                  errors={errors}
                  onNext={handleShippingNext}
                />
              )}
              {step === "payment" && (
                <PaymentStep
                  payment={payment}
                  updateField={updatePayment}
                  errors={errors}
                  sameAsShipping={sameAsShipping}
                  setSameAsShipping={setSameAsShipping}
                  onNext={handlePaymentNext}
                  onBack={() => goToStep("shipping", "backward")}
                />
              )}
              {step === "review" && (
                <ReviewStep
                  checkoutCart={checkoutCart}
                  shipping={shipping}
                  payment={payment}
                  promoInput={promoInput}
                  setPromoInput={setPromoInput}
                  applyPromo={applyPromo}
                  appliedPromo={appliedPromo}
                  removePromo={removePromo}
                  promoError={promoError}
                  subtotal={subtotal}
                  subtotalAfterDiscount={subtotalAfterDiscount}
                  shippingCost={shippingCost}
                  tax={tax}
                  total={total}
                  submitting={submitting}
                  formatPrice={formatPrice}
                  onPlaceOrder={handlePlaceOrder}
                  onBack={() => goToStep("payment", "backward")}
                />
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32 space-y-8">
              <AnimateOnView delay={120} rootMargin="-80px" direction="right">
                <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-espresso/5">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">Order Summary</h2>
                    <span className="text-xs text-espresso-muted/60">{checkoutCart.items.length} {checkoutCart.items.length === 1 ? "item" : "items"}</span>
                  </div>

                  <div className="space-y-4 mb-6 pb-6 border-b border-espresso/5">
                    {checkoutCart.items.map((item) => (
                      <div key={item.id} className="flex gap-3 group">
                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-espresso/5 shrink-0 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-espresso text-white text-[8px] font-bold flex items-center justify-center">{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <Link href={`/products/${products.find((p) => p.id === item.id)?.slug ?? "#"}`}
                            className="text-xs font-semibold text-espresso hover:text-espresso-muted transition-colors duration-300 truncate">{item.name}</Link>
                          <span className="text-[11px] text-espresso-muted/60 mt-0.5 tabular-nums">{formatPrice(item.price)}</span>
                        </div>
                        <span className="text-xs font-semibold text-espresso tabular-nums self-center">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-sm mb-6 pb-6 border-b border-espresso/5">
                    <SummaryRow label="Subtotal" value={subtotal} formatPrice={formatPrice} />
                    {appliedPromo && appliedPromo.type !== "freeshipping" && (
                      <div className="flex items-center justify-between text-sage">
                        <span className="text-xs flex items-center gap-1">
                          <Percent size={10} /> {appliedPromo.label}
                        </span>
                        <span className="text-xs font-medium tabular-nums">
                          -{formatPrice(subtotal - subtotalAfterDiscount)}
                        </span>
                      </div>
                    )}
                    <SummaryRow label="Shipping" value={shippingCost} formatPrice={formatPrice} />
                    <SummaryRow label="Tax" value={tax} note="8.75%" formatPrice={formatPrice} />
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-espresso">Total</span>
                    <span className="text-xl font-semibold tracking-tight text-espresso tabular-nums">{formatPrice(total)}</span>
                  </div>

                  {appliedPromo?.type === "freeshipping" && (
                    <div className="rounded-xl bg-sage/10 border border-sage/20 px-4 py-3 text-center mb-6">
                      <span className="text-xs font-medium text-sage">FREE shipping applied!</span>
                    </div>
                  )}
                </div>
              </AnimateOnView>

              {baseShipping === 0 && subtotal > 0 && (
                <AnimateOnView delay={160} rootMargin="-80px" direction="right">
                  <div className="rounded-2xl bg-sage/10 border border-sage/20 px-5 py-4 text-center">
                    <Truck size={16} className="text-sage mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-sage">You qualify for free shipping!</p>
                  </div>
                </AnimateOnView>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Shipping ──────────────────────────────────────

function ShippingStep({
  shipping,
  updateField,
  errors,
  onNext,
}: {
  shipping: ShippingForm;
  updateField: (field: keyof ShippingForm, value: string) => void;
  errors: FormErrors;
  onNext: () => void;
}) {
  return (
    <AnimateOnView delay={80} rootMargin="-80px">
      <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
            <MapPin size={14} className="text-sage" />
          </div>
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">Shipping Information</h2>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="First Name" value={shipping.firstName} onChange={(v) => updateField("firstName", v)} error={errors.firstName} placeholder="Alex" />
            <InputField label="Last Name" value={shipping.lastName} onChange={(v) => updateField("lastName", v)} error={errors.lastName} placeholder="Chen" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Email" type="email" value={shipping.email} onChange={(v) => updateField("email", v)} error={errors.email} placeholder="alex@example.com" />
            <InputField label="Phone" type="tel" value={shipping.phone} onChange={(v) => updateField("phone", v)} error={errors.phone} placeholder="(555) 123-4567" />
          </div>
          <InputField label="Address" value={shipping.address1} onChange={(v) => updateField("address1", v)} error={errors.address1} placeholder="742 Evergreen Terrace" />
          <InputField label="Apartment, suite, etc. (optional)" value={shipping.address2} onChange={(v) => updateField("address2", v)} placeholder="Apt 4B" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="City" value={shipping.city} onChange={(v) => updateField("city", v)} error={errors.city} placeholder="Brooklyn" />
            <SelectField label="State" value={shipping.state} onChange={(v) => updateField("state", v)} error={errors.state} options={US_STATES} placeholder="Select" />
            <InputField label="ZIP Code" value={shipping.zip} onChange={(v) => updateField("zip", v)} error={errors.zip} placeholder="11201" />
          </div>
          <InputField label="Country" value={shipping.country} onChange={(v) => updateField("country", v)} disabled />
        </div>

        <div className="mt-8 pt-6 border-t border-espresso/5 flex justify-end">
          <button onClick={onNext}
            className="group rounded-full bg-espresso px-8 py-3 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2">
            Continue to Payment
            <ArrowLeft size={14} className="rotate-180 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </AnimateOnView>
  );
}

// ── Step 2: Payment ───────────────────────────────────────

function PaymentStep({
  payment,
  updateField,
  errors,
  sameAsShipping,
  setSameAsShipping,
  onNext,
  onBack,
}: {
  payment: PaymentForm;
  updateField: (field: keyof PaymentForm, value: string) => void;
  errors: FormErrors;
  sameAsShipping: boolean;
  setSameAsShipping: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const cardType = detectCardType(payment.cardNumber);

  // Auto-format expiry
  const handleExpiryChange = (v: string) => {
    let cleaned = v.replace(/[^\d]/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    updateField("expiry", cleaned);
  };

  return (
    <AnimateOnView delay={80} rootMargin="-80px">
      <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
            <CreditCard size={14} className="text-sage" />
          </div>
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">Payment</h2>
        </div>

        <div className="space-y-5">
          {/* Card brand logos */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-5 rounded bg-red-500/90 flex items-center justify-center text-[7px] font-bold text-white">MC</div>
              <div className="w-8 h-5 rounded bg-blue-600/90 flex items-center justify-center text-[7px] font-bold text-white">VI</div>
              <div className="w-8 h-5 rounded bg-yellow-600/90 flex items-center justify-center text-[7px] font-bold text-white">AE</div>
              <div className="w-8 h-5 rounded bg-gray-700/90 flex items-center justify-center text-[7px] font-bold text-white">DS</div>
            </div>
            {cardType && (
              <span className="text-[11px] text-sage font-medium">{cardType}</span>
            )}
          </div>

          {/* Card number */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={formatCardNumber(payment.cardNumber)}
                onChange={(e) => updateField("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className={`w-full px-4 py-2.5 text-sm bg-cream rounded-xl border transition-all duration-300 outline-none placeholder:text-espresso-muted/30 focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 font-mono tracking-wider ${
                  errors.cardNumber ? "border-red-300 focus:border-red-300 focus:ring-red-100" : "border-espresso/10 hover:border-espresso/20"
                }`}
              />
              {payment.cardNumber && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-medium text-espresso-muted/40">
                  {detectCardType(payment.cardNumber) || "Card"}
                </span>
              )}
            </div>
            {errors.cardNumber && <p className="text-[11px] text-red-400 font-medium">{errors.cardNumber}</p>}
          </div>

          {/* Cardholder name */}
          <InputField label="Cardholder Name" value={payment.cardName} onChange={(v) => updateField("cardName", v)} error={errors.cardName} placeholder="Name on card" />

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">Expiry</label>
              <input
                type="text"
                value={payment.expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM / YY"
                maxLength={5}
                className={`w-full px-4 py-2.5 text-sm bg-cream rounded-xl border transition-all duration-300 outline-none placeholder:text-espresso-muted/30 focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 font-mono ${
                  errors.expiry ? "border-red-300 focus:border-red-300 focus:ring-red-100" : "border-espresso/10 hover:border-espresso/20"
                }`}
              />
              {errors.expiry && <p className="text-[11px] text-red-400 font-medium">{errors.expiry}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">CVV</label>
              <input
                type="text"
                value={payment.cvv}
                onChange={(e) => updateField("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                className={`w-full px-4 py-2.5 text-sm bg-cream rounded-xl border transition-all duration-300 outline-none placeholder:text-espresso-muted/30 focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 font-mono ${
                  errors.cvv ? "border-red-300 focus:border-red-300 focus:ring-red-100" : "border-espresso/10 hover:border-espresso/20"
                }`}
              />
              {errors.cvv && <p className="text-[11px] text-red-400 font-medium">{errors.cvv}</p>}
            </div>
          </div>

          {/* Security note */}
          <p className="text-[11px] text-espresso-muted/50 flex items-center gap-1.5">
            <Lock size={10} />
            Your payment info is securely encrypted. This is a demo — no real charges will be made.
          </p>

          {/* Billing same as shipping */}
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="same-address" checked={sameAsShipping}
              onChange={() => setSameAsShipping(!sameAsShipping)}
              className="w-4 h-4 rounded border-espresso/20 text-espresso focus:ring-espresso/20 accent-espresso" />
            <label htmlFor="same-address" className="text-xs text-espresso-muted/80 cursor-pointer select-none">Billing address same as shipping</label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-espresso/5 flex items-center justify-between">
          <button onClick={onBack}
            className="text-xs font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 flex items-center gap-1.5">
            <ArrowLeft size={12} /> Back to Shipping
          </button>
          <button onClick={onNext}
            className="group rounded-full bg-espresso px-8 py-3 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-2">
            Review Order
            <ArrowLeft size={14} className="rotate-180 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </AnimateOnView>
  );
}

// ── Step 3: Review ────────────────────────────────────────

function ReviewStep({
  checkoutCart,
  shipping,
  payment,
  promoInput,
  setPromoInput,
  applyPromo,
  appliedPromo,
  removePromo,
  promoError,
  subtotal,
  subtotalAfterDiscount,
  shippingCost,
  tax,
  total,
  submitting,
  formatPrice,
  onPlaceOrder,
  onBack,
}: {
  checkoutCart: CheckoutCart;
  shipping: ShippingForm;
  payment: PaymentForm;
  promoInput: string;
  setPromoInput: (v: string) => void;
  applyPromo: () => void;
  appliedPromo: PromoCode | null;
  removePromo: () => void;
  promoError: string;
  subtotal: number;
  subtotalAfterDiscount: number;
  shippingCost: number;
  tax: number;
  total: number;
  submitting: boolean;
  formatPrice: (v: number) => string;
  onPlaceOrder: () => void;
  onBack: () => void;
}) {
  const cardType = detectCardType(payment.cardNumber);
  const cardDigits = payment.cardNumber.replace(/\D/g, "");

  return (
    <div className="space-y-6">
      {/* Shipping summary */}
      <AnimateOnView delay={80} rootMargin="-80px">
        <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-sage" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">Shipping To</h2>
            </div>
            <button onClick={onBack}
              className="text-[10px] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 flex items-center gap-1">
              <ArrowLeft size={10} /> Edit
            </button>
          </div>
          <div className="text-sm text-espresso-muted leading-relaxed">
            <p className="font-medium text-espresso">{shipping.firstName} {shipping.lastName}</p>
            <p>{shipping.address1}</p>
            {shipping.address2 && <p>{shipping.address2}</p>}
            <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
            <p className="mt-1 text-xs text-espresso-muted/60">{shipping.email}</p>
          </div>
        </div>
      </AnimateOnView>

      {/* Payment summary */}
      <AnimateOnView delay={120} rootMargin="-80px">
        <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-sage" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">Payment</h2>
            </div>
            <button onClick={onBack}
              className="text-[10px] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 flex items-center gap-1">
              <ArrowLeft size={10} /> Edit
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-md bg-sage/10 flex items-center justify-center text-[8px] font-bold text-sage">****</div>
            <div className="text-sm">
              <p className="font-medium text-espresso">
                {cardType || "Card"} ending in {cardDigits.slice(-4) || "0000"}
              </p>
              <p className="text-xs text-espresso-muted/60">
                Expires {payment.expiry || "MM/YY"} — {payment.cardName || "Cardholder Name"}
              </p>
            </div>
          </div>
        </div>
      </AnimateOnView>

      {/* Promo code */}
      <AnimateOnView delay={160} rootMargin="-80px">
        <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso mb-4">Promo Code</h2>

          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-xl bg-sage/10 border border-sage/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-sage" />
                <span className="text-xs font-medium text-sage">{appliedPromo.label}</span>
              </div>
              <button onClick={removePromo}
                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/50 transition-colors duration-300">
                <X size={12} className="text-sage" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                placeholder="Enter promo code (e.g. WELCOME10)"
                className="flex-1 px-4 py-2.5 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300 font-mono text-xs"
              />
              <button onClick={applyPromo}
                disabled={!promoInput.trim()}
                className="rounded-xl bg-espresso px-5 py-2.5 text-xs font-medium text-cream hover:bg-espresso-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]">
                Apply
              </button>
            </div>
          )}

          {promoError && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-2">
              <AlertCircle size={10} /> {promoError}
            </p>
          )}
        </div>
      </AnimateOnView>

      {/* Place order */}
      <AnimateOnView delay={200} rootMargin="-80px">
        <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
          <div className="space-y-3 text-sm mb-6 pb-6 border-b border-espresso/5">
            <SummaryRow label="Subtotal" value={subtotal} formatPrice={formatPrice} />
            {appliedPromo && appliedPromo.type !== "freeshipping" && (
              <div className="flex items-center justify-between text-sage">
                <span className="text-xs flex items-center gap-1"><Percent size={10} /> {appliedPromo.label}</span>
                <span className="text-xs font-medium tabular-nums">-{formatPrice(subtotal - subtotalAfterDiscount)}</span>
              </div>
            )}
            <SummaryRow label="Shipping" value={shippingCost} formatPrice={formatPrice} />
            <SummaryRow label="Tax" value={tax} note="8.75%" formatPrice={formatPrice} />
          </div>

          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-semibold text-espresso">Total</span>
            <span className="text-xl font-semibold tracking-tight text-espresso tabular-nums">{formatPrice(total)}</span>
          </div>

          <button onClick={onPlaceOrder} disabled={submitting}
            className="group w-full rounded-full bg-espresso py-3.5 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-cream/30 border-t-cream animate-spin" /> Processing…</>             ) : (
              <><Lock size={14} /> Place Order — {formatPrice(total)}</>
            )}
          </button>

          <p className="text-[11px] text-espresso-muted/50 text-center mt-4 flex items-center justify-center gap-1.5">
            <Lock size={10} /> Your order is protected by SSL encryption
          </p>

          <div className="mt-4 pt-4 border-t border-espresso/5 flex justify-center">
            <button onClick={onBack}
              className="text-xs text-espresso-muted/60 hover:text-espresso transition-colors duration-300 flex items-center gap-1.5">
              <ArrowLeft size={12} /> Back to Payment
            </button>
          </div>
        </div>
      </AnimateOnView>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function SummaryRow({ label, value, note, formatPrice }: { label: string; value: number; note?: string; formatPrice?: (v: number) => string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-espresso-muted/70 flex items-center gap-1">
        {label}
        {note && <span className="text-[10px] text-espresso-muted/40">({note})</span>}
      </span>
      <span className="font-medium text-espresso tabular-nums">
        {value === 0 ? <span className="text-sage font-semibold">FREE</span> : (formatPrice ? formatPrice(value) : `$${value.toFixed(2)}`)}
      </span>
    </div>
  );
}

function InputField({
  label, value, onChange, error, placeholder, type = "text", disabled = false,
}: {
  label: string; value: string; onChange: (val: string) => void; error?: string; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={`w-full px-4 py-2.5 text-sm bg-cream rounded-xl border transition-all duration-300 outline-none placeholder:text-espresso-muted/30 focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 ${
          error ? "border-red-300 focus:border-red-300 focus:ring-red-100" : "border-espresso/10 hover:border-espresso/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} />
      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, error, options, placeholder,
}: {
  label: string; value: string; onChange: (val: string) => void; error?: string; options: string[]; placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none px-4 py-2.5 text-sm bg-cream rounded-xl border transition-all duration-300 outline-none pr-10 cursor-pointer ${
            value ? "text-espresso" : "text-espresso-muted/30"
          } ${error ? "border-red-300 focus:border-red-300 focus:ring-red-100" : "border-espresso/10 hover:border-espresso/20 focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5"}`}>
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (<option key={opt} value={opt} className="text-espresso">{opt}</option>))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted/40 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}
