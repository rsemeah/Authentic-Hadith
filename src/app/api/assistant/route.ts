import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/SupabaseServer';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AssistantRequest {
  message: string;
  hadithId?: string;
  sessionId?: string;
}

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as AssistantRequest;
  if (!body.message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  let sessionId = body.sessionId || null;
  if (!sessionId) {
    const { data: newSession } = await supabase
      .from('ai_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (!newSession) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
    sessionId = newSession.id;
  }

  const { data: previousMessages } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  let hadithContext = '';
  if (body.hadithId) {
    const { data: hadith } = await supabase
      .from('hadith')
      .select('arabic_text, english_text, collection, book_number, hadith_number, reference')
      .eq('id', body.hadithId)
      .maybeSingle();

    if (hadith) {
      hadithContext = `
You are answering with this hadith as context:

Collection: ${hadith.collection}
Book: ${hadith.book_number ?? '-'}
Hadith: ${hadith.hadith_number ?? '-'}
Reference: ${hadith.reference ?? '-'}

Arabic:
${hadith.arabic_text}

English:
${hadith.english_text}
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

  if (previousMessages) {
    for (const m of previousMessages) {
      messagesForModel.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      });
    }
  }

  messagesForModel.push({ role: 'user', content: body.message });

  await supabase.from('ai_messages').insert({
    session_id: sessionId,
    role: 'user',
    content: body.message,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForModel,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || '';

    const { data: assistantMsg } = await supabase
      .from('ai_messages')
      .insert({ session_id: sessionId, role: 'assistant', content: reply })
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
