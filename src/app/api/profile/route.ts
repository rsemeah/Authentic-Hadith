import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

type ProfileUpsert = Database['public']['Tables']['profiles']['Insert'];

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const supabaseUnsafe = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, language_preference } = body as { name?: string; language_preference?: string };

  const payload: ProfileUpsert = { id: user.id, name: name ?? null, language_preference: language_preference || 'en' };

  const { error } = await supabaseUnsafe.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
