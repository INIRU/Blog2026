'use client';

import { useActionState, useEffect } from 'react';
import { addSchedule } from '@/app/calendar/actions';
import { HiX } from 'react-icons/hi';
import styles from '@/styles/components/calendar/ScheduleModal.module.css';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

const initialState = {
  message: '',
};

export function ScheduleModal({ isOpen, onClose, selectedDate }: ScheduleModalProps) {
  const [state, formAction, isPending] = useActionState(addSchedule, initialState);

  useEffect(() => {
    if (state?.message === 'success') {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  const defaultDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>새 일정 추가</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <HiX />
          </button>
        </div>

        <form action={formAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>제목</label>
            <input type="text" id="title" name="title" required className={styles.input} />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="startDate" className={styles.label}>시작일</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                defaultValue={defaultDate}
                required 
                className={styles.input} 
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="endDate" className={styles.label}>종료일</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                defaultValue={defaultDate}
                required 
                className={styles.input} 
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="type" className={styles.label}>유형</label>
            <select id="type" name="type" className={styles.select}>
              <option value="schedule">일정</option>
              <option value="reminder">리마인더</option>
              <option value="holiday">휴일</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>설명</label>
            <textarea id="description" name="description" rows={3} className={styles.textarea} />
          </div>

          {state?.message && state.message !== 'success' && (
            <p className={styles.error}>{state.message}</p>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
            <button type="submit" disabled={isPending} className={styles.submitButton}>
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
