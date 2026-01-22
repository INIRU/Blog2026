'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { deletePostImages } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoginForm } from '@/components/admin/LoginForm';
import { StatsDashboard } from '@/components/admin/StatsDashboard';
import type { Post } from '@/lib/supabase/database.types';
import { HiPlus, HiPencil, HiTrash, HiEye, HiEyeOff, HiExternalLink } from 'react-icons/hi';
import styles from '@/styles/pages/admin/page.module.css';

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const listVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  },
};

export default function AdminPage() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setPostsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setDeleteTarget(null);
    showToast('글과 이미지를 삭제하는 중...', 'info');
    
    await deletePostImages(deleteTarget.content, deleteTarget.thumbnail_url);
    
    const { error } = await supabase.from('posts').delete().eq('id', deleteTarget.id);
    
    if (error) {
      showToast('삭제에 실패했습니다.', 'error');
    } else {
      showToast('글이 삭제되었습니다.', 'success');
      fetchPosts();
    }
  };

  const togglePublish = async (id: string, currentPublished: boolean) => {
    await supabase
      .from('posts')
      .update({
        published: !currentPublished,
        published_at: !currentPublished ? new Date().toISOString() : null,
      })
      .eq('id', id);
    
    showToast(currentPublished ? '비공개로 전환되었습니다.' : '글이 발행되었습니다.', 'success');
    fetchPosts();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.loginWrapper}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginDescription}>
            관리자 계정으로 로그인하세요.
          </p>
          <LoginForm />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1 className={styles.title}>글 관리</h1>
          <p className={styles.description}>
            총 {posts.length}개의 글 (발행 {posts.filter((p) => p.published).length}개)
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/write" className={styles.primaryButton}>
            <HiPlus />
            <span>새 글 작성</span>
          </Link>
          <button onClick={signOut} className={styles.secondaryButton}>
            로그아웃
          </button>
        </div>
      </motion.div>

      {posts.length > 0 && (
        <motion.div variants={itemVariants}>
          <StatsDashboard posts={posts} />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {postsLoading ? (
          <motion.div 
            key="loading"
            className={styles.loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            글 목록을 불러오는 중...
          </motion.div>
        ) : posts.length > 0 ? (
          <motion.div 
            key="posts"
            className={styles.postList}
            variants={listVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div 
                  key={post.id} 
                  className={styles.postItem}
                  variants={listItemVariants}
                  layout
                >
                  <div className={styles.postInfo}>
                    <div className={styles.postStatus}>
                      {post.published ? (
                        <span className={styles.published}>발행됨</span>
                      ) : (
                        <span className={styles.draft}>임시저장</span>
                      )}
                    </div>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postMeta}>
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      {post.view_count > 0 && ` · 조회 ${post.view_count}`}
                    </p>
                  </div>
                  <div className={styles.postActions}>
                    <Link
                      href={post.published ? `/posts/${post.slug}` : `/preview/${post.id}`}
                      className={styles.actionButton}
                      title={post.published ? '글 보기' : '미리보기'}
                      target="_blank"
                    >
                      <HiExternalLink />
                    </Link>
                    <button
                      className={styles.actionButton}
                      onClick={() => togglePublish(post.id, post.published)}
                      title={post.published ? '비공개로 전환' : '발행하기'}
                    >
                      {post.published ? <HiEyeOff /> : <HiEye />}
                    </button>
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className={styles.actionButton}
                      title="수정"
                    >
                      <HiPencil />
                    </Link>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => setDeleteTarget(post)}
                      title="삭제"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            className={styles.empty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p>아직 작성된 글이 없습니다.</p>
            <Link href="/admin/write" className={styles.primaryButton}>
              <HiPlus />
              <span>첫 글 작성하기</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="글 삭제"
        message={`"${deleteTarget?.title}" 글을 삭제하시겠습니까?\n\n연결된 이미지도 함께 삭제됩니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
