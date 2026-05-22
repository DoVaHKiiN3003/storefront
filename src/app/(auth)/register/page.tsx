"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import AnimateOnView from "../../components/AnimateOnView";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("storefront-session", JSON.stringify({
        token: data.sessionToken,
        user: data.user,
      }));
      router.push("/");
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-24">
      <div className="w-full max-w-md">
        <AnimateOnView delay={0}>
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 mb-8"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            Back
          </button>
        </AnimateOnView>

        <AnimateOnView delay={40}>
          <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-espresso/5 flex items-center justify-center mb-4">
                <UserPlus size={20} className="text-espresso/60" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-espresso">Create an account</h1>
              <p className="text-sm text-espresso-muted/60 mt-1">Join STORE for a faster checkout</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-[0.1em] font-medium text-espresso-muted/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted/40 hover:text-espresso-muted/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-red-400 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-espresso py-3 text-sm font-medium text-cream hover:bg-espresso-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-xs text-espresso-muted/60 text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-espresso font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </AnimateOnView>
      </div>
    </div>
  );
}
