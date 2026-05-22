import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seedProducts = [
  {
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
      'Approx. 10" × 6" × 6"',
      "Due to handmade nature, slight variations may occur",
    ],
    variants: [
      { label: "Standard", type: "size", priceDelta: 0 },
      { label: "Large", type: "size", priceDelta: 60 },
    ],
    materials: "High-fire stoneware clay, celadon glaze",
    dimensions: '10" H × 6" W × 6" D',
    origin: "Handcrafted in Brooklyn, NY",
    isFeatured: true,
  },
  {
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
      'Internal slip pocket fits a 15" laptop',
      "Hidden magnetic closure",
      "Reinforced cross-stitched handles",
      "Garment-washed for softness",
    ],
    variants: [
      { label: "Natural", type: "color", priceDelta: 0, color: "#e8dccc" },
      { label: "Charcoal", type: "color", priceDelta: 0, color: "#4a4a4a" },
      { label: "Olive", type: "color", priceDelta: 10, color: "#7a8a6a" },
    ],
    materials: "100% European linen, vegetable-tanned leather trim",
    dimensions: '16" W × 14" H × 5" D (10" strap drop)',
    origin: "Made in Portugal",
    isFeatured: true,
  },
  {
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
    variants: [
      { label: "Oatmeal", type: "color", priceDelta: 0, color: "#eaddcf" },
      { label: "Slate", type: "color", priceDelta: 0, color: "#7a7a7a" },
      { label: "Terracotta", type: "color", priceDelta: 15, color: "#c07050" },
    ],
    materials: "Speckled stoneware clay, food-safe glaze",
    dimensions: 'Plate: 10.5" D, Bowl: 6" D × 3" H, Mug: 12 oz',
    origin: "Handcrafted in Portland, OR",
    isFeatured: true,
  },
  {
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
    variants: [
      { label: "Charcoal Herringbone", type: "color", priceDelta: 0, color: "#3a3a3a" },
      { label: "Cream Houndstooth", type: "color", priceDelta: 0, color: "#f0e8dc" },
      { label: "Navy Tartan", type: "color", priceDelta: 20, color: "#2a3a5a" },
    ],
    materials: "100% merino wool, non-itch treatment",
    dimensions: '55" W × 72" H',
    origin: "Woven in Scotland",
    isFeatured: true,
  },
  {
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
    variants: [
      { label: "Satin Brass", type: "color", priceDelta: 0, color: "#c8a84e" },
      { label: "Matte Black", type: "color", priceDelta: 20, color: "#1a1a1a" },
      { label: "Polished Nickel", type: "color", priceDelta: 40, color: "#b8b8b8" },
    ],
    materials: "Solid brass, steel base, cotton-covered cord (8 ft)",
    dimensions: '22" H × 12" shade diameter × 6" base diameter',
    origin: "Assembled in Chicago, IL",
    isFeatured: true,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const data of seedProducts) {
    const { variants, images, details, isFeatured, ...productData } = data;

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        images: JSON.stringify(images),
        details: JSON.stringify(details),
        isFeatured,
      },
      create: {
        ...productData,
        images: JSON.stringify(images),
        details: JSON.stringify(details),
        isFeatured,
      },
    });

    // Upsert variants
    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: {
          productId_label: {
            productId: product.id,
            label: variant.label,
          },
        },
        update: variant,
        create: {
          ...variant,
          productId: product.id,
        },
      });
    }

    // Create product analytics row if not exists
    await prisma.productAnalytics.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id },
    });

    console.log(`  ✓ ${productData.name}`);
  }

  // Seed default settings
  const defaultSettings = [
    { key: "store_name", value: "STORE" },
    { key: "store_tagline", value: "Essentials Reimagined" },
    { key: "currency", value: "USD" },
    { key: "shipping_standard_rate", value: "8.00" },
    { key: "shipping_free_threshold", value: "200" },
    { key: "tax_rate", value: "0.08" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log(`  ✓ ${defaultSettings.length} default settings`);

  // Seed sample CMS pages
  const cmsPages = [
    {
      slug: "hero-banner",
      title: "Home Hero Banner",
      content: JSON.stringify({
        heading: "Essentials Reimagined",
        subheading: "Thoughtfully crafted everyday pieces, designed to last.",
        cta: "Explore the Collection",
        ctaLink: "/collections",
        image: "",
      }),
      type: "hero",
      isPublished: true,
      sortOrder: 1,
    },
    {
      slug: "about",
      title: "About",
      content:
        "STORE is a design studio and shop based in New York. We partner with independent makers and family-run workshops around the world to bring you objects that are made with care, built to last, and designed to be part of your daily life.",
      type: "about",
      isPublished: true,
      sortOrder: 2,
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      content: JSON.stringify([
        {
          question: "What is your return policy?",
          answer:
            "We accept returns within 30 days of delivery. Items must be unused and in their original packaging. We'll provide a prepaid return label.",
        },
        {
          question: "How long does shipping take?",
          answer:
            "Domestic orders typically arrive within 5-7 business days. International orders can take 10-14 business days depending on customs.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout and may include duties and taxes.",
        },
      ]),
      type: "faq",
      isPublished: true,
      sortOrder: 3,
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log(`  ✓ ${cmsPages.length} CMS pages`);

  // Seed a sample coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrderAmount: 50,
      maxUses: 100,
      isActive: true,
    },
  });

  console.log("  ✓ 1 sample coupon (WELCOME10)");

  // Seed sample currencies
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rateToUSD: 1.0 },
    { code: "EUR", name: "Euro", symbol: "€", rateToUSD: 0.92 },
    { code: "GBP", name: "British Pound", symbol: "£", rateToUSD: 0.79 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToUSD: 151.5 },
    { code: "CAD", name: "Canadian Dollar", symbol: "CA$", rateToUSD: 1.36 },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", rateToUSD: 1.53 },
  ];

  for (const currency of currencies) {
    await prisma.currencyRate.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }

  console.log(`  ✓ ${currencies.length} currencies`);

  // Seed sample blog posts
  const blogPosts = [
    {
      slug: "craft-behind-our-ceramics",
      title: "The Craft Behind Our Ceramics",
      excerpt: "A deep dive into the wheel-throwing process that makes each piece unique, from clay preparation to final glazing.",
      content: `<p>Every ceramic piece begins as a lump of raw clay — unassuming, heavy, full of potential. Our partnership with small-batch potteries in Portland and Brooklyn means each piece is shaped by hand on the wheel, not cast from a mold.</p><p>The process starts with wedging, a technique that removes air bubbles and aligns clay particles for even drying. Once on the wheel, the potter's hands guide the form, responding to the material's unique character. No two pieces ever spin the same way.</p><p>After a first firing at 1800°F (bisque firing), each piece is hand-dipped in glaze — a suspension of minerals and oxides that transforms in the kiln. The alchemy of heat and chemistry creates surfaces that range from glossy celadon to matte oatmeal, with subtle variations that are the hallmark of true craftsmanship.</p><p>We believe these imperfections — the slight asymmetry, the drip of glaze, the fingertip groove left by the maker — are what make an object soulful. They tell a story of human hands at work.</p>`,
      coverImage: "https://picsum.photos/seed/blog-ceramics/1200/600",
      author: "STORE",
      tags: JSON.stringify(["craft", "ceramics", "process"]),
      isPublished: true,
      sortOrder: 1,
    },
    {
      slug: "linen-through-seasons",
      title: "Linen Through the Seasons",
      excerpt: "Why linen is the most versatile natural fiber — cool in summer, warm in winter, and better with every wash.",
      content: `<p>Linen has been woven for thousands of years, yet it remains one of the most intelligent fabric choices for modern living. Made from the flax plant, linen fibers are hollow, which gives the fabric its legendary breathability and temperature regulation.</p><p>In summer, linen wicks moisture away from the skin, keeping you cool. In winter, the same hollow fibers trap air for insulation. No other natural fiber adapts as gracefully to seasonal change.</p><p>Our linen is sourced from family-run mills in Belgium and France, where flax has been grown for generations. The European climate — with its cool, damp springs and warm summers — produces the longest, strongest fibers in the world.</p><p>What we love most about linen is how it ages. Each wash softens the fabric, fading the color slightly and creating a worn-in texture that synthetic fabrics can never replicate. A well-loved linen tote or throw becomes uniquely yours — a quiet partner in your daily rituals.</p>`,
      coverImage: "https://picsum.photos/seed/blog-linen/1200/600",
      author: "STORE",
      tags: JSON.stringify(["textiles", "linen", "materials"]),
      isPublished: true,
      sortOrder: 2,
    },
    {
      slug: "lighting-mood-home",
      title: "Lighting for Mood & Function",
      excerpt: "How the right lighting transforms a space — and why we chose brass, ceramic, and warm LEDs for our collection.",
      content: `<p>Lighting is the single most transformative element in any room. A well-placed lamp can make a space feel larger, warmer, more intimate. It defines zones, highlights textures, and sets the circadian rhythm of your home.</p><p>When designing our lighting collection, we prioritized three things: quality of light, material honesty, and timeless form. Each lamp uses warm LED bulbs (2700K recommended) that mimic the golden glow of incandescent light without the energy cost.</p><p>Our brass lamp is machined from solid brass stock — not plated, not coated. Over time, the unlacquered brass will develop a natural patina, darkening slightly and mellowing in luster. This is not a defect; it's the material living and breathing in your home.</p><p>We believe the best lighting recedes into the background during the day and comes alive at dusk — casting shadows, creating warmth, making a house feel like home.</p>`,
      coverImage: "https://picsum.photos/seed/blog-lighting/1200/600",
      author: "STORE",
      tags: JSON.stringify(["lighting", "design", "home"]),
      isPublished: true,
      sortOrder: 3,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log(`  ✓ ${blogPosts.length} blog posts`);

  // Seed sample reviews
  const products = await prisma.product.findMany({ take: 5 });
  if (products.length > 0) {
    const sampleReviews = [
      {
        productId: products[0].id,
        name: "Alex M.",
        rating: 5,
        title: "Stunning piece, even better in person",
        comment: "The glaze has incredible depth — photos don't do it justice. It's become the centerpiece of our dining table.",
        status: "approved",
      },
      {
        productId: products[0].id,
        name: "Jordan K.",
        rating: 4,
        title: "Beautiful but fragile",
        comment: "Gorgeous vase, looks amazing with dried flowers. Just be careful handling it — the base is a bit narrow.",
        status: "approved",
      },
      {
        productId: products.length > 1 ? products[1].id : products[0].id,
        name: "Sam R.",
        rating: 5,
        title: "Perfect everyday bag",
        comment: "I've been using this tote daily for two months and it's aged beautifully. The linen softened up nicely.",
        status: "approved",
      },
      {
        productId: products.length > 2 ? products[2].id : products[0].id,
        name: "Taylor W.",
        rating: 5,
        title: "Elevates every meal",
        comment: "The oatmeal glaze is so warm and inviting. Makes even a simple breakfast feel special.",
        status: "approved",
      },
      {
        productId: products.length > 1 ? products[1].id : products[0].id,
        name: "Morgan L.",
        rating: 3,
        title: "Nice but expected more",
        comment: "Quality is good but the color was slightly different from the product photos. Still a nice bag overall.",
        status: "pending",
      },
    ];

    for (const review of sampleReviews) {
      await prisma.review.create({ data: review });
    }

    console.log(`  ✓ ${sampleReviews.length} sample reviews`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
