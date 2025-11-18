import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/lib/supabaseServer';
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
      hadithContext = `Hadith context for this conversation:\nCollection: ${hadith.collection}\nBook: ${hadith.book_number ?? '-'}\nHadith: ${hadith.hadith_number ?? '-'}\nReference: ${hadith.reference ?? '-'}\nArabic: ${hadith.arabic_text}\nEnglish: ${hadith.english_text}`;
    }
  }

  const systemPrompt = `You are a calm, respectful assistant for an app that helps people learn authentic hadith.

What you do:
- Explain wording, themes, and context of hadith.
- Clarify Arabic/English language and phrasing.
- Offer gentle, non-directive reflection prompts.

What you must NOT do:
- Issue fatwas or legal rulings.
- Give personal rulings, halal/haram judgments, or “what should I do?” directives.
- Replace qualified scholars or offer spiritual counseling.

If asked for rulings or personal directives, kindly decline and encourage the user to consult a knowledgeable scholar. You may offer neutral educational framing without declaring a ruling.

Keep language clear, concise, and accessible.`;

  const messagesForModel: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (hadithContext) {
    messagesForModel.push({
      role: 'system',
      content: hadithContext,
    });
  }

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
