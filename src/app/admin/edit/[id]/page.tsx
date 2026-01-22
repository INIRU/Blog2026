'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { PostEditor } from '@/components/admin/PostEditor';
import { useToast } from '@/components/ui/Toast';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/admin/edit.module.css';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchPost();
    }
  }, [isAdmin, id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    setPost(data);
    setIsLoading(false);
  };

  const handleSave = async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    thumbnail_url: string | null;
    published: boolean;
    series_name: string | null;
    series_order: number | null;
  }) => {
    setIsSaving(true);

    const wasPublished = post?.published;
    const isNowPublished = data.published;

    const result = await supabase
      .from('posts')
      .update({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        thumbnail_url: data.thumbnail_url,
        published: data.published,
        series_name: data.series_name,
        series_order: data.series_order,
        published_at: !wasPublished && isNowPublished
          ? new Date().toISOString()
          : post?.published_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    const error = result.error;

    setIsSaving(false);

    if (error) {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      return;
    }

    router.push('/admin');
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/admin');
    return null;
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <PostEditor post={post} onSave={handleSave} isSaving={isSaving} />
    </motion.div>
  );
}
