"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X, Check } from "lucide-react";

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
}

interface BlogForm {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string;
  isPublished: boolean;
}

const emptyForm: BlogForm = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "STORE",
  tags: "",
  isPublished: false,
};

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?limit=50");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch {
      console.warn("Failed to fetch posts");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleEdit = (post: BlogPost) => {
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      author: post.author,
      tags: post.tags.join(", "),
      isPublished: post.isPublished,
    });
    setEditingSlug(post.slug);
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingSlug(null);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      fetchPosts();
    } catch {
      console.warn("Failed to delete post");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await fetch(`/api/blog/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      fetchPosts();
    } catch {
      console.warn("Failed to toggle publish");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage,
      author: form.author,
      tags,
      isPublished: form.isPublished,
    };

    try {
      if (editingSlug) {
        await fetch(`/api/blog/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to create post");
          setSaving(false);
          return;
        }
      }
      setShowForm(false);
      fetchPosts();
    } catch {
      setError("Failed to save post");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-espresso-muted/50">
          <FileText size={12} />
          {posts.length} posts
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso text-cream hover:bg-espresso-light transition-all"
        >
          <Plus size={11} />
          New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-espresso dark:text-cream">
              {editingSlug ? "Edit Post" : "New Post"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-espresso/5">
              <X size={14} className="text-espresso-muted/50" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                required
                rows={2}
                className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={6}
                className="w-full px-3 py-2 text-xs font-mono bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-espresso-muted/50 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="design, craft, lifestyle"
                  className="w-full px-3 py-2 text-xs bg-cream dark:bg-espresso/30 rounded-xl border border-espresso/10 text-espresso dark:text-cream outline-none"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="rounded border-espresso/20"
              />
              <span className="text-[11px] text-espresso dark:text-cream">Published</span>
            </label>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso text-cream hover:bg-espresso-light disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : editingSlug ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider bg-espresso/5 text-espresso-muted hover:bg-espresso/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts list */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-espresso/5 dark:border-cream/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-espresso/30" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={24} className="mx-auto text-espresso/20 mb-3" />
            <p className="text-sm text-espresso-muted/60">No posts yet</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-espresso/5 dark:border-cream/5">
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Title</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium">Slug</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Status</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Date</th>
                <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-espresso-muted/40 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5 dark:divide-cream/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-espresso/[0.02] dark:hover:bg-cream/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-medium text-espresso dark:text-cream">{post.title}</span>
                  </td>
                  <td className="px-5 py-3 text-[10px] font-mono text-espresso-muted/50">{post.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        post.isPublished
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}
                    >
                      {post.isPublished ? <Eye size={9} /> : <EyeOff size={9} />}
                      {post.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right text-[10px] font-mono text-espresso-muted/50">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(post)} className="p-1.5 rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors">
                        <Pencil size={11} className="text-espresso-muted/50" />
                      </button>
                      <button onClick={() => handleDelete(post.slug)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={11} className="text-red-300 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
