import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import { jsonError, jsonOk } from '@/lib/apiResponses';

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { aiMessageId, description } = body as { aiMessageId: string; description: string };

  if (!aiMessageId || !description?.trim()) {
    return jsonError('Missing fields');
  }

  try {
    const { error } = await supabase.from('reports').insert({
      user_id: user?.id ?? null,
      type: 'ai_response',
      ai_message_id: aiMessageId,
      description,
    });

    if (error) {
      console.error('Report AI insert error', { userId: user?.id, aiMessageId, error: error.message });
      return jsonError('Unable to submit report', 500);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    console.error('Report AI unexpected error', { userId: user?.id, aiMessageId, error: String(err) });
    return jsonError('Unable to submit report', 500);
  }
}
