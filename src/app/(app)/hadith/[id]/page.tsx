import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import SaveHadithButton from './SaveHadithButton';
import AddNoteForm from './AddNoteForm';
import ReportHadithButton from './ReportHadithButton';
import type { Database } from '@/types/supabase';

type HadithRow = Database['public']['Tables']['hadith']['Row'];
type SavedHadithRow = Database['public']['Tables']['saved_hadith']['Row'];

export default async function HadithDetailPage({
  params,
}: {
  params?: Promise<{ id?: string | string[] }>;
}) {
  const resolvedParams = (await params) ?? {};
  const idValue = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

  if (!idValue) return notFound();

  const hadithId: HadithRow['id'] = idValue as HadithRow['id'];
  const supabase = createServerSupabaseClient() as any;
  const { data: hadith } = await supabase
    .from('hadith')
    .select('id, collection, book_number, hadith_number, arabic_text, english_text, grading, reference, topic_tags')
    .eq('id', hadithId)
    .maybeSingle();

  const hadithRow = hadith as HadithRow | null;

  if (!hadithRow) return notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let savedId: string | null = null;
  let notes: { id: string; content: string; created_at: string }[] = [];

  if (user) {
    const { data: saved } = await supabase
      .from('saved_hadith')
      .select('id')
      .eq('user_id', user.id)
      .eq('hadith_id', hadithRow.id)
      .maybeSingle();
    const savedRow = saved as SavedHadithRow | null;
    savedId = savedRow?.id ?? null;

    const { data: userNotes } = await supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('hadith_id', hadithRow.id)
      .order('created_at', { ascending: false });
    notes = userNotes || [];
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Hadith</p>
          <h1 className="text-xl font-semibold text-neutral-900">{hadithRow.collection}</h1>
          <p className="text-sm text-neutral-600">
            Book {hadithRow.book_number ?? '–'} · Hadith {hadithRow.hadith_number ?? '–'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {user ? <SaveHadithButton hadithId={hadithRow.id} initialSavedId={savedId} /> : null}
          <ReportHadithButton hadithId={hadithRow.id} />
        </div>
      </div>

      <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
        <div className="arabic text-right text-lg leading-9">{hadithRow.arabic_text}</div>
        <p className="text-sm text-neutral-800">{hadithRow.english_text}</p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
          {hadithRow.reference && <span className="rounded-full bg-neutral-100 px-3 py-1">{hadithRow.reference}</span>}
          {hadithRow.grading && <span className="rounded-full bg-neutral-100 px-3 py-1">{hadithRow.grading}</span>}
          {Array.isArray(hadithRow.topic_tags) &&
            hadithRow.topic_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1">
                {tag}
              </span>
            ))}
        </div>
      </article>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={`/assistant?hadithId=${hadithRow.id}`}
          className="rounded-full border border-neutral-200 px-4 py-2 font-medium text-neutral-800 hover:border-neutral-900"
        >
          Ask the assistant about this hadith
        </Link>
        <Link
          href="/hadith"
          className="rounded-full border border-neutral-200 px-4 py-2 font-medium text-neutral-800 hover:border-neutral-900"
        >
          Back to search
        </Link>
      </div>

      {user && (
        <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Notes</h2>
            <span className="text-xs text-neutral-500">Only you can see these</span>
          </div>
          <AddNoteForm hadithId={hadithRow.id} />
          <ul className="space-y-2 text-sm text-neutral-700">
            {notes.length === 0 && <li className="text-neutral-500">No notes yet.</li>}
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl bg-neutral-50 p-3">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="mt-1 text-[11px] text-neutral-500">{new Date(note.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
