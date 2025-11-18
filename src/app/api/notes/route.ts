import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import { jsonError, jsonOk } from '@/lib/apiResponses';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { hadithId, content } = body as { hadithId: string; content: string };

  if (!hadithId || !content?.trim()) {
    return jsonError('Missing fields');
  }

  try {
    const { error } = await supabase.from('notes').insert({ user_id: user.id, hadith_id: hadithId, content });
    if (error) {
      console.error('Notes API insert error', { userId: user.id, hadithId, error: error.message });
      return jsonError('Unable to save note', 500);
    }
  } catch (err) {
    console.error('Notes API unexpected error', { userId: user.id, hadithId, error: String(err) });
    return jsonError('Unable to save note', 500);
  }

  return jsonOk({ ok: true });
}
