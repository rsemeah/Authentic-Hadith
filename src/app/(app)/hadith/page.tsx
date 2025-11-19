import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/SupabaseServer';

type SearchParams = {
  q?: string;
  collection?: string;
  topic?: string;
  page?: string;
};

const pageSize = 20;

export default async function HadithPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient();
  const q = searchParams.q?.trim();
  const collection = searchParams.collection?.trim();
  const topic = searchParams.topic?.trim();
  const page = Math.max(Number(searchParams.page) || 1, 1);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('hadith')
    .select('id, collection, book_number, hadith_number, arabic_text, english_text, topic_tags, reference', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  /*
    Index recommendations (run manually in Supabase DB console):
    - CREATE INDEX hadith_english_text_lower_idx ON hadith (lower(english_text));
    - CREATE INDEX hadith_arabic_text_lower_idx ON hadith (lower(arabic_text));
    - CREATE INDEX hadith_topic_tags_gin ON hadith USING GIN (topic_tags);

    These improve case-insensitive text searches and filtering on topic tags.
  */

  if (q) {
    query = query.or(`english_text.ilike.%${q}%,arabic_text.ilike.%${q}%`);
  }
  if (collection) {
    query = query.ilike('collection', `%${collection}%`);
  }
  if (topic) {
    query = query.contains('topic_tags', [topic]);
  }

  const { data: hadithList, error, count } = await query;

  if (error) {
    console.error('Error fetching hadith list', error);
  }

  const totalCount = count ?? 0;

  const buildSearchParams = (pageValue: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (collection) params.set('collection', collection);
    if (topic) params.set('topic', topic);
    params.set('page', String(pageValue));
    return params.toString();
  };

  const hasNextPage = page * pageSize < totalCount;

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
        <input type="hidden" name="page" value="1" />
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
        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Something went wrong loading hadith. Please try again.
          </p>
        )}

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

        {(hadithList || []).length === 0 && !error && (
          <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
            {q || collection || topic
              ? 'No hadith matched this search. Try a simpler keyword or another collection.'
              : 'No hadith found yet. Try adding a keyword or filter.'}
          </p>
        )}

        {totalCount > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
            <span>
              Showing {Math.min(to + 1, totalCount)} of {totalCount} hadith
            </span>
            <div className="flex items-center gap-2">
              <Link
                aria-disabled={page === 1}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  page === 1
                    ? 'cursor-not-allowed border-neutral-200 text-neutral-300'
                    : 'border-neutral-300 text-neutral-800 hover:border-neutral-900'
                }`}
                href={`?${buildSearchParams(Math.max(page - 1, 1))}`}
              >
                Previous
              </Link>
              <Link
                aria-disabled={!hasNextPage}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  hasNextPage
                    ? 'border-neutral-300 text-neutral-800 hover:border-neutral-900'
                    : 'cursor-not-allowed border-neutral-200 text-neutral-300'
                }`}
                href={`?${buildSearchParams(hasNextPage ? page + 1 : page)}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
