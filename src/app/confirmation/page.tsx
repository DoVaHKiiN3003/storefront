"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Package,
  Truck,
  Shield,
  Mail,
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
  Pencil,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import AnimateOnView from "../components/AnimateOnView";
import { products } from "../lib/products";
import type {
  OrderData,
  OrderItem,
  ShippingAddress,
  PaymentInfo,
} from "../lib/types";

const DEFAULT_SHIPPING: ShippingAddress = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

const DEFAULT_PAYMENT: PaymentInfo = {
  cardNumber: "4242424242424829",
  cardName: "Alex Chen",
  expiry: "08/27",
  cvv: "***",
};

// ── Helpers ──────────────────────────────────────────────

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "#";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getEstimatedDelivery(): { min: string; max: string } {
  const now = new Date();
  const addBusinessDays = (days: number) => {
    const d = new Date(now);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  };
  const min = addBusinessDays(5);
  const max = addBusinessDays(9);
  return {
    min: min.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
    max: max.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
  };
}

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
  return "Card";
}

// ── Page ─────────────────────────────────────────────────

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [orderNumber] = useState(generateOrderNumber);
  const [loaded, setLoaded] = useState(false);

  // Editable state
  const [editingShipping, setEditingShipping] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [shippingDraft, setShippingDraft] = useState<ShippingAddress>(DEFAULT_SHIPPING);
  const [paymentDraft, setPaymentDraft] = useState<PaymentInfo>(DEFAULT_PAYMENT);

  // Email sending state
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed" | "skipped"
  >("idle");

  // Load order data from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("storefront-order");
      if (stored) {
        const parsed = JSON.parse(stored) as OrderData;
        setOrder(parsed);

        // Initialize drafts from real data
        if (parsed.shippingAddress) {
          setShippingDraft(parsed.shippingAddress);
        }
        // payment info is always seeded with defaults (not stored during checkout)
        sessionStorage.removeItem("storefront-order");
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Send confirmation email after order loads
  useEffect(() => {
    if (!order) return;

    const recipientEmail = order.email;
    if (!recipientEmail) {
      setEmailStatus("skipped");
      return;
    }

    let cancelled = false;

    async function sendEmail() {
      setEmailStatus("sending");
      try {
        const res = await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order,
            orderNumber,
            email: recipientEmail,
          }),
        });

        if (cancelled) return;

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to send confirmation email:", errData);
          setEmailStatus("failed");
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.skipped) {
          setEmailStatus("skipped");
        } else {
          setEmailStatus("sent");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to send confirmation email:", err);
          setEmailStatus("failed");
        }
      }
    }

    sendEmail();

    return () => {
      cancelled = true;
    };
  }, [order, orderNumber]);

  const delivery = getEstimatedDelivery();
  const placedDate = order
    ? new Date(order.timestamp).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // ── Inline edit handlers ─────────────────────────────

  const handleSaveShipping = useCallback(() => {
    if (!order) return;
    setOrder({ ...order, shippingAddress: shippingDraft });
    setEditingShipping(false);
  }, [order, shippingDraft]);

  const handleCancelShipping = useCallback(() => {
    if (!order?.shippingAddress) return;
    setShippingDraft(order.shippingAddress);
    setEditingShipping(false);
  }, [order]);

  const handleSavePayment = useCallback(() => {
    setEditingPayment(false);
  }, []);

  const handleCancelPayment = useCallback(() => {
    setEditingPayment(false);
  }, []);

  // ── Empty state (no order data) ──────────────────────────

  if (loaded && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-sage/10 flex items-center justify-center">
            <ShoppingBag size={28} className="text-sage" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-espresso">
              No order found
            </h1>
            <p className="text-sm text-espresso-muted/70 mt-2 leading-relaxed">
              It looks like you haven&apos;t placed an order yet. Browse our
              collection and find something you love.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300 active:scale-[0.98]"
          >
            <ShoppingBag size={14} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────

  if (!loaded || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-sage/30 border-t-sage animate-spin" />
      </div>
    );
  }

  const address = order.shippingAddress || DEFAULT_SHIPPING;
  const email = order.email || "alex@example.com";

  // ── Content ──────────────────────────────────────────────

  return (
    <div className="pt-28 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div className="max-w-4xl mx-auto">
        {/* ── Success Header ──────────────────────────────── */}
        <AnimateOnView delay={0} rootMargin="-80px">
          <div className="text-center sm:text-left space-y-6 pb-12 border-b border-espresso/10 mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-16 h-16 mx-auto sm:mx-0 rounded-full bg-sage/10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center">
                  <Check size={20} strokeWidth={3} className="text-cream" />
                </div>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.2em] font-medium text-sage mb-2">
                  Order Confirmed
                </span>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">
                  Thank you for your order
                </h1>
                <p className="text-sm text-espresso-muted/70 mt-2">
                  Your order{" "}
                  <span className="font-mono text-espresso font-medium">
                    {orderNumber}
                  </span>{" "}
                  has been placed successfully.
                </p>
              </div>
            </div>

            {/* Confirmation sent */}
            <EmailStatusBadge status={emailStatus} email={email} />
          </div>
        </AnimateOnView>

        {/* ── Delivery Estimate ──────────────────────────── */}
        <AnimateOnView delay={80} rootMargin="-80px">
          <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
                <Truck size={18} className="text-sage" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-espresso mb-1">
                  Estimated Delivery
                </h2>
                <p className="text-lg font-semibold tracking-tight text-espresso">
                  {delivery.min} – {delivery.max}
                </p>
                <p className="text-xs text-espresso-muted/60 mt-1">
                  Free shipping on orders over $200
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-sage font-medium">
                <Clock size={12} />
                Order placed {placedDate}
              </div>
            </div>
          </div>
        </AnimateOnView>

        {/* ── Two-column layout ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Items — takes 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            <AnimateOnView delay={120} rootMargin="-80px">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">
                  Items ({order.items.length})
                </h2>
              </div>
            </AnimateOnView>

            <div className="space-y-4">
              {order.items.map((item, i) => (
                <AnimateOnView key={item.id} delay={40 * i} rootMargin="-80px">
                  <div className="flex gap-4 p-4 rounded-2xl bg-white border border-espresso/5 transition-all duration-300 hover:border-espresso/10 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
                    {/* Image */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-espresso/5 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col min-w-0 justify-between">
                      <div>
                        <Link
                          href={`/products/${
                            products.find((p) => p.id === item.id)?.slug ?? "#"
                          }`}
                          className="text-sm font-semibold text-espresso hover:text-espresso-muted transition-colors duration-300"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-espresso-muted/60 mt-0.5">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-espresso-muted/50">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-espresso tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimateOnView>
              ))}
            </div>
          </div>

          {/* Sidebar — takes 2/5 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary */}
            <AnimateOnView delay={140} rootMargin="-80px">
              <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso pb-4 border-b border-espresso/5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <Row label="Subtotal" value={order.subtotal} />
                  <Row label="Shipping" value={order.shipping} />
                  <Row label="Tax" value={order.tax} />
                </div>

                <div className="pt-4 border-t border-espresso/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-espresso">Total</span>
                  <span className="text-xl font-semibold tracking-tight text-espresso tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </AnimateOnView>

            {/* Shipping Address — editable */}
            <AnimateOnView delay={180} rootMargin="-80px" direction="right">
              <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-sage" />
                    <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">
                      Shipping To
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      if (editingShipping) {
                        handleCancelShipping();
                      } else {
                        setShippingDraft(address);
                        setEditingShipping(true);
                        // Close payment editing if open
                        if (editingPayment) handleCancelPayment();
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-espresso-muted/60 hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
                  >
                    {editingShipping ? (
                      <>
                        <X size={12} /> Cancel
                      </>
                    ) : (
                      <>
                        <Pencil size={11} /> Edit
                      </>
                    )}
                  </button>
                </div>

                {editingShipping ? (
                  <div className="space-y-3">
                    <EditField
                      label="Full Name"
                      value={shippingDraft.name}
                      onChange={(v) =>
                        setShippingDraft((prev) => ({ ...prev, name: v }))
                      }
                    />
                    <EditField
                      label="Address Line 1"
                      value={shippingDraft.line1}
                      onChange={(v) =>
                        setShippingDraft((prev) => ({ ...prev, line1: v }))
                      }
                    />
                    <EditField
                      label="Address Line 2"
                      value={shippingDraft.line2}
                      onChange={(v) =>
                        setShippingDraft((prev) => ({ ...prev, line2: v }))
                      }
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <EditField
                        label="City"
                        value={shippingDraft.city}
                        onChange={(v) =>
                          setShippingDraft((prev) => ({ ...prev, city: v }))
                        }
                      />
                      <EditField
                        label="State"
                        value={shippingDraft.state}
                        onChange={(v) =>
                          setShippingDraft((prev) => ({ ...prev, state: v }))
                        }
                      />
                      <EditField
                        label="ZIP"
                        value={shippingDraft.zip}
                        onChange={(v) =>
                          setShippingDraft((prev) => ({ ...prev, zip: v }))
                        }
                      />
                    </div>
                    <button
                      onClick={handleSaveShipping}
                      className="w-full mt-2 rounded-full bg-espresso py-2.5 text-xs font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save size={13} />
                      Save Address
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-espresso-muted leading-relaxed">
                    <p className="font-medium text-espresso">{address.name}</p>
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                )}
              </div>
            </AnimateOnView>

            {/* Payment Method — editable */}
            <AnimateOnView delay={200} rootMargin="-80px" direction="right">
              <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-espresso">
                    Payment
                  </h2>
                  <button
                    onClick={() => {
                      if (editingPayment) {
                        handleCancelPayment();
                      } else {
                        setPaymentDraft({
                          cardNumber: paymentDraft.cardNumber,
                          cardName: address.name,
                          expiry: paymentDraft.expiry,
                          cvv: paymentDraft.cvv,
                        });
                        setEditingPayment(true);
                        // Close shipping editing if open
                        if (editingShipping) handleCancelShipping();
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-espresso-muted/60 hover:text-espresso hover:bg-espresso/5 transition-all duration-300"
                  >
                    {editingPayment ? (
                      <>
                        <X size={12} /> Cancel
                      </>
                    ) : (
                      <>
                        <Pencil size={11} /> Edit
                      </>
                    )}
                  </button>
                </div>

                {editingPayment ? (
                  <div className="space-y-3">
                    <EditField
                      label="Card Number"
                      value={formatCardNumber(paymentDraft.cardNumber)}
                      onChange={(v) =>
                        setPaymentDraft((prev) => ({
                          ...prev,
                          cardNumber: v.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                    <EditField
                      label="Cardholder Name"
                      value={paymentDraft.cardName}
                      onChange={(v) =>
                        setPaymentDraft((prev) => ({ ...prev, cardName: v }))
                      }
                      placeholder="Name on card"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <EditField
                        label="Expiry"
                        value={paymentDraft.expiry}
                        onChange={(v) => {
                          // Auto-format MM/YY
                          let cleaned = v.replace(/[^\d]/g, "").slice(0, 4);
                          if (cleaned.length >= 3) {
                            cleaned =
                              cleaned.slice(0, 2) + "/" + cleaned.slice(2);
                          }
                          setPaymentDraft((prev) => ({
                            ...prev,
                            expiry: cleaned,
                          }));
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      <EditField
                        label="CVV"
                        value={paymentDraft.cvv}
                        onChange={(v) => {
                          const cleaned = v.replace(/\D/g, "").slice(0, 4);
                          setPaymentDraft((prev) => ({
                            ...prev,
                            cvv: cleaned,
                          }));
                        }}
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                    <button
                      onClick={handleSavePayment}
                      className="w-full mt-2 rounded-full bg-espresso py-2.5 text-xs font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save size={13} />
                      Save Payment
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded-md bg-sage/10 flex items-center justify-center text-[8px] font-bold tracking-tight text-sage">
                      ****
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-espresso">
                        {detectCardType(paymentDraft.cardNumber)} ending in{" "}
                        {paymentDraft.cardNumber.replace(/\D/g, "").slice(-4) ||
                          "4829"}
                      </p>
                      <p className="text-xs text-espresso-muted/60">
                        Expires {paymentDraft.expiry || "08/27"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnView>

            {/* Trust Signals */}
            <AnimateOnView delay={220} rootMargin="-80px" direction="right">
              <div className="space-y-3">
                <TrustPill icon={Package} text="Free returns within 30 days" />
                <TrustPill icon={Shield} text="Secure SSL encrypted checkout" />
                <TrustPill icon={Mail} text="Order confirmation sent by email" />
              </div>
            </AnimateOnView>
          </div>
        </div>

        {/* ── Continue Shopping ──────────────────────────── */}
        <AnimateOnView delay={300} rootMargin="-80px">
          <div className="mt-16 sm:mt-20 pt-10 border-t border-espresso/10 text-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-espresso px-8 py-4 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              Continue Shopping
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <p className="text-xs text-espresso-muted/50 mt-4">
              Need help?{" "}
              <button className="underline hover:text-espresso transition-colors duration-300">
                Contact our support team
              </button>
            </p>
          </div>
        </AnimateOnView>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-espresso-muted/70">{label}</span>
      <span className="font-medium text-espresso tabular-nums">
        {value === 0 ? (
          <span className="text-sage font-semibold">FREE</span>
        ) : (
          `$${value.toFixed(2)}`
        )}
      </span>
    </div>
  );
}

function TrustPill({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-espresso/5">
      <Icon size={14} className="text-sage shrink-0" />
      <span className="text-xs text-espresso-muted/80">{text}</span>
    </div>
  );
}

// ── Email Status Badge ─────────────────────────────────

function EmailStatusBadge({
  status,
  email,
}: {
  status: "idle" | "sending" | "sent" | "failed" | "skipped";
  email: string;
}) {
  switch (status) {
    case "sending":
      return (
        <div className="flex items-center gap-2 text-xs text-espresso-muted/60">
          <Mail size={12} className="text-sage animate-pulse" />
          <span>
            Sending confirmation to{" "}
            <span className="text-espresso font-medium">{email}</span>
            <span className="inline-flex gap-0.5 ml-1">
              <span className="w-0.5 h-0.5 rounded-full bg-espresso-muted/40 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span className="w-0.5 h-0.5 rounded-full bg-espresso-muted/40 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span className="w-0.5 h-0.5 rounded-full bg-espresso-muted/40 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </span>
        </div>
      );

    case "sent":
      return (
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle size={12} className="text-sage" />
          <span className="text-espresso-muted/70">
            Confirmation sent to{" "}
            <span className="text-espresso font-medium">{email}</span>
          </span>
        </div>
      );

    case "failed":
      return (
        <div className="flex items-center gap-2 text-xs">
          <AlertCircle size={12} className="text-amber-500" />
          <span className="text-espresso-muted/70">
            Couldn&apos;t send confirmation email.{" "}
            <button
              onClick={() => {
                // Re-trigger by re-fetching
                window.location.reload();
              }}
              className="underline hover:text-espresso transition-colors"
            >
              Try again
            </button>
          </span>
        </div>
      );

    case "skipped":
      return (
        <div className="flex items-center gap-2 text-xs text-espresso-muted/50">
          <Mail size={12} />
          <span>
            Confirmation available for{" "}
            <span className="text-espresso font-medium">{email}</span>
            {" "}&mdash; email delivery unavailable
          </span>
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-2 text-xs text-espresso-muted/60">
          <Mail size={12} />
          <span>
            A confirmation will be sent to{" "}
            <span className="text-espresso font-medium">{email}</span>
          </span>
        </div>
      );
  }
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] uppercase tracking-[0.1em] font-medium text-espresso-muted/60">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3.5 py-2 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300"
      />
    </div>
  );
}
