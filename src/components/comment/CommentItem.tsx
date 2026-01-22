import type { Comment } from '@/lib/supabase/database.types';
import { HiTrash } from 'react-icons/hi';
import styles from '@/styles/components/comment/CommentItem.module.css';

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onDelete?: () => void;
}

export function CommentItem({ comment, isReply, onDelete }: CommentItemProps) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
      <div className={styles.header}>
        <div className={styles.author}>
          <span className={`${styles.name} ${comment.is_admin ? styles.admin : ''}`}>
            {comment.author_name}
            {comment.is_admin && <span className={styles.badge}>Admin</span>}
          </span>
          <time className={styles.date}>{formattedDate}</time>
        </div>
        {onDelete && (
          <button className={styles.deleteButton} onClick={onDelete} title="삭제">
            <HiTrash />
          </button>
        )}
      </div>
      <p className={styles.content}>{comment.content}</p>
    </div>
  );
}
