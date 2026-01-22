'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { PostEditor } from '@/components/admin/PostEditor';
import styles from '@/styles/pages/admin/write.module.css';

export default function WritePage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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

    const { error } = await supabase.from('posts').insert({
      ...data,
      published_at: data.published ? new Date().toISOString() : null,
    });

    setIsSaving(false);

    if (error) {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      return;
    }

    router.push('/admin');
  };

  if (isLoading) {
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

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <PostEditor onSave={handleSave} isSaving={isSaving} />
    </motion.div>
  );
}
