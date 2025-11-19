import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/SupabaseServer';

export async function GET() {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: saved, error } = await supabase
    .from('saved_hadith')
    .select('created_at, hadith:hadith(id, collection, book_number, hadith_number, arabic_text, english_text, reference)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Unable to export' }, { status: 500 });
  return NextResponse.json(saved || []);
}
