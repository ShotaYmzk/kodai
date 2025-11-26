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
      .select('id, status')
      .eq('participant_name', user_id)
      .eq('filter_condition', condition)
      .order('id', { ascending: false })
      .limit(1);

    if (queryError) throw queryError;

    if (existing && existing.length > 0) {
      const record = existing[0];
      
      // If not completed, update
      if (record.status !== 'completed') {
        const updateData: Record<string, unknown> = { [columnName]: vas_score };
        if (phase === '10-15') {
          updateData['status'] = 'completed';
        }

        const { error: updateError } = await supabase
          .from('experiment_logs')
          .update(updateData)
          .eq('id', record.id);
          
        if (updateError) throw updateError;
        
        return NextResponse.json({ status: 'ok', message: 'Updated record' });
      }
    }

    // If we are here: either no record exists, or existing is completed.
    // Only create new if phase is 'pre'
    if (phase === 'pre') {
      const { error: insertError } = await supabase
        .from('experiment_logs')
        .insert({
          participant_name: user_id,
          filter_condition: condition,
          [columnName]: vas_score,
          status: 'in_progress'
        });
        
      if (insertError) throw insertError;
      return NextResponse.json({ status: 'ok', message: 'Created new record' });
    }

    return NextResponse.json({ error: 'No active experiment found and phase is not pre' }, { status: 400 });

  } catch (error: unknown) {
    console.error('VAS API Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
