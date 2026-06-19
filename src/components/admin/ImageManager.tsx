import Image from 'next/image';
import { HiTrash } from 'react-icons/hi';
import styles from '@/styles/components/admin/PostEditor.module.css';

interface ImageManagerProps {
  images: string[];
  deletingImage: string | null;
  onDelete: (url: string) => void;
  onClose: () => void;
}

export function ImageManager({ images, deletingImage, onDelete, onClose }: ImageManagerProps) {
  return (
    <div className={styles.imageManager}>
      <div className={styles.imageManagerHeader}>
        <h4>본문 이미지 관리</h4>
        <button
          type="button"
          className={styles.closeManager}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
      <div className={styles.imageGrid}>
        {images.map((url, index) => (
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
              onClick={() => onDelete(url)}
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
  );
}
