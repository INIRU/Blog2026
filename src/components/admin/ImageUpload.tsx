'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage, deleteImageByUrl } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { HiPhotograph, HiX, HiCloudUpload, HiScissors } from 'react-icons/hi';
import ImageCropper from './ImageCropper';
import styles from '@/styles/components/admin/ImageUpload.module.css';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onInsertToContent?: (url: string) => void;
}

export function ImageUpload({ value, onChange, onInsertToContent }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      showToast('파일 크기는 20MB 이하여야 합니다.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error');
      return;
    }

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperImage(null);
    setOriginalFile(null);
    setIsUploading(true);
    showToast('이미지를 업로드 중...', 'info');

    const file = new File([croppedBlob], 'cropped-image.webp', { type: 'image/webp' });
    const result = await uploadImage(file);
    setIsUploading(false);

    if (result.success && result.url) {
      onChange(result.url);
      showToast('이미지가 업로드되었습니다!', 'success');
    } else {
      showToast(result.error || '업로드에 실패했습니다.', 'error');
    }
  };

  const handleCropCancel = () => {
    setCropperImage(null);
    setOriginalFile(null);
  };

  const handleDirectUpload = async (file: File) => {
    setIsUploading(true);
    showToast('이미지를 WebP로 변환 중...', 'info');

    const result = await uploadImage(file);
    setIsUploading(false);

    if (result.success && result.url) {
      onChange(result.url);
      showToast('이미지가 업로드되었습니다!', 'success');
    } else {
      showToast(result.error || '업로드에 실패했습니다.', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async () => {
    if (!value) return;

    setIsDeleting(true);
    const result = await deleteImageByUrl(value);
    setIsDeleting(false);

    if (result.success) {
      onChange('');
      showToast('썸네일이 삭제되었습니다.', 'success');
    } else {
      onChange('');
      showToast('로컬에서 제거되었습니다.', 'info');
    }
  };

  const handleSkipCrop = async () => {
    if (!originalFile) return;
    setCropperImage(null);
    await handleDirectUpload(originalFile);
    setOriginalFile(null);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${value ? styles.hasImage : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !value && inputRef.current?.click()}
      >
        {isUploading || isDeleting ? (
          <div className={styles.uploading}>
            <HiCloudUpload className={styles.uploadingIcon} />
            <span>{isDeleting ? '삭제 중...' : '업로드 중...'}</span>
          </div>
        ) : value ? (
          <div className={styles.preview}>
            <Image src={value} alt="Thumbnail" fill className={styles.previewImage} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              title="삭제"
            >
              <HiX />
            </button>
            <button
              type="button"
              className={styles.changeButton}
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              title="변경"
            >
              <HiScissors />
            </button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <HiPhotograph className={styles.placeholderIcon} />
            <span>클릭하거나 이미지를 드래그하세요</span>
            <span className={styles.hint}>PNG, JPG, GIF (최대 20MB)</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      {value && onInsertToContent && (
        <button
          type="button"
          className={styles.insertButton}
          onClick={() => onInsertToContent(value)}
        >
          본문에 삽입
        </button>
      )}

      {cropperImage && (
        <div className={styles.cropperWrapper}>
          <ImageCropper
            imageSrc={cropperImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            initialAspectRatio={16 / 9}
          />
          <button
            type="button"
            className={styles.skipCropButton}
            onClick={handleSkipCrop}
          >
            크롭 없이 업로드
          </button>
        </div>
      )}
    </div>
  );
}
