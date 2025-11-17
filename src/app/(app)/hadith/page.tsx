import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

type SearchParams = {
  q?: string;
  collection?: string;
  topic?: string;
};

export default async function HadithPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient();
  const q = searchParams.q?.trim();
  const collection = searchParams.collection?.trim();
  const topic = searchParams.topic?.trim();

  let query = supabase
    .from('hadith')
    .select('id, collection, book_number, hadith_number, arabic_text, english_text, topic_tags, reference')
    .order('created_at', { ascending: false })
    .limit(30);

  if (q) {
    query = query.or(`english_text.ilike.%${q}%,arabic_text.ilike.%${q}%`);
  }
  if (collection) {
    query = query.ilike('collection', `%${collection}%`);
  }
  if (topic) {
    query = query.contains('topic_tags', [topic]);
  }

  const { data: hadithList } = await query;

  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Search</p>
        <h1 className="text-xl font-semibold text-neutral-900">Find narrations</h1>
        <p className="text-sm text-neutral-600">Filter by keyword, collection, or topic tag.</p>
      </header>

      <form className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 md:grid-cols-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search Arabic or English text"
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <input
          name="collection"
          defaultValue={collection}
          placeholder="Collection (e.g., Bukhari)"
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <input
          name="topic"
          defaultValue={topic}
          placeholder="Topic tag (e.g., intentions)"
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Search
          </button>
        </div>
      </form>

      <section className="space-y-4">
        {(hadithList || []).map((h) => (
          <article
            key={h.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 transition hover:ring-neutral-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <span>{h.collection}</span>
              <span>
                Book {h.book_number ?? '–'} · Hadith {h.hadith_number ?? '–'}
              </span>
            </div>
            <div className="arabic mt-3 text-right text-base">{h.arabic_text.slice(0, 180)}…</div>
            <p className="mt-2 text-sm text-neutral-800">{h.english_text.slice(0, 220)}…</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
              {h.reference && <span className="rounded-full bg-neutral-100 px-3 py-1">{h.reference}</span>}
              {Array.isArray(h.topic_tags) &&
                h.topic_tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1">
                    {tag}
                  </span>
                ))}
              <Link
                href={`/hadith/${h.id}`}
                className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-800 hover:border-neutral-900"
              >
                View details
              </Link>
            </div>
          </article>
        ))}

        {(hadithList || []).length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
            No results yet. Try another keyword or clear filters.
          </p>
        )}
      </section>
    </div>
  );
}
