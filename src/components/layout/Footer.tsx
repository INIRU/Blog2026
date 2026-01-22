import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import styles from '@/styles/components/layout/Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              INIRU<span className={styles.logoAccent}>.blog</span>
            </Link>
            <p className={styles.description}>
              개발과 기술에 대한 생각을 공유합니다.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Navigation</h4>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/posts" className={styles.link}>Posts</Link>
              <Link href="/tags" className={styles.link}>Tags</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Connect</h4>
              <a
                href="https://github.com/INIRU"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} INIRU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
