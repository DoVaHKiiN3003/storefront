"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Review, ProductReviews } from "../lib/types";
import {
  loadReviews,
  persistReviews,
  generateReviewId,
} from "../lib/reviews";

interface ReviewContextValue {
  getReviews: (productId: number) => Review[];
  addReview: (review: Omit<Review, "id" | "date">) => void;
  reviews: ProductReviews;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  // Initialize immediately from localStorage to avoid a flash of empty reviews
  const [reviews, setReviews] = useState<ProductReviews>(() => {
    if (typeof window === "undefined") return {};
    return loadReviews();
  });

  const getReviews = useCallback(
    (productId: number): Review[] => {
      return reviews[productId] || [];
    },
    [reviews]
  );

  const addReview = useCallback(
    (input: Omit<Review, "id" | "date">) => {
      const newReview: Review = {
        ...input,
        id: generateReviewId(),
        date: new Date().toISOString(),
      };

      setReviews((prev) => {
        const existing = prev[input.productId] || [];
        const updated = {
          ...prev,
          [input.productId]: [...existing, newReview],
        };
        persistReviews(updated);
        return updated;
      });
    },
    []
  );

  return (
    <ReviewContext.Provider value={{ getReviews, addReview, reviews }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return ctx;
}
