import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

type SavedHadithInsert = Database['public']['Tables']['saved_hadith']['Insert'];

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const supabaseUnsafe = supabase as any;
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

  const payload: SavedHadithInsert = { user_id: user.id, hadith_id: hadithId };

  const { data, error } = await supabaseUnsafe
    .from('saved_hadith')
    .insert(payload)
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Unable to save' }, { status: 500 });
  return NextResponse.json({ savedId: data.id });
}
