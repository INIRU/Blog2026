'use client';

import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi';
import styles from '@/styles/components/ui/ThemeToggle.module.css';
import { useMounted } from '@/hooks/useMounted';

const iconVariants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 180, opacity: 0 },
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className={styles.placeholder} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className={styles.iconWrapper}
          >
            <HiSun />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className={styles.iconWrapper}
          >
            <HiMoon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
