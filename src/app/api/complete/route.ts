import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { user_id, condition } = await request.json();

    if (!supabase) return NextResponse.json({ status: 'ok' });

    const { data: existing, error: queryError } = await supabase
        .from('experiment_logs')
        .select('id, status, vas_phase3')
        .eq('participant_name', user_id)
        .eq('filter_condition', condition)
        .order('id', { ascending: false })
        .limit(1);

    if (!queryError && existing && existing.length > 0) {
        const record = existing[0];
        
        // 最後のフェーズ（10-15）のVASが記録されている場合のみ完了扱いにする
        // これにより、セッション切れで完了扱いになることを防ぐ
        const hasFinalVas = record.vas_phase3 !== null && record.vas_phase3 !== undefined;
        
        if (record.status !== 'completed' && hasFinalVas) {
            // 最後のVASが記録されている場合のみ完了扱いにする
            await supabase
                .from('experiment_logs')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', record.id);
        } else if (record.status !== 'completed' && !hasFinalVas) {
            // 最後のVASが記録されていない場合は、セッション切れと判断
            // 完了扱いにはしない（statusは'in_progress'のまま）
            console.warn(`[Complete API] Experiment not completed: missing final VAS for user ${user_id}, condition ${condition}`);
            return NextResponse.json({ 
              status: 'warning', 
              message: 'Experiment not fully completed - missing final VAS',
              should_not_complete: true
            });
        }
    } else {
        // レコードが存在しない場合は、完了扱いにしない
        console.warn(`[Complete API] No record found for user ${user_id}, condition ${condition}`);
        return NextResponse.json({ 
          status: 'error', 
          message: 'No experiment record found',
          should_not_complete: true
        });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (e) {
    console.error('[Complete API] Error:', e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

