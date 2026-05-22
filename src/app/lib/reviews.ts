import type { Review, ProductReviews } from "./types";

// ── Seed Reviews ────────────────────────────────────────
// Each product gets a few hand-written reviews for realism.

const seedReviews: ProductReviews = {
  1: [
    {
      id: "r-1-1",
      productId: 1,
      name: "Morgan L.",
      rating: 5,
      title: "Even more beautiful in person",
      comment:
        "The celadon glaze has so much depth — it shifts from pale green to blue-gray depending on the light. I placed it on my dining table with a single branch and it completely transforms the room.",
      date: "2025-11-12T10:30:00Z",
    },
    {
      id: "r-1-2",
      productId: 1,
      name: "Jordan K.",
      rating: 4,
      title: "Beautiful but smaller than expected",
      comment:
        "Gorgeous craftsmanship and the glaze is stunning. Just note that the standard size is more of a tabletop accent piece. I ended up ordering the large as well.",
      date: "2025-10-28T14:15:00Z",
    },
    {
      id: "r-1-3",
      productId: 1,
      name: "Sam R.",
      rating: 5,
      title: "Perfect gift",
      comment:
        "Bought this as a housewarming gift and it was a hit. The handmade feel is unmistakable — you can see the throwing marks on the base. Packaging was also beautiful and sustainable.",
      date: "2025-09-05T09:00:00Z",
    },
  ],
  2: [
    {
      id: "r-2-1",
      productId: 2,
      name: "Alex P.",
      rating: 5,
      title: "My everyday bag",
      comment:
        "I've been using this tote daily for three months and it only gets better. The linen softens beautifully and the leather trim develops a nice patina. Fits my laptop, gym clothes, and groceries.",
      date: "2025-12-01T16:45:00Z",
    },
    {
      id: "r-2-2",
      productId: 2,
      name: "Casey M.",
      rating: 4,
      title: "Great quality, love the olive color",
      comment:
        "The olive is such a rich, earthy green — exactly what I was hoping for. The magnetic closure is subtle but effective. Only wish it had an interior zip pocket for keys.",
      date: "2025-11-15T11:20:00Z",
    },
  ],
  3: [
    {
      id: "r-3-1",
      productId: 3,
      name: "Riley S.",
      rating: 5,
      title: "Elevates every meal",
      comment:
        "I replaced my entire everyday dinnerware with these and it was the best decision. The speckled texture and warm glaze make even a simple bowl of oatmeal feel special. The mug is the perfect size for morning coffee.",
      date: "2025-11-20T08:30:00Z",
    },
    {
      id: "r-3-2",
      productId: 3,
      name: "Taylor W.",
      rating: 5,
      title: "Bought two sets",
      comment:
        "Loved them so much after the first set that I ordered another for entertaining. The terracotta glaze is my favorite — it has this beautiful depth with darker speckles throughout. Stack neatly too.",
      date: "2025-10-10T13:00:00Z",
    },
  ],
  4: [
    {
      id: "r-4-1",
      productId: 4,
      name: "Quinn D.",
      rating: 5,
      title: "The double-face is genius",
      comment:
        "I love that I can flip it over for a completely different look. The herringbone side is sophisticated for the living room, while the houndstooth side feels more casual. Incredibly soft without being scratchy.",
      date: "2025-12-15T19:00:00Z",
    },
    {
      id: "r-4-2",
      productId: 4,
      name: "Blake N.",
      rating: 4,
      title: "Luxurious but delicate",
      comment:
        "This is absolutely gorgeous and the wool quality is top-notch. Just be aware that it's a dry-clean-only piece — not ideal for heavy everyday use if you have pets or kids. For a decorative throw, it's perfect.",
      date: "2025-11-03T10:45:00Z",
    },
  ],
  5: [
    {
      id: "r-5-1",
      productId: 5,
      name: "Drew F.",
      rating: 5,
      title: "Worth every penny",
      comment:
        "I was hesitant about the price, but the moment I unboxed it I understood. The brass has a beautiful weight to it, and the dimmer is incredibly smooth from warm to dim. It's become the centerpiece of my reading nook.",
      date: "2025-12-20T20:30:00Z",
    },
    {
      id: "r-5-2",
      productId: 5,
      name: "Avery H.",
      rating: 5,
      title: "Stunning craftsmanship",
      comment:
        "The satin brass finish is flawless — not too shiny, not too matte. The weighted base feels very premium. I paired it with a warm LED filament bulb and it casts the most beautiful glow. Highly recommend.",
      date: "2025-11-28T15:00:00Z",
    },
    {
      id: "r-5-3",
      productId: 5,
      name: "Morgan L.",
      rating: 4,
      title: "Beautiful but cord could be longer",
      comment:
        "The lamp itself is gorgeous — solid, well-made, looks like it costs twice as much. My only minor complaint is that the 8-foot cord is a bit short for my setup. Easy enough to extend with a nice fabric-covered extension cord.",
      date: "2025-10-15T12:00:00Z",
    },
  ],
};

// ── Storage key for localStorage ─────────────────────────

const STORAGE_KEY = "storefront-reviews";

// ── Helpers ──────────────────────────────────────────────

export function loadReviews(): ProductReviews {
  if (typeof window === "undefined") return seedReviews;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProductReviews;
      // Merge with seed reviews — user reviews take precedence
      const merged: ProductReviews = { ...seedReviews };
      for (const [productId, reviews] of Object.entries(parsed)) {
        const id = Number(productId);
        merged[id] = reviews;
      }
      return merged;
    }
  } catch {
    // ignore
  }

  // First visit — seed and persist
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReviews));
  } catch {
    // ignore
  }

  return seedReviews;
}

export function persistReviews(reviews: ProductReviews): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

export function generateReviewId(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getRatingDistribution(
  reviews: Review[]
): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  }
  return dist;
}
