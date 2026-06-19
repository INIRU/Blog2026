'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components/comment/CommentForm.module.css';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  isReply?: boolean;
}

export function CommentForm({ postId, parentId, onSuccess, isReply }: CommentFormProps) {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(!isReply);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!isAdmin && !name.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      parent_id: parentId || null,
      author_name: isAdmin ? 'Admin' : name,
      author_email: email || null,
      content: content.trim(),
      is_admin: isAdmin,
    });

    setIsSubmitting(false);

    if (!error) {
      setName('');
      setEmail('');
      setContent('');
      if (isReply) setIsOpen(false);
      onSuccess?.();
    }
  };

  if (isReply && !isOpen) {
    return (
      <button className={styles.replyButton} onClick={() => setIsOpen(true)}>
        답글 달기
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${isReply ? styles.replyForm : ''}`}>
      {!isAdmin && (
        <div className={styles.fields}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 *"
            className={styles.input}
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 (선택)"
            className={styles.input}
          />
        </div>
      )}
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? '답글을 작성하세요...' : '댓글을 작성하세요...'}
        className={styles.textarea}
        rows={isReply ? 2 : 4}
        required
      />
      
      <div className={styles.actions}>
        {isReply && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsOpen(false)}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : isReply ? '답글 등록' : '댓글 등록'}
        </button>
      </div>
    </form>
  );
}
