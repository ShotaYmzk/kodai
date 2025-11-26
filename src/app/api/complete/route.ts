import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { user_id, condition } = await request.json();

    if (!supabase) return NextResponse.json({ status: 'ok' });

    const { data: existing, error: queryError } = await supabase
        .from('experiment_logs')
        .select('id, status')
        .eq('participant_name', user_id)
        .eq('filter_condition', condition)
        .order('id', { ascending: false })
        .limit(1);

    if (!queryError && existing && existing.length > 0) {
        const record = existing[0];
        if (record.status !== 'completed') {
            await supabase
                .from('experiment_logs')
                .update({ status: 'completed' })
                .eq('id', record.id);
        }
    } else {
        // Create if not exists (fallback)
        await supabase.from('experiment_logs').insert({
            participant_name: user_id,
            filter_condition: condition,
            status: 'completed',
            timestamp: new Date().toISOString()
        });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

