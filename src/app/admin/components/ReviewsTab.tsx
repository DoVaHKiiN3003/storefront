"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare, Search, Filter } from "lucide-react";

interface ReviewItem {
  id: number;
  productId: number;
  name: string;
  email: string | null;
  rating: number;
  title: string;
  comment: string;
  status: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/reviews${params}`);
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
      if (data.total !== undefined) setTotal(data.total);
    } catch {
      console.warn("Failed to fetch reviews");
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdate = async (reviewId: number, status: string) => {
    setActionLoading(reviewId);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchReviews();
    } catch {
      console.warn("Failed to update review");
    }
    setActionLoading(null);
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Delete this review?")) return;
    setActionLoading(reviewId);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      fetchReviews();
    } catch {
      console.warn("Failed to delete review");
    }
    setActionLoading(null);
  };

  const filtered = search
    ? reviews.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.product.name.toLowerCase().includes(search.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const statusCounts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-muted/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-white/5 rounded-xl border border-espresso/5 dark:border-cream/10 text-espresso dark:text-cream placeholder:text-espresso-muted/30 outline-none focus:border-espresso/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-0.5 bg-espresso/5 dark:bg-cream/5 rounded-xl">
          {(["pending", "approved", "rejected", ""] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-[10px] text-[10px] font-medium uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-white dark:bg-white/10 text-espresso dark:text-cream shadow-sm"
                  : "text-espresso-muted/50 hover:text-espresso"
              }`}
            >
              {s || "All"}
              {s && statusCounts[s as keyof typeof statusCounts] > 0 && (
                <span className="ml-1.5 text-[9px] opacity-50">
                  {statusCounts[s as keyof typeof statusCounts]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-espresso/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={24} className="mx-auto text-espresso/20 mb-3" />
            <p className="text-sm text-espresso-muted/60">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-espresso/5 dark:divide-cream/5">
            {filtered.map((review) => (
              <div key={review.id} className="px-5 py-4 hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-espresso/10"}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-espresso dark:text-cream">{review.title}</span>
                    </div>
                    <p className="text-[10px] text-espresso-muted/70 mb-1 line-clamp-2">{review.comment}</p>
                    <div className="flex items-center gap-3 text-[9px] text-espresso-muted/40">
                      <span>by {review.name}</span>
                      {review.email && <span>{review.email}</span>}
                      <span>on {review.product.name}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdate(review.id, "approved")}
                          disabled={actionLoading === review.id}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
                          title="Approve"
                        >
                          {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        </button>
                        <button
                          onClick={() => handleUpdate(review.id, "rejected")}
                          disabled={actionLoading === review.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={12} />
                        </button>
                      </>
                    )}
                    {review.status === "approved" && (
                      <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        Approved
                      </span>
                    )}
                    {review.status === "rejected" && (
                      <span className="text-[9px] font-medium text-red-500 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20">
                        Rejected
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-300 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <p className="text-[10px] text-espresso-muted/40 text-center">
          Showing {filtered.length} of {total} reviews
        </p>
      )}
    </div>
  );
}
