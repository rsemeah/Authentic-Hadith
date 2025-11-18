import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  hadith?: {
    id: string;
    collection: string | null;
    book_number: number | null;
    hadith_number: number | null;
    reference: string | null;
    english_text: string | null;
    arabic_text: string | null;
  } | null;
}

export default async function ReflectPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notes } = await supabase
    .from('notes')
    .select(
      'id, content, created_at, hadith:hadith(id, collection, book_number, hadith_number, reference, english_text, arabic_text)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const items = (notes as NoteRow[] | null) || [];

  const formatReference = (note: NoteRow) => {
    const h = note.hadith;
    if (!h) return 'Hadith';
    if (h.reference) return h.reference;
    return `${h.collection ?? 'Collection'} · Book ${h.book_number ?? '–'} · Hadith ${h.hadith_number ?? '–'}`;
  };

  const formatSnippet = (note: NoteRow) => {
    const h = note.hadith;
    const snippet = h?.english_text || h?.arabic_text || '';
    return snippet.length > 160 ? `${snippet.slice(0, 160)}…` : snippet;
  };

  return (
    <div className="space-y-6 py-4">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Reflect</p>
        <h1 className="text-xl font-semibold text-neutral-900">Your notes across hadith</h1>
        <p className="mt-1 text-sm text-neutral-600">
          A private space to revisit reflections and see them alongside the narrations that inspired them.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
          You haven&apos;t written any notes yet. As you read, add reflections to keep them together here.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((note) => (
            <li key={note.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-600">{formatReference(note)}</p>
                  <p className="text-sm text-neutral-700">{formatSnippet(note) || 'Hadith details unavailable'}</p>
                </div>
                {note.hadith?.id && (
                  <Link
                    href={`/hadith/${note.hadith.id}`}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Open hadith
                  </Link>
                )}
              </div>
              <div className="mt-3 space-y-1 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-800">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="text-[11px] text-neutral-500">{new Date(note.created_at).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
