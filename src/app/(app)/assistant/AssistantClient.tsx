'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  aiMessageId?: string;
}

export interface HadithContext {
  id: string;
  collection: string;
  book_number: string | null;
  hadith_number: string | null;
  arabic_text: string;
  english_text: string;
  reference: string | null;
}

interface AssistantClientProps {
  initialHadithId?: string;
  hadithContext?: HadithContext | null;
}

export default function AssistantClient({ initialHadithId, hadithContext }: AssistantClientProps) {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [hadithId] = useState<string | undefined>(initialHadithId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(
    initialHadithId ? 'Please explain the wording and themes of this hadith.' : ''
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snippet = useMemo(() => {
    if (!hadithContext) return null;
    const english = hadithContext.english_text || '';
    const arabic = hadithContext.arabic_text || '';
    const englishSnippet = english.length > 220 ? `${english.slice(0, 220)}…` : english;
    const arabicSnippet = arabic.length > 220 ? `${arabic.slice(0, 220)}…` : arabic;
    return { englishSnippet, arabicSnippet };
  }, [hadithContext]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, hadithId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again in a moment.');
        return;
      }
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, aiMessageId: data.aiMessageId },
      ]);
    } catch {
      setError('Something went wrong. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  const flagMessage = async (aiMessageId?: string) => {
    if (!aiMessageId) return;
    const description = prompt('Briefly describe what seems off or concerning about this answer:');
    if (!description) return;

    await fetch('/api/report-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiMessageId, description }),
    });
    alert('Thank you. Your feedback has been recorded.');
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <section className="rounded-2xl bg-white p-4 text-xs text-neutral-700 shadow-sm ring-1 ring-neutral-100">
        <p className="font-semibold text-neutral-900">Assistant focus & boundaries</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Helps with language, themes, and gentle reflection on hadith.</li>
          <li>Does not issue fatwas or personal rulings.</li>
          <li>Please consult qualified scholars for religious guidance.</li>
        </ul>
        {hadithId && (
          <p className="mt-2 text-[11px] text-neutral-500">
            You are asking about a specific hadith. The assistant will include it as context.
          </p>
        )}
      </section>

      {hadithContext && snippet && (
        <section className="rounded-2xl bg-white p-4 text-xs text-neutral-700 shadow-sm ring-1 ring-neutral-100">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Hadith context
              </p>
              <p className="text-sm font-medium text-neutral-900">{hadithContext.collection}</p>
              <p className="text-[11px] text-neutral-600">
                Book {hadithContext.book_number ?? '–'} · Hadith {hadithContext.hadith_number ?? '–'}
              </p>
              {hadithContext.reference && (
                <p className="text-[11px] text-neutral-500">{hadithContext.reference}</p>
              )}
            </div>
            <Link
              href={`/hadith/${hadithContext.id}`}
              className="text-[11px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
            >
              Open full hadith
            </Link>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-right text-[15px] leading-7 text-neutral-900">{snippet.arabicSnippet}</p>
            <p className="text-neutral-800">{snippet.englishSnippet}</p>
          </div>
        </section>
      )}

      <section className="flex min-h-[320px] flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
        <div className="flex-1 space-y-3 overflow-y-auto pb-4 text-sm">
          {messages.length === 0 && (
            <p className="text-neutral-500">
              Ask about wording, themes, or lessons of a hadith, or request a simple summary and reflection prompts.
            </p>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  m.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => flagMessage(m.aiMessageId)}
                    className="mt-1 text-[10px] text-neutral-400 hover:text-neutral-600"
                  >
                    Flag answer
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start text-xs text-neutral-500">
              <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" aria-hidden />
                Thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-neutral-200 pt-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ask about wording, themes, or a simple summary…"
            className="flex-1 resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </section>
    </div>
  );
}
