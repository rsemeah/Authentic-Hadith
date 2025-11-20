import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/SupabaseServer';
import SaveHadithButton from './SaveHadithButton';
import AddNoteForm from './AddNoteForm';
import ReportHadithButton from './ReportHadithButton';

interface HadithDetailPageProps {
  params: { id: string };
}

export default async function HadithDetailPage({ params }: HadithDetailPageProps) {
  const supabase = createServerSupabaseClient();
  const { data: hadith } = await supabase
    .from('hadith')
    .select('id, collection, book_number, hadith_number, arabic_text, english_text, grading, reference, topic_tags')
    .eq('id', params.id)
    .maybeSingle();

  if (!hadith) return notFound();

  // Type assertion after null check
  const hadithData = hadith as {
    id: string;
    collection: string | null;
    book_number: number | null;
    hadith_number: number | null;
    arabic_text: string | null;
    english_text: string | null;
    grading: string | null;
    reference: string | null;
    topic_tags: string[] | null;
  };

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
      .eq('hadith_id', hadithData.id)
      .maybeSingle();
    savedId = (saved as { id: string } | null)?.id ?? null;

    const { data: userNotes } = await supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('hadith_id', hadithData.id)
      .order('created_at', { ascending: false });
    notes = (userNotes as { id: string; content: string; created_at: string }[]) || [];
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Hadith</p>
          <h1 className="text-xl font-semibold text-neutral-900">{hadithData.collection}</h1>
          <p className="text-sm text-neutral-600">
            Book {hadithData.book_number ?? '–'} · Hadith {hadithData.hadith_number ?? '–'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {user ? <SaveHadithButton hadithId={hadithData.id} initialSavedId={savedId} /> : null}
          <ReportHadithButton hadithId={hadithData.id} />
        </div>
      </div>

      <article className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
        <div className="arabic text-right text-lg leading-9">{hadithData.arabic_text}</div>
        <p className="text-sm text-neutral-800">{hadithData.english_text}</p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
          {hadithData.reference && <span className="rounded-full bg-neutral-100 px-3 py-1">{hadithData.reference}</span>}
          {hadithData.grading && <span className="rounded-full bg-neutral-100 px-3 py-1">{hadithData.grading}</span>}
          {Array.isArray(hadithData.topic_tags) &&
            hadithData.topic_tags.map((tag: string) => (
              <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1">
                {tag}
              </span>
            ))}
        </div>
      </article>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={`/assistant?hadithId=${hadithData.id}`}
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
          <AddNoteForm hadithId={hadithData.id} />
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
