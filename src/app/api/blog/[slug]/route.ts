import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ ...post, tags: JSON.parse(post.tags) });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, excerpt, content, coverImage, author, tags, isPublished, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const post = await prisma.blogPost.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({ ...post, tags: JSON.parse(post.tags) });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
