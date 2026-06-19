import { useRef } from 'react';
import { HiBold, HiItalic, HiListBullet, HiCodeBracket, HiPhoto, HiMinus } from 'react-icons/hi2';
import { HiLink, HiCode } from 'react-icons/hi';
import styles from '@/styles/components/admin/PostEditor.module.css';

export type MarkdownAction = 'bold' | 'italic' | 'link' | 'code' | 'codeBlock' | 'list' | 'hr';

interface MarkdownToolbarProps {
  onAction: (action: MarkdownAction) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function MarkdownToolbar({ onAction, onImageUpload, isUploading }: MarkdownToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.toolbar}>
      <button type="button" onClick={() => onAction('bold')} title="굵게 (Ctrl+B)">
        <HiBold />
      </button>
      <button type="button" onClick={() => onAction('italic')} title="기울임 (Ctrl+I)">
        <HiItalic />
      </button>
      <button type="button" onClick={() => onAction('link')} title="링크">
        <HiLink />
      </button>
      <span className={styles.toolbarDivider} />
      <button type="button" onClick={() => onAction('code')} title="인라인 코드">
        <HiCodeBracket />
      </button>
      <button type="button" onClick={() => onAction('codeBlock')} title="코드 블록">
        <HiCode />
      </button>
      <button type="button" onClick={() => onAction('list')} title="목록">
        <HiListBullet />
      </button>
      <button type="button" onClick={() => onAction('hr')} title="구분선">
        <HiMinus />
      </button>
      <span className={styles.toolbarDivider} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="이미지 삽입"
        className={styles.imageButton}
      >
        <HiPhoto />
        {isUploading ? '업로드 중...' : '이미지'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}
