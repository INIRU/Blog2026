'use client';

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';
import styles from '@/styles/components/ui/Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${idCounter.current++}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={styles.icon}>
              {toast.type === 'success' && <HiCheckCircle />}
              {toast.type === 'error' && <HiXCircle />}
              {toast.type === 'info' && <HiInformationCircle />}
            </div>
            <span className={styles.message}>{toast.message}</span>
            <button className={styles.close} onClick={() => removeToast(toast.id)}>
              <HiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => console.warn('Toast called outside of provider'),
    };
  }
  return context;
}
