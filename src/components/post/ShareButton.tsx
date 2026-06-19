'use client';

import { useState } from 'react';
import { HiShare, HiLink, HiCheck } from 'react-icons/hi';
import { FaXTwitter } from 'react-icons/fa6';
import { useToast } from '@/components/ui/Toast';
import styles from '@/styles/components/post/ShareButton.module.css';

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('링크가 복사되었습니다.', 'success');
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      showToast('복사에 실패했습니다.', 'error');
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="공유"
      >
        <HiShare className={styles.icon} />
        <span>공유</span>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            <button className={styles.option} onClick={handleCopyLink}>
              {copied ? <HiCheck className={styles.optionIcon} /> : <HiLink className={styles.optionIcon} />}
              <span>{copied ? '복사됨!' : '링크 복사'}</span>
            </button>
            <button className={styles.option} onClick={handleShareTwitter}>
              <FaXTwitter className={styles.optionIcon} />
              <span>X (Twitter)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
