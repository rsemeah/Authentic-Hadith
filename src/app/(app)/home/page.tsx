import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/SupabaseServer';

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: hadith } = await supabase
    .from('hadith')
    .select('id, arabic_text, english_text, collection, book_number, hadith_number, reference')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Today&apos;s focus</p>
        <h1 className="text-xl font-semibold text-neutral-900">A calm hadith to sit with</h1>
        <p className="text-sm text-neutral-600">
          Pause with a narration, reflect gently, and come back whenever you like.
        </p>
      </header>

      {hadith ? (
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
            <span>{hadith.collection}</span>
            <span>
              Book {hadith.book_number ?? '–'} · Hadith {hadith.hadith_number ?? '–'}
            </span>
          </div>
          <div className="arabic mt-3 text-right text-lg">{hadith.arabic_text}</div>
          <p className="mt-3 text-sm text-neutral-800">{hadith.english_text}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-600">
            {hadith.reference && <span className="rounded-full bg-neutral-100 px-3 py-1">{hadith.reference}</span>}
            <Link
              href={`/hadith/${hadith.id}`}
              className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-800 hover:border-neutral-900"
            >
              Open details
            </Link>
            <Link
              href={`/assistant?hadithId=${hadith.id}`}
              className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-800 hover:border-neutral-900"
            >
              Ask the assistant
            </Link>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
          No hadith available yet. Seed your database to see today&apos;s focus.
        </div>
      )}

      <section className="grid gap-3 md:grid-cols-2">
        {[ 
          { title: 'Browse narrations', description: 'Search by topic, collection, or keyword.', href: '/hadith' },
          { title: 'Assistant', description: 'Ask about wording, themes, or simple summaries.', href: '/assistant' },
          { title: 'Saved list', description: 'Find hadith you have saved to revisit.', href: '/saved' },
          { title: 'Intentions', description: 'Explore narrations on sincerity and intentions.', href: '/hadith?q=intention' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 transition hover:ring-neutral-200"
          >
            <p className="text-sm font-semibold text-neutral-900">{card.title}</p>
            <p className="mt-1 text-sm text-neutral-600">{card.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
