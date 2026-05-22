"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  maxStars?: number;
}

export default function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  maxStars = 5,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayRating = interactive && hovered > 0 ? hovered : rating;

  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const filled = displayRating >= i;
    const half = !filled && displayRating >= i - 0.5;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onMouseEnter={() => interactive && setHovered(i)}
        onMouseLeave={() => interactive && setHovered(0)}
        onClick={() => {
          if (interactive && onChange) {
            onChange(i);
          }
        }}
        className={`relative inline-flex items-center justify-center ${
          interactive
            ? "cursor-pointer hover:scale-110"
            : "cursor-default"
        } transition-all duration-200`}
        style={{ width: size, height: size }}
        aria-label={`${i} star${i > 1 ? "s" : ""}`}
      >
        {/* Empty star (base) */}
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="absolute inset-0"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-espresso/15"
          />
        </svg>

        {/* Filled star (clipped) */}
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="absolute inset-0"
          style={{
            clipPath: half ? `inset(0 ${100 - (i - 0.5) * 200}% 0 0)` : filled ? undefined : "inset(0 100% 0 0)",
          }}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
            className="text-amber-400"
          />
        </svg>
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-espresso tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

// ── Inline star row for the review form ─────────────────

export function InteractiveStarInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className={`relative inline-flex items-center justify-center transition-all duration-200 ${
              star <= display
                ? "scale-100"
                : "scale-95 opacity-40 hover:opacity-70"
            } hover:scale-110`}
            style={{ width: size, height: size }}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              className="absolute inset-0"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={star <= display ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                className={
                  star <= display ? "text-amber-400" : "text-espresso/20"
                }
              />
            </svg>
          </button>
        ))}
      </div>
      {display > 0 && (
        <span className="text-xs font-medium text-espresso-muted ml-1">
          {display === 1 && "Poor"}
          {display === 2 && "Fair"}
          {display === 3 && "Good"}
          {display === 4 && "Very Good"}
          {display === 5 && "Excellent"}
        </span>
      )}
    </div>
  );
}
