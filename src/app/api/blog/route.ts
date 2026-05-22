import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const tag = searchParams.get("tag");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset = Number(searchParams.get("offset")) || 0;

    const where: Record<string, unknown> = {};
    if (published === "true") where.isPublished = true;
    if (tag) {
      where.tags = { contains: tag };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          author: true,
          tags: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts: (posts as Array<Record<string, unknown>>).map((p) => ({
        ...p,
        tags: JSON.parse(p.tags as string),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, excerpt, content, coverImage, author, tags, isPublished, sortOrder } = body;

    if (!slug || !title || !excerpt || !content) {
      return NextResponse.json({ error: "Slug, title, excerpt, and content are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        coverImage: coverImage ?? "",
        author: author ?? "STORE",
        tags: JSON.stringify(tags ?? []),
        isPublished: isPublished ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(
      { ...post, tags: JSON.parse(post.tags) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
