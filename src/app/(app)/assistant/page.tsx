'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  aiMessageId?: string;
}

export default function AssistantPage() {
  const searchParams = useSearchParams();
  const initialHadithId = searchParams.get('hadithId') || undefined;

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [hadithId] = useState<string | undefined>(initialHadithId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setError(null);
    setMessages([...messages, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, hadithId, sessionId }),
      });
      if (!res.ok) {
        setError('Something went wrong. Please try again in a moment.');
        setSending(false);
        return;
      }
      const data = await res.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, aiMessageId: data.aiMessageId }]);
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
      <section className="rounded-2xl bg-white p-4 text-xs text-neutral-600 shadow-sm ring-1 ring-neutral-100">
        <p className="font-medium text-neutral-900">Important reminder</p>
        <p className="mt-1">
          This assistant helps with language, themes, and gentle reflection about hadith.
          It does <span className="font-semibold">not</span> give fatwas or personal rulings. For
          halal/haram and legal decisions, please consult qualified scholars.
        </p>
        {hadithId && (
          <p className="mt-1 text-[11px] text-neutral-500">
            You&apos;re asking about a specific hadith. The system includes it as context when possible.
          </p>
        )}
      </section>

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
