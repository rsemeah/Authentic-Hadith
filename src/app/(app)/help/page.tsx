'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Is this app giving fatwas?',
    answer:
      'No. The assistant and content are for learning and reflection. For halal/haram rulings, please consult qualified scholars.',
  },
  {
    question: 'Which collections are included?',
    answer: 'We prioritize authentic collections such as Sahih al-Bukhari and Sahih Muslim with trusted translations.',
  },
  {
    question: 'Can I export my saved hadith?',
    answer: 'Yes. Go to Settings → Export saved hadith to download your saved list as JSON.',
  },
];

export default function HelpPage() {
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSending(true);
    await fetch('/api/report-hadith', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'other', description }),
    });
    setSent(true);
    setDescription('');
    setSending(false);
  };

  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Help</p>
        <h1 className="text-xl font-semibold text-neutral-900">Frequently asked questions</h1>
        <p className="text-sm text-neutral-600">Quick answers and a way to reach us if something seems off.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
            <p className="text-sm font-semibold text-neutral-900">{item.question}</p>
            <p className="mt-1 text-sm text-neutral-600">{item.answer}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Send feedback</h2>
          <p className="text-sm text-neutral-600">Flag an issue or ask for help and we will review it.</p>
        </div>
        {sent ? (
          <p className="text-sm text-green-700">Thank you for your feedback.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you need help with…"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !description.trim()}
                className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
