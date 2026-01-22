'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiRefresh, HiHome } from 'react-icons/hi';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem',
        gap: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(8rem, 30vw, 12rem)',
            fontWeight: 900,
            lineHeight: 0.9,
            background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          500
        </span>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Server Error
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{
          fontSize: '1.0625rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '320px',
          lineHeight: 1.6,
        }}
      >
        문제가 발생했어요.
        <br />
        잠시 후 다시 시도해주세요.
      </motion.p>

      {process.env.NODE_ENV === 'development' && error.message && (
        <motion.code
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            color: '#f43f5e',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            maxWidth: '90%',
            overflow: 'auto',
            wordBreak: 'break-word',
          }}
        >
          {error.message}
        </motion.code>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.5rem',
        }}
      >
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#f43f5e';
            e.currentTarget.style.color = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <HiRefresh size={18} />
          다시 시도
        </button>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'white',
            backgroundColor: '#f43f5e',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e11d48';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f43f5e';
          }}
        >
          <HiHome size={18} />
          홈으로
        </Link>
      </motion.div>
    </div>
  );
}
