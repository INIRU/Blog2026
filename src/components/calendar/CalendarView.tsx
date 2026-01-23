'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HiChevronLeft, HiChevronRight, HiPlus, HiChevronDown } from 'react-icons/hi';
import { ScheduleModal } from './modal/ScheduleModal';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components/calendar/CalendarView.module.css';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'post' | 'schedule' | 'reminder' | 'holiday';
  slug?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(pickerYear, monthIndex, 1));
    setIsDatePickerOpen(false);
  };

  const handleYearChange = (delta: number) => {
    setPickerYear(prev => prev + delta);
  };

  const handleDateClick = (day: number) => {
    if (!isAdmin) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setIsModalOpen(true);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button onClick={handlePrevMonth} className={styles.navButton}>
            <HiChevronLeft />
          </button>
          
          <div className={styles.titleWrapper} ref={datePickerRef}>
            <button 
              className={styles.titleButton}
              onClick={() => {
                setPickerYear(currentDate.getFullYear());
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
            >
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              <HiChevronDown />
            </button>

            {isDatePickerOpen && (
              <div className={styles.datePicker}>
                <div className={styles.yearNav}>
                  <button onClick={() => handleYearChange(-1)} className={styles.navButton}>
                    <HiChevronLeft />
                  </button>
                  <span>{pickerYear}</span>
                  <button onClick={() => handleYearChange(1)} className={styles.navButton}>
                    <HiChevronRight />
                  </button>
                </div>
                <div className={styles.monthGrid}>
                  {months.map((month, index) => (
                    <button
                      key={month}
                      className={`${styles.monthButton} ${
                        currentDate.getMonth() === index && currentDate.getFullYear() === pickerYear
                          ? styles.active 
                          : ''
                      }`}
                      onClick={() => handleMonthSelect(index)}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleNextMonth} className={styles.navButton}>
            <HiChevronRight />
          </button>
        </div>
        
        {isAdmin && (
          <button 
            className={styles.addButton}
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
          >
            <HiPlus /> 일정 추가
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
        
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.cell} ${styles.empty}`} />
        ))}

        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = new Date().toDateString() === date.toDateString();
          
          const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getDate() === day &&
              eventDate.getMonth() === currentDate.getMonth() &&
              eventDate.getFullYear() === currentDate.getFullYear()
            );
          });

          return (
            <div
              key={day}
              className={`${styles.cell} ${isToday ? styles.today : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className={styles.dayNumber}>{day}</span>
              <div className={styles.eventList}>
                {dayEvents.map((event) => (
                  event.type === 'post' ? (
                    <Link
                      key={event.id}
                      href={`/posts/${event.slug}`}
                      className={`${styles.event} ${styles.postEvent}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.title}
                    </Link>
                  ) : (
                    <div
                      key={event.id}
                      className={`${styles.event} ${styles.scheduleEvent}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.title}
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
