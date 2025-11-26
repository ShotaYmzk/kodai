import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PHASE_ORDER = ['pre', 'warmup', '0-5', '5-10', '10-15'];

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  const condition = searchParams.get('condition');
  const current_phase = searchParams.get('current_phase');

  if (!user_id || !condition || !current_phase) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const currentIndex = PHASE_ORDER.indexOf(current_phase);
  if (currentIndex <= 0) {
    return NextResponse.json({ previous_score: null });
  }

  const previousPhase = PHASE_ORDER[currentIndex - 1];
  const previousColumn = getPhaseToColumnMapping(previousPhase);

  if (!supabase || !previousColumn) {
    return NextResponse.json({ previous_score: null });
  }

  try {
    const { data, error } = await supabase
      .from('experiment_logs')
      .select(previousColumn)
      .eq('participant_name', user_id)
      .eq('filter_condition', condition)
      .order('id', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
        const score = data[0][previousColumn];
        return NextResponse.json({ previous_score: score });
    }
  } catch (e) {
    console.error('Previous VAS error:', e);
  }

  return NextResponse.json({ previous_score: null });
}

