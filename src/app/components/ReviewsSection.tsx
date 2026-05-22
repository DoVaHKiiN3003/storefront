"use client";

import { useState } from "react";
import { useReviews } from "../lib/ReviewContext";
import { getAverageRating, getRatingDistribution } from "../lib/reviews";
import StarRating, { InteractiveStarInput } from "./StarRating";
import { MessageSquare, Star, Check } from "lucide-react";
import AnimateOnView from "./AnimateOnView";

export default function ReviewsSection({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const { getReviews, addReview } = useReviews();
  const reviews = getReviews(productId);
  const avgRating = getAverageRating(reviews);
  const distribution = getRatingDistribution(reviews);
  const totalReviews = reviews.length;

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (formRating === 0) errors.rating = "Please select a rating";
    if (!formName.trim()) errors.name = "Please enter your name";
    if (!formTitle.trim()) errors.title = "Please enter a title";
    if (!formComment.trim()) errors.comment = "Please write a review";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addReview({
      productId,
      name: formName.trim(),
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setFormRating(0);
      setFormName("");
      setFormTitle("");
      setFormComment("");
    }, 2500);
  };

  return (
    <AnimateOnView delay={200} rootMargin="-80px">
      <section className="mt-24 sm:mt-32 pt-16 border-t border-espresso/10">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-block rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-sage border border-sage/20 mb-4">
                Customer Reviews
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tighter text-espresso">
                What people are saying
              </h2>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setSubmitted(false);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-xs font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300"
            >
              <MessageSquare size={14} />
              Write a Review
            </button>
          </div>

          {/* Summary + Reviews grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left: Rating summary */}
            <div className="lg:col-span-1">
              <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 sticky top-32">
                {/* Big average */}
                <div className="text-center">
                  <span className="block text-5xl font-semibold tracking-tight text-espresso tabular-nums">
                    {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                  </span>
                  <div className="flex justify-center mt-2">
                    <StarRating
                      rating={avgRating}
                      size={18}
                      showValue={false}
                    />
                  </div>
                  <p className="text-xs text-espresso-muted/60 mt-2">
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* Distribution bars */}
                {totalReviews > 0 && (
                  <div className="mt-6 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = distribution[star] || 0;
                      const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-3 text-right text-espresso-muted/60 font-medium tabular-nums">
                            {star}
                          </span>
                          <Star
                            size={10}
                            className="text-espresso/30 shrink-0"
                          />
                          <div className="flex-1 h-1.5 rounded-full bg-espresso/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400/60 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-5 text-right text-espresso-muted/40 tabular-nums">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalReviews === 0 && (
                  <p className="text-xs text-center text-espresso-muted/50 mt-4">
                    Be the first to review this product
                  </p>
                )}
              </div>
            </div>

            {/* Right: Reviews + Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Review form */}
              {showForm && (
                <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8">
                  {submitted ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center">
                        <Check size={22} className="text-sage" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-espresso">
                          Review submitted!
                        </p>
                        <p className="text-xs text-espresso-muted/60 mt-1">
                          Thank you for reviewing {productName}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-espresso">
                        Write your review
                      </h3>

                      {/* Rating */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-[0.1em] font-medium text-espresso-muted/60">
                          Rating
                        </label>
                        <InteractiveStarInput
                          value={formRating}
                          onChange={setFormRating}
                        />
                        {formErrors.rating && (
                          <p className="text-[10px] text-red-400">
                            {formErrors.rating}
                          </p>
                        )}
                      </div>

                      {/* Name */}
                      <ReviewField
                        label="Name"
                        value={formName}
                        onChange={setFormName}
                        placeholder="Your name"
                        error={formErrors.name}
                      />

                      {/* Title */}
                      <ReviewField
                        label="Title"
                        value={formTitle}
                        onChange={setFormTitle}
                        placeholder="Summary of your review"
                        error={formErrors.title}
                      />

                      {/* Comment */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-[0.1em] font-medium text-espresso-muted/60">
                          Review
                        </label>
                        <textarea
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows={4}
                          className="w-full px-3.5 py-2.5 text-sm bg-cream rounded-xl border border-espresso/10 text-espresso placeholder:text-espresso-muted/30 outline-none focus:border-espresso/30 focus:ring-2 focus:ring-espresso/5 transition-all duration-300 resize-none"
                        />
                        {formErrors.comment && (
                          <p className="text-[10px] text-red-400">
                            {formErrors.comment}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          className="rounded-full bg-espresso px-6 py-2.5 text-xs font-medium text-cream hover:bg-espresso-light active:scale-[0.98] transition-all duration-300"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="text-xs text-espresso-muted/60 hover:text-espresso transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Review list */}
              {reviews.length > 0 ? (
                [...reviews]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((review, i) => (
                    <ReviewCard key={review.id} review={review} index={i} />
                  ))
              ) : (
                <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-espresso/5 flex items-center justify-center mb-3">
                    <MessageSquare
                      size={20}
                      className="text-espresso-muted/40"
                    />
                  </div>
                  <p className="text-sm text-espresso-muted/70">
                    No reviews yet. Be the first to share your experience.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}

// ── Review Card ──────────────────────────────────────────

function ReviewCard({
  review,
  index,
}: {
  review: {
    name: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
  };
  index: number;
}) {
  const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimateOnView delay={60 * index} rootMargin="-40px">
      <div className="rounded-[1.5rem] bg-white border border-espresso/5 p-6 sm:p-8 transition-all duration-300 hover:border-espresso/10 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size={14} />
              <span className="text-xs text-espresso-muted/50">
                {formattedDate}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-espresso mt-1.5">
              {review.title}
            </h4>
          </div>
          <span className="shrink-0 text-xs font-medium text-espresso-muted/60 bg-espresso/5 px-3 py-1 rounded-full">
            {review.name}
          </span>
        </div>
        <p className="text-sm text-espresso-muted leading-relaxed">
          {review.comment}
        </p>
      </div>
    </AnimateOnView>
  );
}

// ── Review Field ─────────────────────────────────────────

function ReviewField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
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
        className={`w-full px-3.5 py-2.5 text-sm bg-cream rounded-xl border text-espresso placeholder:text-espresso-muted/30 outline-none focus:ring-2 transition-all duration-300 ${
          error
            ? "border-red-200 focus:border-red-300 focus:ring-red/5"
            : "border-espresso/10 focus:border-espresso/30 focus:ring-espresso/5"
        }`}
      />
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
