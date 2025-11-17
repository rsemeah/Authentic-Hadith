import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { aiMessageId, description } = body as { aiMessageId: string; description: string };

  if (!aiMessageId || !description?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    user_id: user?.id ?? null,
    type: 'ai_response',
    ai_message_id: aiMessageId,
    description,
  });

  if (error) return NextResponse.json({ error: 'Unable to submit report' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
