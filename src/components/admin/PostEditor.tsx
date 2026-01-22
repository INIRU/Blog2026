'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/components/ui/Toast';
import type { Post } from '@/lib/supabase/database.types';
import { HiArrowLeft, HiEye, HiCode, HiPhotograph, HiClipboardCopy } from 'react-icons/hi';
import styles from '@/styles/components/admin/PostEditor.module.css';
import { extractImagesFromMarkdown } from '@/lib/markdown';
import { ImageManager } from './ImageManager';
import { MarkdownToolbar, MarkdownAction } from './MarkdownToolbar';
import { useMarkdownEditor } from '@/hooks/useMarkdownEditor';

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
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  
  const { showToast } = useToast();

  const {
    textareaRef,
    isUploadingContent,
    deletingImage,
    insertMarkdown,
    insertImageToContent,
    handleContentImageUpload,
    handleDeleteContentImage,
  } = useMarkdownEditor({ content, setContent, showToast });

  const contentImages = useMemo(() => extractImagesFromMarkdown(content), [content]);

  useEffect(() => {
    const fetchSeries = async () => {
      const { data } = await supabase
        .from('posts')
        .select('series_name')
        .not('series_name', 'is', null);
      
      if (data) {
        const uniqueSeries = Array.from(new Set(data.map(p => p.series_name!))).sort();
        setSeriesList(uniqueSeries);
      }
    };
    fetchSeries();
  }, []);

  useEffect(() => {
    const fetchNextOrder = async () => {
      if (!seriesName || !seriesList.includes(seriesName) || seriesOrder) return;

      const { data } = await supabase
        .from('posts')
        .select('series_order')
        .eq('series_name', seriesName)
        .order('series_order', { ascending: false })
        .limit(1)
        .single();
        
      if (data) {
        setSeriesOrder(String((data.series_order || 0) + 1));
      } else {
        setSeriesOrder('1');
      }
    };
    
    const timer = setTimeout(fetchNextOrder, 500);
    return () => clearTimeout(timer);
  }, [seriesName, seriesList, seriesOrder]);

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

  const handleToolbarAction = (action: MarkdownAction) => {
    switch (action) {
      case 'bold': insertMarkdown('**', '**', '굵은 텍스트'); break;
      case 'italic': insertMarkdown('*', '*', '기울임 텍스트'); break;
      case 'link': insertMarkdown('[', '](url)', '링크 텍스트'); break;
      case 'code': insertMarkdown('`', '`', '코드'); break;
      case 'codeBlock': insertMarkdown('\n```\n', '\n```\n', '코드 블록'); break;
      case 'list': insertMarkdown('\n- ', '', '목록 항목'); break;
      case 'hr': insertMarkdown('\n---\n', '', ''); break;
    }
  };

  const copyPreviewLink = () => {
    if (!post) return;
    const previewUrl = `${window.location.origin}/preview/${post.id}`;
    navigator.clipboard.writeText(previewUrl);
    showToast('미리보기 링크가 복사되었습니다.', 'success');
  };

  return (
    <div className={styles.editor}>
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
          <button 
            type="button" 
            className={styles.saveButton} 
            disabled={isSaving}
            onClick={(e) => handleSubmit(e as any)}
          >
            {isSaving ? '저장 중...' : post ? '수정' : '저장'}
          </button>
        </div>
      </div>

      {showImageManager && contentImages.length > 0 && (
        <ImageManager
          images={contentImages.map(img => img.src)}
          deletingImage={deletingImage}
          onDelete={handleDeleteContentImage}
          onClose={() => setShowImageManager(false)}
        />
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
                list="series-list"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="예: React 시작하기"
                className={styles.input}
              />
              <datalist id="series-list">
                {seriesList.map((series) => (
                  <option key={series} value={series} />
                ))}
              </datalist>
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
            <MarkdownToolbar
              onAction={handleToolbarAction}
              onImageUpload={handleContentImageUpload}
              isUploading={isUploadingContent}
            />
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
    </div>
  );
}
