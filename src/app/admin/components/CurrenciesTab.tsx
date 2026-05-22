"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Plus, Loader2, Pencil, X, Check, RefreshCw } from "lucide-react";

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number;
  updatedAt: string;
}

export default function CurrenciesTab() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: "", name: "", symbol: "", rateToUSD: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/currencies");
      const data = await res.json();
      if (data.currencies) setCurrencies(data.currencies);
    } catch {
      console.warn("Failed to fetch currencies");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleEdit = (c: Currency) => {
    setForm({ code: c.code, name: c.name, symbol: c.symbol, rateToUSD: String(c.rateToUSD) });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setForm({ code: "", name: "", symbol: "", rateToUSD: "" });
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const rate = parseFloat(form.rateToUSD);
    if (isNaN(rate) || rate <= 0) {
      setError("Rate must be a positive number");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          symbol: form.symbol,
          rateToUSD: rate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save currency");
        setSaving(false);
        return;
      }
      setShowForm(false);
      fetchCurrencies();
    } catch {
      setError("Failed to save currency");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-espresso-muted/50">
          <DollarSign size={12} />
          {currencies.length} currencies
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCurrencies}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-espresso/10 transition-all"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso text-cream hover:bg-espresso-light transition-all"
          >
            <Plus size={11} />
            Add Currency
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-espresso dark:text-cream">
              {editingId ? "Edit Currency" : "Add Currency"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-espresso/5">
              <X size={14} className="text-espresso-muted/50" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="EUR"
                required
                maxLength={3}
                className="w-full px-3 py-2 text-xs font-mono bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Euro"
                required
                className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Symbol</label>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                placeholder="€"
                required
                className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Rate to USD</label>
              <input
                type="number"
                value={form.rateToUSD}
                onChange={(e) => setForm({ ...form, rateToUSD: e.target.value })}
                placeholder="0.92"
                required
                step="0.0001"
                min="0.0001"
                className="w-full px-3 py-2 text-xs font-mono bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
              />
            </div>
            {error && <p className="text-[11px] text-red-400 sm:col-span-2 lg:col-span-4">{error}</p>}
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso text-cream hover:bg-espresso-light disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : editingId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-espresso/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Currency table */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-espresso/30" />
          </div>
        ) : currencies.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign size={24} className="mx-auto text-espresso/20 mb-3" />
            <p className="text-sm text-espresso-muted/60">No currencies configured</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-cream/5">
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Code</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Name</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Symbol</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Rate to USD</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Updated</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5 dark:divide-cream/5">
              {currencies.map((c) => (
                <tr key={c.id} className="hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-mono font-bold text-espresso dark:text-cream">{c.code}</span>
                  </td>
                  <td className="px-5 py-3 text-[11px] text-espresso dark:text-cream">{c.name}</td>
                  <td className="px-5 py-3 text-[13px] text-espresso dark:text-cream">{c.symbol}</td>
                  <td className="px-5 py-3 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                    {c.rateToUSD.toFixed(4)}
                  </td>
                  <td className="px-5 py-3 text-right text-[10px] font-mono text-espresso-muted/50">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                    >
                      <Pencil size={11} className="text-espresso-muted/50" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
