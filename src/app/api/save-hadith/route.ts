import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { hadithId, savedId } = body as { hadithId: string; savedId?: string | null };

  if (!hadithId) return NextResponse.json({ error: 'Missing hadithId' }, { status: 400 });

  if (savedId) {
    await supabase.from('saved_hadith').delete().eq('id', savedId).eq('user_id', user.id);
    return NextResponse.json({ savedId: null });
  }

  const { data, error } = await supabase
    .from('saved_hadith')
    .insert({ user_id: user.id, hadith_id: hadithId })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Unable to save' }, { status: 500 });
  return NextResponse.json({ savedId: data.id });
}
