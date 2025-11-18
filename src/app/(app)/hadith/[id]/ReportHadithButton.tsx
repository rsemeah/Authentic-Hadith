'use client';

import { useState } from 'react';

export default function ReportHadithButton({ hadithId }: { hadithId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'hadith_text' | 'translation' | 'other'>('translation');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/report-hadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hadithId, type, description }),
      });
      if (res.ok) {
        setSent(true);
        setDescription('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setSent(false);
        }}
        className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 hover:border-neutral-900"
      >
        Report an issue
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl bg-white p-4 text-xs shadow-lg ring-1 ring-neutral-200">
          {sent ? (
            <p className="text-neutral-600">Thank you for flagging this. Your feedback has been recorded.</p>
          ) : (
            <form className="space-y-3" onSubmit={submitReport}>
              <p className="font-medium text-neutral-900">Report this hadith</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'hadith_text' | 'translation' | 'other')}
                className="w-full rounded-xl border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                <option value="hadith_text">Arabic text</option>
                <option value="translation">Translation</option>
                <option value="other">Other concern</option>
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what seems off or confusing…"
                rows={3}
                className="w-full rounded-xl border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-neutral-500 hover:text-neutral-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !description.trim()}
                  className="rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
