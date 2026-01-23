'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addSchedule(prevState: any, formData: FormData) {
  const supabase = createServerClient();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const type = formData.get('type') as string || 'schedule';

  // @ts-ignore: schedules table not in types yet
  const { error } = await supabase.from('schedules').insert({
    title,
    description,
    start_date: new Date(startDate).toISOString(),
    end_date: new Date(endDate).toISOString(),
    type,
  });

  if (error) {
    console.error('Error adding schedule:', error);
    return { message: '일정 추가에 실패했습니다.' };
  }

  revalidatePath('/calendar');
  return { message: 'success' };
}

export async function deleteSchedule(id: string) {
  const supabase = createServerClient();
  // @ts-ignore
  const { error } = await supabase.from('schedules').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/calendar');
}
