"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, AlertTriangle, Loader2, Search, Edit3, Check, X } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  stock: number;
  image: string;
  price: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  totalVariantStock: number;
  variantCount: number;
  purchases: number;
}

interface Summary {
  total: number;
  lowStock: number;
  outOfStock: number;
  threshold: number;
}

export default function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === "low" ? "?lowStock=true&threshold=10" : "";
      const res = await fetch(`/api/admin/inventory${params}`);
      const data = await res.json();
      if (data.products) setItems(data.products);
      if (data.summary) setSummary(data.summary);
    } catch {
      console.warn("Failed to fetch inventory");
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateStock = async (productId: number) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) return;
    setSaving(true);
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock: newStock }),
      });
      setEditingId(null);
      fetchInventory();
    } catch {
      console.warn("Failed to update stock");
    }
    setSaving(false);
  };

  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 p-4">
            <div className="text-[9px] uppercase tracking-wider text-espresso-muted/40 mb-1">Total Products</div>
            <div className="text-xl font-semibold text-espresso dark:text-cream tabular-nums">{summary.total}</div>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 p-4">
            <div className="text-[9px] uppercase tracking-wider text-espresso-muted/40 mb-1">Low Stock</div>
            <div className="text-xl font-semibold text-amber-600 tabular-nums">{summary.lowStock}</div>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 p-4">
            <div className="text-[9px] uppercase tracking-wider text-espresso-muted/40 mb-1">Out of Stock</div>
            <div className="text-xl font-semibold text-red-500 tabular-nums">{summary.outOfStock}</div>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 p-4">
            <div className="text-[9px] uppercase tracking-wider text-espresso-muted/40 mb-1">Threshold</div>
            <div className="text-xl font-semibold text-espresso dark:text-cream tabular-nums">{summary.threshold}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-muted/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 text-espresso dark:text-cream placeholder:text-espresso-muted/30 outline-none focus:border-espresso/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-0.5 bg-espresso/5 dark:bg-cream/5 rounded-xl">
          {(["all", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[10px] text-[10px] font-medium uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-white dark:bg-white/10 text-espresso dark:text-cream shadow-sm"
                  : "text-espresso-muted/50 hover:text-espresso"
              }`}
            >
              {f === "all" ? "All" : "Low Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-espresso/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={24} className="mx-auto text-espresso/20 mb-3" />
            <p className="text-sm text-espresso-muted/60">No products found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-cream/5">
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Product</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Price</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Stock</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Variant Stock</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Purchases</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5 dark:divide-cream/5">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded-lg bg-espresso/5 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-espresso dark:text-cream">{item.name}</span>
                        <span className="text-[9px] text-espresso-muted/40 ml-2">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-[11px] font-mono text-espresso dark:text-cream tabular-nums">
                    ${item.price}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          min={0}
                          className="w-16 px-2 py-1 text-[11px] font-mono bg-cream dark:bg-espresso/30 rounded-lg border border-espresso/10 text-espresso dark:text-cream outline-none text-right"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateStock(item.id)}
                          disabled={saving}
                          className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-[11px] font-mono font-semibold tabular-nums ${
                            item.isOutOfStock
                              ? "text-red-500"
                              : item.isLowStock
                                ? "text-amber-600"
                                : "text-espresso dark:text-cream"
                          }`}
                        >
                          {item.stock}
                        </span>
                        {item.isLowStock && (
                          <AlertTriangle size={10} className={item.isOutOfStock ? "text-red-400" : "text-amber-400"} />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-[11px] font-mono text-espresso-muted/50 tabular-nums">
                    {item.totalVariantStock}
                  </td>
                  <td className="px-5 py-3 text-right text-[11px] font-mono text-espresso-muted/50 tabular-nums">
                    {item.purchases}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(String(item.stock));
                      }}
                      className="p-1.5 rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                    >
                      <Edit3 size={11} className="text-espresso-muted/50" />
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
