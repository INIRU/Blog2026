'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation, HiX } from 'react-icons/hi';
import styles from '@/styles/components/ui/ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.15 }
  },
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onCancel}
        >
          <motion.div 
            className={styles.modal}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={onCancel}>
              <HiX />
            </button>
            
            <div className={`${styles.iconWrapper} ${styles[variant]}`}>
              <HiExclamation />
            </div>
            
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            
            <div className={styles.actions}>
              <button 
                className={styles.cancelButton}
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button 
                className={`${styles.confirmButton} ${styles[variant]}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  return {
    confirm: (options: Omit<ConfirmModalProps, 'isOpen' | 'onConfirm' | 'onCancel'>) => {
      return new Promise<boolean>((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const cleanup = () => {
          setTimeout(() => {
            container.remove();
          }, 200);
        };

        const handleConfirm = () => {
          resolve(true);
          cleanup();
        };

        const handleCancel = () => {
          resolve(false);
          cleanup();
        };

        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(container);
          root.render(
            <ConfirmModal
              {...options}
              isOpen={true}
              onConfirm={() => {
                handleConfirm();
                root.unmount();
              }}
              onCancel={() => {
                handleCancel();
                root.unmount();
              }}
            />
          );
        });
      });
    },
  };
}
