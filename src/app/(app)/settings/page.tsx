import { createServerSupabaseClient } from '@/lib/SupabaseServer';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('name, language_preference').eq('id', user.id).maybeSingle();
  
  const profileData = profile as { name?: string; language_preference?: string } | null;

  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Settings</p>
        <h1 className="text-xl font-semibold text-neutral-900">Your preferences</h1>
        <p className="text-sm text-neutral-600">Update your profile, export saved hadith, or delete your account.</p>
      </header>
      <SettingsClient initialProfile={{
        name: profileData?.name ?? '',
        language_preference: profileData?.language_preference ?? 'en',
      }} />
    </div>
  );
}
