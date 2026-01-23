import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { CalendarView } from '@/components/calendar/CalendarView';
import styles from '@/styles/pages/calendar/page.module.css';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Calendar',
  description: '블로그 포스팅 활동과 일정을 캘린더로 확인하세요.',
  openGraph: {
    title: 'Calendar | INIRU Blog',
    description: '블로그 포스팅 활동과 일정을 캘린더로 확인하세요.',
    url: 'https://blog.iniru.xyz/calendar',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz/calendar',
  },
};

async function getCalendarEvents() {
  const supabase = createServerClient();
  
  const [postsResult, schedulesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, published_at')
      .eq('published', true)
      .not('published_at', 'is', null),
    (supabase as any)
      .from('schedules')
      .select('id, title, start_date, type')
  ]);

  const events: any[] = [];

  if (postsResult.data) {
    events.push(...postsResult.data.map(post => ({
      id: post.id,
      title: post.title,
      date: post.published_at!,
      type: 'post',
      slug: post.slug,
    })));
  }

  if (schedulesResult.data) {
    events.push(...schedulesResult.data.map((schedule: any) => ({
      id: schedule.id,
      title: schedule.title,
      date: schedule.start_date,
      type: schedule.type || 'schedule',
    })));
  }

  return events;
}

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div className={styles.container}>
      <CalendarView events={events} />
    </div>
  );
}
