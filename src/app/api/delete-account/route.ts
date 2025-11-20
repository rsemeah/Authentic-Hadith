import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/SupabaseServer';

export async function POST() {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = user.id;

  await supabase.from('reports').delete().eq('user_id', userId);
  const { data: sessions } = await supabase.from('ai_sessions').select('id').eq('user_id', userId);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s: { id: string }) => s.id);
    await supabase.from('ai_messages').delete().in('session_id', sessionIds);
  }

  await supabase.from('ai_sessions').delete().eq('user_id', userId);
  await supabase.from('notes').delete().eq('user_id', userId);
  await supabase.from('saved_hadith').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
