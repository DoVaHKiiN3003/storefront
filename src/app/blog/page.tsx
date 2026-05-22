"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Loader2, Tag } from "lucide-react";
import AnimateOnView from "../components/AnimateOnView";

interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog?published=true&limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-6xl mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="h-4 w-72 skeleton rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-6 sm:px-12 lg:px-20 xl:px-28 max-w-6xl mx-auto">
      <AnimateOnView delay={0}>
        <div className="mb-12">
          <span className="block text-[10px] uppercase tracking-[0.2em] font-medium text-sage mb-3">
            Journal
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-espresso leading-[1.1]">
            Stories & Ideas
          </h1>
          <p className="text-sm text-espresso-muted/60 mt-2 max-w-lg">
            Exploring the intersection of craft, design, and everyday living.
          </p>
        </div>
      </AnimateOnView>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-espresso/5 flex items-center justify-center mb-4">
            <Calendar size={24} className="text-espresso/20" />
          </div>
          <h2 className="text-lg font-medium text-espresso mb-1">No posts yet</h2>
          <p className="text-sm text-espresso-muted/60">Check back soon for new stories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateOnView key={post.id} delay={i * 60}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl bg-white border border-espresso/5 overflow-hidden hover:shadow-[0_8px_24px_-8px_rgba(60,47,42,0.08)] transition-all duration-500"
              >
                <div className="aspect-[4/3] bg-espresso/5 overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-espresso/10">
                      <Calendar size={40} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag size={10} className="text-sage" />
                      <span className="text-[9px] font-medium text-sage uppercase tracking-wider">
                        {post.tags[0]}
                      </span>
                    </div>
                  )}
                  <h2 className="text-sm font-semibold text-espresso leading-snug group-hover:text-espresso-muted transition-colors duration-300">
                    {post.title}
                  </h2>
                  <p className="text-xs text-espresso-muted/60 mt-1.5 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-espresso/5">
                    <div className="flex items-center gap-2 text-[10px] text-espresso-muted/40">
                      <Calendar size={10} />
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span className="text-[10px] font-medium text-espresso opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      Read <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>
            </AnimateOnView>
          ))}
        </div>
      )}
    </div>
  );
}
