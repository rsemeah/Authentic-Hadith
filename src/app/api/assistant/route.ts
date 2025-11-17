import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';
import OpenAI from 'openai';
import type { Database } from '@/types/supabase';

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable.');
  }
  return new OpenAI({ apiKey });
};

interface AssistantRequest {
  message: string;
  hadithId?: string;
  sessionId?: string;
}

type AiSessionInsert = Database['public']['Tables']['ai_sessions']['Insert'];
type AiMessageInsert = Database['public']['Tables']['ai_messages']['Insert'];
type AiMessageRow = Database['public']['Tables']['ai_messages']['Row'];
type HadithRow = Database['public']['Tables']['hadith']['Row'];

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const supabaseUnsafe = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as AssistantRequest;
  if (!body.message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  let sessionId = body.sessionId || null;
  if (!sessionId) {
    const sessionPayload: AiSessionInsert = { user_id: user.id };
    const { data: newSession } = await supabaseUnsafe
      .from('ai_sessions')
      .insert(sessionPayload)
      .select('id')
      .single();
    if (!newSession) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
    sessionId = newSession.id;
  }

  const resolvedSessionId = sessionId as string;

  const { data: previousMessages } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('session_id', resolvedSessionId)
    .order('created_at', { ascending: true });

  const previousMessagesRows = (previousMessages as AiMessageRow[] | null) ?? [];

  let hadithContext = '';
  if (body.hadithId) {
    const { data: hadith } = await supabase
      .from('hadith')
      .select('arabic_text, english_text, collection, book_number, hadith_number, reference')
      .eq('id', body.hadithId)
      .maybeSingle();

    const hadithRow = hadith as HadithRow | null;

    if (hadithRow) {
      hadithContext = `
You are answering with this hadith as context:

Collection: ${hadithRow.collection}
Book: ${hadithRow.book_number ?? '-'}
Hadith: ${hadithRow.hadith_number ?? '-'}
Reference: ${hadithRow.reference ?? '-'}

Arabic:
${hadithRow.arabic_text}

English:
${hadithRow.english_text}
`;
    }
  }

  const systemPrompt = `
You are a calm, respectful assistant helping users understand authentic Islamic hadith.

You can:
- Explain wording, themes, and moral lessons.
- Summarize narrations in simple language.
- Suggest gentle reflection questions and reminders.

You must NOT:
- Issue fatwas or legal rulings.
- Give personalized halal/haram judgments.
- Replace scholars or imams.

When asked for rulings or legal decisions, respond gently:
"This app is for learning and reflection only. Please consult a qualified scholar for rulings or fatwas."

Keep language clear, short, and accessible.
${hadithContext}
`.trim();

  const messagesForModel: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: 'system', content: systemPrompt }];

  if (previousMessagesRows.length) {
    for (const m of previousMessagesRows) {
      messagesForModel.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      });
    }
  }

  messagesForModel.push({ role: 'user', content: body.message });

  const userMessagePayload: AiMessageInsert = {
    session_id: resolvedSessionId,
    role: 'user',
    content: body.message,
  };

  await supabaseUnsafe.from('ai_messages').insert(userMessagePayload);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForModel,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || '';

    const assistantMessagePayload: AiMessageInsert = {
      session_id: resolvedSessionId,
      role: 'assistant',
      content: reply,
    };

    const { data: assistantMsg } = await supabaseUnsafe
      .from('ai_messages')
      .insert(assistantMessagePayload)
      .select('id')
      .single();

    return NextResponse.json({
      sessionId,
      reply,
      aiMessageId: assistantMsg?.id,
    });
  } catch (err) {
    console.error('Assistant error', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again in a moment.' }, { status: 500 });
  }
}
