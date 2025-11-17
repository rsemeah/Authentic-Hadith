import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const supabaseUnsafe = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { hadithId, type, description } = body as { hadithId?: string; type: string; description: string };

  if (!type || !description?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const reportPayload: ReportInsert = {
    user_id: user?.id ?? null,
    type,
    hadith_id: hadithId ?? null,
    description,
  };

  const { error } = await supabaseUnsafe.from('reports').insert(reportPayload);

  if (error) return NextResponse.json({ error: 'Unable to submit report' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
