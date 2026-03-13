import { createServerSupabase } from "@/lib/supabase-server";
import { BlogMain } from "@/components/posts/BlogMain";
import type { Category, Post, Tag } from "@/lib/types";

type PostWithCategory = Post & { category: Category; tags: Tag[] };

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabase();

  const [postsResult, categoriesResult] = await Promise.all([
    supabase
      .from("posts")
      .select("*, category:categories(*), post_tags(tag:tags(*))")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const posts = ((postsResult.data ?? []) as any[]).map((p) => ({
    ...p,
    tags: (p.post_tags ?? [])
      .map((pt: { tag: Tag | null }) => pt.tag)
      .filter(Boolean) as Tag[],
    post_tags: undefined,
  })) as PostWithCategory[];
  const categories = (categoriesResult.data ?? []) as Category[];

  return (
    <BlogMain
      initialPosts={posts}
      categories={categories}
      initialCategory={params.category ?? null}
      initialQuery={params.q ?? ""}
    />
  );
}
