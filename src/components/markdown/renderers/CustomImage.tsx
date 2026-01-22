import Image from 'next/image';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';

interface CustomImageProps {
  src?: any;
  alt?: string;
  onClick: (src: string) => void;
  [key: string]: any;
}

export function CustomImage({ src, alt, onClick, ...props }: CustomImageProps) {
  const imgSrc = typeof src === 'string' ? src : '';
  
  return (
    <span
      className={styles.imageWrapper}
      onClick={() => imgSrc && onClick(imgSrc)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && imgSrc && onClick(imgSrc)}
    >
      <Image
        src={imgSrc}
        alt={alt || ''}
        width={800}
        height={450}
        className={styles.image}
        unoptimized={imgSrc.includes('supabase')}
      />
    </span>
  );
}
