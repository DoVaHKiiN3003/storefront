import type { Product } from "./types";

export const products: Product[] = [
  {
    id: 1,
    slug: "sculptural-vase",
    name: "Sculptural Vase",
    price: 189,
    priceLabel: "$189",
    category: "Objects",
    image: "https://picsum.photos/seed/vase-sculptural/600/800",
    images: [
      "https://picsum.photos/seed/vase-sculptural-1/1200/1600",
      "https://picsum.photos/seed/vase-sculptural-2/1200/1600",
      "https://picsum.photos/seed/vase-sculptural-3/1200/1600",
      "https://picsum.photos/seed/vase-sculptural-4/1200/1600",
    ],
    description:
      "Hand-thrown on the wheel from high-fire stoneware clay, this sculptural vase features an organic asymmetrical form with a matte celadon glaze. Each piece is unique, with subtle variations in glaze flow and surface texture.",
    details: [
      "Hand-thrown stoneware ceramic",
      "Matte celadon glaze",
      "Watertight interior seal",
      "Approx. 10\" × 6\" × 6\"",
      "Due to handmade nature, slight variations may occur",
    ],
    materials: "High-fire stoneware clay, celadon glaze",
    dimensions: "10\" H × 6\" W × 6\" D",
    origin: "Handcrafted in Brooklyn, NY",
  },
  {
    id: 2,
    slug: "linen-tote",
    name: "Linen Tote",
    price: 78,
    priceLabel: "$78",
    category: "Bags",
    image: "https://picsum.photos/seed/linen-tote/600/800",
    images: [
      "https://picsum.photos/seed/linen-tote-1/1200/1600",
      "https://picsum.photos/seed/linen-tote-2/1200/1600",
      "https://picsum.photos/seed/linen-tote-3/1200/1600",
      "https://picsum.photos/seed/linen-tote-4/1200/1600",
    ],
    description:
      "Crafted from heavyweight European linen, this everyday tote softens beautifully with use. Features an internal slip pocket, reinforced cross-stitched handles, and a hidden magnetic closure. The natural linen is garment-washed for a lived-in feel from day one.",
    details: [
      "Heavyweight European linen (400 gsm)",
      "Internal slip pocket fits a 15\" laptop",
      "Hidden magnetic closure",
      "Reinforced cross-stitched handles",
      "Garment-washed for softness",
    ],
    materials: "100% European linen, vegetable-tanned leather trim",
    dimensions: "16\" W × 14\" H × 5\" D (10\" strap drop)",
    origin: "Made in Portugal",
  },
  {
    id: 3,
    slug: "ceramic-set",
    name: "Ceramic Set",
    price: 245,
    priceLabel: "$245",
    category: "Dining",
    image: "https://picsum.photos/seed/ceramic-set/600/800",
    images: [
      "https://picsum.photos/seed/ceramic-set-1/1200/1600",
      "https://picsum.photos/seed/ceramic-set-2/1200/1600",
      "https://picsum.photos/seed/ceramic-set-3/1200/1600",
      "https://picsum.photos/seed/ceramic-set-4/1200/1600",
    ],
    description:
      "A four-piece place setting designed for daily rituals. Each piece is slab-built from speckled stoneware and finished with a warm oatmeal glaze. The set includes a dinner plate, salad plate, bowl, and handled mug — all dishwasher and microwave safe.",
    details: [
      "Four-piece place setting (plate, salad, bowl, mug)",
      "Slab-built speckled stoneware",
      "Warm oatmeal glaze",
      "Dishwasher and microwave safe",
      "Stackable design for compact storage",
    ],
    materials: "Speckled stoneware clay, food-safe glaze",
    dimensions: "Plate: 10.5\" D, Bowl: 6\" D × 3\" H, Mug: 12 oz",
    origin: "Handcrafted in Portland, OR",
  },
  {
    id: 4,
    slug: "wool-throw",
    name: "Wool Throw",
    price: 320,
    priceLabel: "$320",
    category: "Textiles",
    image: "https://picsum.photos/seed/wool-throw/600/800",
    images: [
      "https://picsum.photos/seed/wool-throw-1/1200/1600",
      "https://picsum.photos/seed/wool-throw-2/1200/1600",
      "https://picsum.photos/seed/wool-throw-3/1200/1600",
      "https://picsum.photos/seed/wool-throw-4/1200/1600",
    ],
    description:
      "Woven on traditional jacquard looms in a family-run mill, this wool throw combines timeless craftsmanship with contemporary design. The double-faced weave reverses from a charcoal herringbone to a cream houndstooth, offering two distinct looks in one.",
    details: [
      "Pure merino wool, non-itch finish",
      "Double-faced jacquard weave (two patterns in one)",
      "Hand-fringed edges",
      "Ethically produced in a family-run mill",
      "Dry clean recommended",
    ],
    materials: "100% merino wool, non-itch treatment",
    dimensions: "55\" W × 72\" H",
    origin: "Woven in Scotland",
  },
  {
    id: 5,
    slug: "brass-lamp",
    name: "Brass Lamp",
    price: 450,
    priceLabel: "$450",
    category: "Lighting",
    image: "https://picsum.photos/seed/brass-lamp/600/800",
    images: [
      "https://picsum.photos/seed/brass-lamp-1/1200/1600",
      "https://picsum.photos/seed/brass-lamp-2/1200/1600",
      "https://picsum.photos/seed/brass-lamp-3/1200/1600",
      "https://picsum.photos/seed/brass-lamp-4/1200/1600",
    ],
    description:
      "Machined from solid brass with a hand-burnished satin finish, this table lamp balances industrial precision with warm, ambient light. The conical shade directs light downward, making it ideal for reading nooks and desk surfaces. Includes a dimmer switch.",
    details: [
      "Solid brass construction with satin finish",
      "Conical shade with interior white lacquer",
      "Integrated rotary dimmer switch",
      "Takes standard E26 bulbs (not included)",
      "Recommended: 60W LED warm white",
      "Weighted base with felt bottom",
    ],
    materials: "Solid brass, steel base, cotton-covered cord (8 ft)",
    dimensions: "22\" H × 12\" shade diameter × 6\" base diameter",
    origin: "Assembled in Chicago, IL",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}
