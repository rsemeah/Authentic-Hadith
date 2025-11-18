import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import { jsonError, jsonOk } from '@/lib/apiResponses';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { hadithId, type, description } = body as { hadithId?: string; type: string; description: string };

  if (!type || !description?.trim()) {
    return jsonError('Missing fields');
  }

  try {
    const { error } = await supabase.from('reports').insert({
      user_id: user?.id ?? null,
      type,
      hadith_id: hadithId ?? null,
      description,
    });

    if (error) {
      console.error('Report hadith insert error', {
        userId: user?.id,
        hadithId,
        type,
        error: error.message,
      });
      return jsonError('Unable to submit report', 500);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    console.error('Report hadith unexpected error', { userId: user?.id, hadithId, type, error: String(err) });
    return jsonError('Unable to submit report', 500);
  }
}
