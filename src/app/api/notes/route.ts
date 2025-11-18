import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { hadithId, content } = body as { hadithId: string; content: string };

  if (!hadithId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabase.from('notes').insert({ user_id: user.id, hadith_id: hadithId, content });
  if (error) return NextResponse.json({ error: 'Unable to save note' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
