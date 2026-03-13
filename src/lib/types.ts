export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Series {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  category_id: string;
  series_id: string | null;
  series_order: number | null;
  status: "draft" | "published";
  view_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category: Category;
  tags: Tag[];
  series: Series | null;
}

export interface SeriesWithPosts extends Series {
  posts: Pick<Post, "id" | "title" | "slug" | "series_order" | "status">[];
}
