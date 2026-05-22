import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productStats: true,
        variants: true,
      },
      orderBy: { name: "asc" },
    });

    const headers = [
      "ID",
      "Name",
      "Slug",
      "Category",
      "Price",
      "Stock",
      "Featured",
      "Views",
      "Add to Carts",
      "Purchases",
      "Revenue",
      "Variant Count",
      "Created",
    ];

    const rows = (products as Array<{ id: number; name: string; slug: string; category: string; price: number; stock: number; isFeatured: boolean; productStats: { views: number; addToCarts: number; purchases: number; revenue: number } | null; variants: unknown[]; createdAt: Date }>).map((p) => [
      String(p.id),
      p.name,
      p.slug,
      p.category,
      p.price.toFixed(2),
      String(p.stock),
      p.isFeatured ? "Yes" : "No",
      String(p.productStats?.views ?? 0),
      String(p.productStats?.addToCarts ?? 0),
      String(p.productStats?.purchases ?? 0),
      (p.productStats?.revenue ?? 0).toFixed(2),
      String(p.variants.length),
      new Date(p.createdAt).toISOString().split("T")[0],
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export products:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
