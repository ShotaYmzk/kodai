import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get('condition');
  const phase = searchParams.get('phase');

  console.log(`[API Timeline] Request: condition=${condition}, phase=${phase}`);

  if (!phase) {
    console.error('[API Timeline] Phase is required');
    return NextResponse.json({ error: 'Phase required' }, { status: 400 });
  }

  try {
    console.log(`[API Timeline] Calling getPosts with condition="${condition || 'warmup'}", phase="${phase}"`);
    const posts = getPosts(condition || 'warmup', phase);
    console.log(`[API Timeline] getPosts returned ${posts.length} posts`);
    if (posts.length > 0) {
      console.log(`[API Timeline] First post sample: "${posts[0].text.substring(0, 50)}..."`);
    } else {
      console.warn(`[API Timeline] WARNING: No posts returned!`);
    }
    return NextResponse.json({
      success: true,
      timeline: posts
    });
  } catch (e) {
    console.error('[API Timeline] Error:', e);
    if (e instanceof Error) {
      console.error('[API Timeline] Error stack:', e.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

