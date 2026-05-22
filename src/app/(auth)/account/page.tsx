"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  LogOut,
  User,
  Loader2,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import AnimateOnView from "../../components/AnimateOnView";

interface AccountUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

interface Order {
  id: number;
  email: string;
  total: number;
  status: string;
  shipName: string;
  shipCity: string;
  shipState: string;
  createdAt: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("storefront-session");
      if (!stored) {
        router.push("/login");
        return;
      }
      const { user: u } = JSON.parse(stored);
      setUser(u);
      fetchOrders();
    } catch {
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  const fetchOrders = async () => {
    try {
      const stored = localStorage.getItem("storefront-session");
      if (!stored) return;
      const { token } = JSON.parse(stored);
      const res = await fetch("/api/orders?limit=20&my=true", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      // silent
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("storefront-session");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-espresso/40" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-6xl mx-auto">
      <AnimateOnView delay={0}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-espresso text-cream flex items-center justify-center">
                <User size={16} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-espresso">
                My Account
              </h1>
            </div>
            <p className="text-sm text-espresso-muted/60 mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </AnimateOnView>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <AnimateOnView delay={40}>
          <div className="rounded-2xl bg-white border border-espresso/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={16} className="text-espresso/40" />
              <h2 className="text-xs uppercase tracking-[0.15em] font-semibold text-espresso">
                Profile
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-espresso font-medium">{user.name}</p>
              <p className="text-espresso-muted/60">{user.email}</p>
              <p className="text-xs text-espresso-muted/40">
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </AnimateOnView>

        <AnimateOnView delay={80}>
          <div className="rounded-2xl bg-white border border-espresso/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package size={16} className="text-espresso/40" />
              <h2 className="text-xs uppercase tracking-[0.15em] font-semibold text-espresso">
                Orders
              </h2>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-espresso tabular-nums">
              {orders.length}
            </div>
            <p className="text-xs text-espresso-muted/60 mt-1">Total orders placed</p>
          </div>
        </AnimateOnView>

        <AnimateOnView delay={120}>
          <div className="rounded-2xl bg-white border border-espresso/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={16} className="text-espresso/40" />
              <h2 className="text-xs uppercase tracking-[0.15em] font-semibold text-espresso">
                Quick Links
              </h2>
            </div>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-espresso-muted/70 hover:text-espresso transition-colors">
                Continue Shopping
              </Link>
              <Link href="/collections" className="block text-sm text-espresso-muted/70 hover:text-espresso transition-colors">
                Browse Collections
              </Link>
            </div>
          </div>
        </AnimateOnView>
      </div>

      {/* Order History */}
      <AnimateOnView delay={160}>
        <div className="rounded-[1.5rem] bg-white border border-espresso/5 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-espresso/5 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.15em] font-semibold text-espresso">
              Order History
            </h2>
            <span className="text-[10px] text-espresso-muted/40 tabular-nums">
              {orders.length} orders
            </span>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-espresso/5">
              {orders.map((order) => (
                <div key={order.id} className="px-6 sm:px-8 py-4 hover:bg-espresso/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-medium text-espresso tabular-nums">
                        #{order.id.toString().padStart(4, "0")}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                          STATUS_STYLES[order.status] ?? "bg-espresso/5 text-espresso-muted/50"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-espresso tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-espresso-muted/50">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {order.shipCity}, {order.shipState}
                    </span>
                    <span>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="w-10 h-12 rounded-lg bg-espresso/5 overflow-hidden shrink-0"
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-10 h-12 rounded-lg bg-espresso/5 flex items-center justify-center text-[9px] font-medium text-espresso-muted/50">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 sm:px-8 py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-espresso/5 flex items-center justify-center mb-3">
                <Package size={20} className="text-espresso/20" />
              </div>
              <p className="text-sm text-espresso-muted/60">No orders yet</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-espresso mt-2 hover:underline"
              >
                Start Shopping <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </AnimateOnView>
    </div>
  );
}
