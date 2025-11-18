import { createServerSupabaseClient } from '@/lib/supabaseServer';
import AssistantClient, { HadithContext } from './AssistantClient';

interface AssistantPageProps {
  searchParams: { hadithId?: string };
}

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const supabase = createServerSupabaseClient();
  const hadithId = typeof searchParams.hadithId === 'string' ? searchParams.hadithId : undefined;

  let hadithContext: HadithContext | null = null;
  if (hadithId) {
    const { data: hadith } = await supabase
      .from('hadith')
      .select('id, collection, book_number, hadith_number, arabic_text, english_text, reference')
      .eq('id', hadithId)
      .maybeSingle();

    if (hadith) {
      hadithContext = hadith as HadithContext;
    }
  }

  return <AssistantClient initialHadithId={hadithId} hadithContext={hadithContext} />;
}
