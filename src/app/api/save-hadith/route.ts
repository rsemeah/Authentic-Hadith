import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import { jsonError, jsonOk } from '@/lib/apiResponses';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  const body = await request.json();
  const { hadithId, savedId } = body as { hadithId: string; savedId?: string | null };

  if (!hadithId) return jsonError('Missing hadithId');

  try {
    if (savedId) {
      const { error } = await supabase.from('saved_hadith').delete().eq('id', savedId).eq('user_id', user.id);
      if (error) {
        console.error('Save hadith delete error', { userId: user.id, savedId, error: error.message });
        return jsonError('Unable to update saved hadith', 500);
      }
      return jsonOk({ savedId: null });
    }

    const { data, error } = await supabase
      .from('saved_hadith')
      .insert({ user_id: user.id, hadith_id: hadithId })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Save hadith insert error', { userId: user.id, hadithId, error: error?.message });
      return jsonError('Unable to save', 500);
    }
    return jsonOk({ savedId: data.id });
  } catch (err) {
    console.error('Save hadith unexpected error', { userId: user.id, hadithId, error: String(err) });
    return jsonError('Unable to save', 500);
  }
}
