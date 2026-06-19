import Image from 'next/image';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';

interface CustomImageProps {
  src?: string | Blob;
  alt?: string;
  onClick: (src: string) => void;
  title?: string;
  width?: string | number;
  height?: string | number;
  [key: string]: unknown;
}

export function CustomImage({ src, alt, onClick, ...props }: CustomImageProps) {
  const imgSrc = typeof src === 'string' ? src : '';
  
  if (!imgSrc) return null;
  
  return (
    <span
      className={styles.imageWrapper}
      onClick={() => onClick(imgSrc)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(imgSrc)}
    >
      <Image
        src={imgSrc}
        alt={alt || ''}
        width={800}
        height={450}
        className={styles.image}
      />
    </span>
  );
}
