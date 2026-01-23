import Link from 'next/link';
import { FaGithub, FaRss, FaEnvelope } from 'react-icons/fa';
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
              개발과 기술, 그리고 성장에 대한 기록.
              <br />
              지속 가능한 코드를 고민합니다.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Sitemap</h4>
              <Link href="/posts" className={styles.link}>Posts</Link>
              <Link href="/series" className={styles.link}>Series</Link>
              <Link href="/calendar" className={styles.link}>Calendar</Link>
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
              <a href="mailto:contact@iniru.xyz" className={styles.link}>
                <FaEnvelope />
                <span>Email</span>
              </a>
              <a href="/feed.xml" className={styles.link}>
                <FaRss />
                <span>RSS</span>
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
