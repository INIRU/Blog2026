'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { ImageUpload } from './ImageUpload';
import { extractImagesFromMarkdown, deleteImageByUrl, uploadImage } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import type { Post } from '@/lib/supabase/database.types';
import { HiArrowLeft, HiEye, HiCode, HiTrash, HiPhotograph, HiLink, HiClipboardCopy } from 'react-icons/hi';
import { HiBold, HiItalic, HiListBullet, HiCodeBracket, HiPhoto, HiMinus } from 'react-icons/hi2';
import styles from '@/styles/components/admin/PostEditor.module.css';

interface PostEditorProps {
  post?: Post;
  onSave: (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    thumbnail_url: string | null;
    published: boolean;
    series_name: string | null;
    series_order: number | null;
  }) => Promise<void>;
  isSaving: boolean;
}

export function PostEditor({ post, onSave, isSaving }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnail_url ?? '');
  const [published, setPublished] = useState(post?.published ?? false);
  const [seriesName, setSeriesName] = useState(post?.series_name ?? '');
  const [seriesOrder, setSeriesOrder] = useState<string>(post?.series_order?.toString() ?? '');
  const [isPreview, setIsPreview] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const contentImages = useMemo(() => extractImagesFromMarkdown(content), [content]);

  useEffect(() => {
    if (!post && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title, post, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !slug.trim() || !content.trim()) {
      showToast('제목, 슬러그, 내용을 모두 입력해주세요.', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await onSave({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      tags,
      thumbnail_url: thumbnailUrl.trim() || null,
      published,
      series_name: seriesName.trim() || null,
      series_order: seriesOrder ? parseInt(seriesOrder, 10) : null,
    });
  };

  const insertImageToContent = (url: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const markdown = `![image](${url})`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + markdown + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + markdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleDeleteContentImage = async (imageUrl: string) => {
    setDeletingImage(imageUrl);
    
    const result = await deleteImageByUrl(imageUrl);
    
    const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const imageRegex = new RegExp(`!\\[[^\\]]*\\]\\(${escapedUrl}\\)\\n?`, 'g');
    const newContent = content.replace(imageRegex, '');
    setContent(newContent);
    
    setDeletingImage(null);
    
    if (result.success) {
      showToast('이미지가 삭제되었습니다.', 'success');
    } else {
      showToast('본문에서 제거되었습니다.', 'info');
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('파일 크기는 20MB 이하여야 합니다.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }

    setIsUploadingContent(true);
    showToast('이미지 업로드 중...', 'info');

    const result = await uploadImage(file);

    setIsUploadingContent(false);

    if (result.success && result.url) {
      insertImageToContent(result.url);
      showToast('이미지가 삽입되었습니다.', 'success');
    } else {
      showToast(result.error || '업로드에 실패했습니다.', 'error');
    }

    if (contentImageInputRef.current) {
      contentImageInputRef.current.value = '';
    }
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const toolbarActions = {
    bold: () => insertMarkdown('**', '**', '굵은 텍스트'),
    italic: () => insertMarkdown('*', '*', '기울임 텍스트'),
    link: () => insertMarkdown('[', '](url)', '링크 텍스트'),
    code: () => insertMarkdown('`', '`', '코드'),
    codeBlock: () => insertMarkdown('\n```\n', '\n```\n', '코드 블록'),
    list: () => insertMarkdown('\n- ', '', '목록 항목'),
    hr: () => insertMarkdown('\n---\n', '', ''),
  };

  const copyPreviewLink = () => {
    if (!post) return;
    const previewUrl = `${window.location.origin}/preview/${post.id}`;
    navigator.clipboard.writeText(previewUrl);
    showToast('미리보기 링크가 복사되었습니다.', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editor}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.backLink}>
          <HiArrowLeft />
          <span>돌아가기</span>
        </Link>
        <div className={styles.headerActions}>
          {post && !post.published && (
            <button
              type="button"
              className={styles.copyLinkButton}
              onClick={copyPreviewLink}
              title="미리보기 링크 복사"
            >
              <HiClipboardCopy />
              <span>미리보기 링크</span>
            </button>
          )}
          {contentImages.length > 0 && (
            <button
              type="button"
              className={styles.imageManagerButton}
              onClick={() => setShowImageManager(!showImageManager)}
            >
              <HiPhotograph />
              <span>이미지 ({contentImages.length})</span>
            </button>
          )}
          <button
            type="button"
            className={styles.previewButton}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? <HiCode /> : <HiEye />}
            <span>{isPreview ? '편집' : '미리보기'}</span>
          </button>
          <label className={styles.publishToggle}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>발행</span>
          </label>
          <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? '저장 중...' : post ? '수정' : '저장'}
          </button>
        </div>
      </div>

      {showImageManager && contentImages.length > 0 && (
        <div className={styles.imageManager}>
          <div className={styles.imageManagerHeader}>
            <h4>본문 이미지 관리</h4>
            <button
              type="button"
              className={styles.closeManager}
              onClick={() => setShowImageManager(false)}
            >
              닫기
            </button>
          </div>
          <div className={styles.imageGrid}>
            {contentImages.map((url, index) => (
              <div key={`${url}-${index}`} className={styles.imageItem}>
                <div className={styles.imagePreview}>
                  <Image
                    src={url}
                    alt={`Content image ${index + 1}`}
                    fill
                    className={styles.imageThumb}
                  />
                </div>
                <button
                  type="button"
                  className={styles.deleteImageButton}
                  onClick={() => handleDeleteContentImage(url)}
                  disabled={deletingImage === url}
                >
                  {deletingImage === url ? (
                    <span>삭제 중...</span>
                  ) : (
                    <>
                      <HiTrash />
                      <span>삭제</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.main}>
        <div className={`${styles.editPane} ${isPreview ? styles.hidden : ''}`}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className={styles.titleInput}
            required
          />

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>슬러그 (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>요약</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="글의 짧은 요약"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, Next.js, TypeScript"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>시리즈 이름</label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="예: React 시작하기"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>시리즈 순서</label>
              <input
                type="number"
                value={seriesOrder}
                onChange={(e) => setSeriesOrder(e.target.value)}
                placeholder="1, 2, 3..."
                className={styles.input}
                min="1"
              />
            </div>

            <div className={`${styles.field} ${styles.thumbnailField}`}>
              <label className={styles.label}>썸네일</label>
              <ImageUpload
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                onInsertToContent={insertImageToContent}
              />
            </div>
          </div>

          <div className={styles.contentField}>
            <label className={styles.label}>내용 (Markdown)</label>
            <div className={styles.toolbar}>
              <button type="button" onClick={toolbarActions.bold} title="굵게 (Ctrl+B)">
                <HiBold />
              </button>
              <button type="button" onClick={toolbarActions.italic} title="기울임 (Ctrl+I)">
                <HiItalic />
              </button>
              <button type="button" onClick={toolbarActions.link} title="링크">
                <HiLink />
              </button>
              <span className={styles.toolbarDivider} />
              <button type="button" onClick={toolbarActions.code} title="인라인 코드">
                <HiCodeBracket />
              </button>
              <button type="button" onClick={toolbarActions.codeBlock} title="코드 블록">
                <HiCode />
              </button>
              <button type="button" onClick={toolbarActions.list} title="목록">
                <HiListBullet />
              </button>
              <button type="button" onClick={toolbarActions.hr} title="구분선">
                <HiMinus />
              </button>
              <span className={styles.toolbarDivider} />
              <button
                type="button"
                onClick={() => contentImageInputRef.current?.click()}
                disabled={isUploadingContent}
                title="이미지 삽입"
                className={styles.imageButton}
              >
                <HiPhoto />
                {isUploadingContent ? '업로드 중...' : '이미지'}
              </button>
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleContentImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="마크다운으로 글을 작성하세요..."
              className={styles.textarea}
              required
            />
          </div>
        </div>

        <div className={`${styles.previewPane} ${!isPreview ? styles.hidden : ''}`}>
          <div className={styles.previewContent}>
            <h1 className={styles.previewTitle}>{title || '제목 없음'}</h1>
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className={styles.previewEmpty}>내용을 입력하세요...</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
