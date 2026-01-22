import { useState, useRef } from 'react';
import { uploadImage, deleteImageByUrl } from '@/lib/storage';

interface UseMarkdownEditorProps {
  content: string;
  setContent: (content: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useMarkdownEditor({ content, setContent, showToast }: UseMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

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

    e.target.value = '';
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

  return {
    textareaRef,
    isUploadingContent,
    deletingImage,
    insertMarkdown,
    insertImageToContent,
    handleContentImageUpload,
    handleDeleteContentImage,
  };
}
