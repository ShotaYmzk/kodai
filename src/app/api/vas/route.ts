import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mapping from phase to DB column name
const getPhaseToColumnMapping = (phase: string) => {
  const mapping: Record<string, string> = {
    'pre': 'vas_pre',
    'warmup': 'vas_warmup',
    '0-5': 'vas_phase1',
    '5-10': 'vas_phase2',
    '10-15': 'vas_phase3'
  };
  return mapping[phase];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, condition, phase, vas_score } = body;

    if (!user_id || !condition || !phase || vas_score === undefined) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (!supabase) {
        // Allow offline testing if configured, or error out
        console.warn("Supabase not configured, skipping save");
        return NextResponse.json({ status: 'ok', message: 'Skipped (Supabase not configured)' });
    }

    const columnName = getPhaseToColumnMapping(phase);
    if (!columnName) {
      return NextResponse.json({ error: 'Invalid phase mapping' }, { status: 400 });
    }

    // Find existing record
    const { data: existing, error: queryError } = await supabase
      .from('experiment_logs')
      .select('id, status, vas_pre, vas_warmup, vas_phase1, vas_phase2, vas_phase3, last_activity_at')
      .eq('participant_name', user_id)
      .eq('filter_condition', condition)
      .order('id', { ascending: false })
      .limit(1);

    if (queryError) throw queryError;

    // preフェーズのVAS送信時は、新しい実験セッションの開始とみなす
    if (phase === 'pre') {
      // 既存の未完了レコードがある場合は削除して新しいレコードを作成
      if (existing && existing.length > 0) {
        const record = existing[0];
        
        // 未完了のレコードがある場合は削除
        if (record.status !== 'completed') {
          console.log(`[VAS API] Deleting incomplete record (id: ${record.id}) to start new session`);
          await supabase
            .from('experiment_logs')
            .delete()
            .eq('id', record.id);
        }
      }
      
      // 新しいレコードを作成
      const { error: insertError } = await supabase
        .from('experiment_logs')
        .insert({
          participant_name: user_id,
          filter_condition: condition,
          [columnName]: vas_score,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      return NextResponse.json({ status: 'ok', message: 'Created new record' });
    }

    // pre以外のフェーズでは、既存の未完了レコードを更新
    if (existing && existing.length > 0) {
      const record = existing[0];
      
      // 未完了のレコードがある場合は更新
      if (record.status !== 'completed') {
        const updateData: Record<string, unknown> = { 
          [columnName]: vas_score,
          last_activity_at: new Date().toISOString()
        };
        
        // 最後のフェーズ（10-15）のVAS送信時のみ完了扱いにする
        if (phase === '10-15') {
          updateData['status'] = 'completed';
          updateData['completed_at'] = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('experiment_logs')
          .update(updateData)
          .eq('id', record.id);
          
        if (updateError) throw updateError;
        
        return NextResponse.json({ 
          status: 'ok', 
          message: 'Updated record',
          is_completed: phase === '10-15'
        });
      } else {
        // 既に完了しているレコードがある場合はエラー
        return NextResponse.json({ 
          error: 'Experiment already completed. Please start a new experiment with pre phase.' 
        }, { status: 400 });
      }
    }

    // レコードが存在しない場合はエラー（preフェーズから開始していない）
    return NextResponse.json({ 
      error: 'No active experiment found. Please start with pre phase.' 
    }, { status: 400 });

  } catch (error: unknown) {
    console.error('VAS API Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

