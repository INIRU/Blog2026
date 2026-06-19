'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { Comment } from '@/lib/supabase/database.types';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import styles from '@/styles/components/comment/CommentSection.module.css';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    setComments(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const rootComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const getReplies = (parentId: string) => {
    return replies.filter((r) => r.parent_id === parentId);
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    
    const { error } = await supabase.from('comments').delete().eq('id', deleteTargetId);
    setDeleteTargetId(null);
    
    if (error) {
      showToast('댓글 삭제에 실패했습니다.', 'error');
    } else {
      showToast('댓글이 삭제되었습니다.', 'success');
      fetchComments();
    }
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>
        댓글 <span className={styles.count}>{comments.length}</span>
      </h3>

      <CommentForm postId={postId} onSuccess={handleCommentAdded} />

      {isLoading ? (
        <div className={styles.loading}>댓글을 불러오는 중...</div>
      ) : rootComments.length > 0 ? (
        <div className={styles.comments}>
          {rootComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onDelete={isAdmin ? () => setDeleteTargetId(comment.id) : undefined}
              />
              
              {getReplies(comment.id).length > 0 && (
                <div className={styles.replies}>
                  {getReplies(comment.id).map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isReply
                      onDelete={isAdmin ? () => setDeleteTargetId(reply.id) : undefined}
                    />
                  ))}
                </div>
              )}
              
              <div className={styles.replyForm}>
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onSuccess={handleCommentAdded}
                  isReply
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="댓글 삭제"
        message="댓글을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </section>
  );
}
