import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/SupabaseServer';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { hadithId, type, description } = body as { hadithId?: string; type: string; description: string };

  if (!type || !description?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    user_id: user?.id ?? null,
    type,
    hadith_id: hadithId ?? null,
    description,
  } as any);

  if (error) return NextResponse.json({ error: 'Unable to submit report' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
