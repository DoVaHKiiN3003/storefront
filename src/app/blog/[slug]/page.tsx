"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Loader2 } from "lucide-react";
import AnimateOnView from "../../components/AnimateOnView";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/blog/${params.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="pt-28 pb-24 px-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-24 skeleton rounded-lg" />
          <div className="h-10 w-3/4 skeleton rounded-lg" />
          <div className="h-64 skeleton rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 w-full skeleton rounded-lg" />
            <div className="h-4 w-5/6 skeleton rounded-lg" />
            <div className="h-4 w-4/6 skeleton rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="pt-28 pb-24 px-6 max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-espresso/5 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-espresso/20" />
        </div>
        <h1 className="text-xl font-semibold text-espresso mb-1">Post not found</h1>
        <p className="text-sm text-espresso-muted/60 mb-6">This article may have been removed or is no longer available.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-espresso-light transition-all duration-300">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28">
      <div className="max-w-3xl mx-auto">
        <AnimateOnView delay={0}>
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-espresso-muted/60 hover:text-espresso transition-colors duration-300 mb-8"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            Back
          </button>
        </AnimateOnView>

        <AnimateOnView delay={40}>
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-sage/10 px-3 py-1 text-[10px] font-medium text-sage"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-espresso leading-[1.1] mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-espresso-muted/60 leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-espresso-muted/50 mb-10 pb-6 border-b border-espresso/5">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              By {post.author}
            </span>
          </div>
        </AnimateOnView>

        {post.coverImage && (
          <AnimateOnView delay={80}>
            <div className="aspect-[2/1] rounded-2xl overflow-hidden bg-espresso/5 mb-10">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </AnimateOnView>
        )}

        <AnimateOnView delay={120}>
          <div
            className="prose prose-sm max-w-none prose-headings:text-espresso prose-p:text-espresso-muted/80 prose-a:text-sage prose-a:no-underline hover:prose-a:underline prose-strong:text-espresso prose-code:text-espresso-muted prose-pre:bg-espresso/5 prose-pre:border prose-pre:border-espresso/5 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </AnimateOnView>

        <AnimateOnView delay={160}>
          <div className="mt-12 pt-8 border-t border-espresso/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-espresso-muted/50">
              <Calendar size={12} />
              Last updated {new Date(post.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <Link
              href="/blog"
              className="text-xs font-medium text-espresso hover:text-espresso-muted transition-colors flex items-center gap-1"
            >
              All Posts <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
        </AnimateOnView>
      </div>
    </div>
  );
}
