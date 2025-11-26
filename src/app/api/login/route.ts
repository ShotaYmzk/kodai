import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const progress = { weak: false, mid: false, strong: false };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('experiment_logs')
          .select('filter_condition')
          .eq('participant_name', user_id)
          .eq('status', 'completed');

        if (error) throw error;

        if (data) {
          data.forEach((record: { filter_condition: string }) => {
            const cond = record.filter_condition as keyof typeof progress;
            if (cond in progress) {
              progress[cond] = true;
            }
          });
        }
      } catch (e) {
        console.error('Supabase query error:', e);
      }
    }

    return NextResponse.json({ status: 'ok', progress });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
