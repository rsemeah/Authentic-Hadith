import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/SupabaseServer';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, language_preference } = body as { name?: string; language_preference?: string };

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, name: name ?? null, language_preference: language_preference || 'en' } as any,
      { onConflict: 'id' },
    );

  if (error) return NextResponse.json({ error: 'Unable to save profile' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
