import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/SupabaseServer';

export default async function SavedPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: saved } = await supabase
    .from('saved_hadith')
    .select('id, hadith_id, hadith:hadith(id, collection, english_text, arabic_text)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const items = saved || [];

  return (
    <div className="space-y-6 py-4">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">Saved hadith</h1>
        <p className="mt-1 text-sm text-neutral-600">
          A quiet corner for narrations you want to come back to and keep close.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
          <p className="font-medium text-neutral-700">You haven&apos;t saved any hadith yet.</p>
          <p className="mt-1">When a narration resonates with you, tap “Save” on its page and it will be kept here.</p>
          <Link
            href="/hadith"
            className="mt-3 inline-flex rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
          >
            Browse hadith
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((row) => {
            const h = (row as any).hadith as any;
            if (!h) return null;
            return (
              <li key={row.id}>
                <Link
                  href={`/hadith/${h.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 hover:ring-neutral-200"
                >
                  <div className="arabic mb-2 text-right text-base">{h.arabic_text?.slice(0, 120)}…</div>
                  <p className="text-sm text-neutral-700">{h.english_text?.slice(0, 160)}…</p>
                  <p className="mt-2 text-xs text-neutral-500">{h.collection}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
