import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { createServerSupabaseClient } from '@/lib/SupabaseServer';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/hadith', label: 'Hadith' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/saved', label: 'Saved' },
  { href: '/settings', label: 'Settings' },
  { href: '/help', label: 'Help' },
  { href: '/sources', label: 'Sources' },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle();
  const displayName = (profile as { name?: string } | null)?.name || user.email || 'Friend';

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-neutral-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Authentic Hadith</h1>
          <p className="text-sm text-neutral-600">As-salāmu ʿalaykum, {displayName}.</p>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
