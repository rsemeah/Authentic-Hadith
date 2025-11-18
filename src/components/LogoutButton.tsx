'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        setError('Unable to sign out right now. Please try again.');
        return;
      }

      router.push('/auth');
      router.refresh();
    } catch (err) {
      setError('Something went wrong while signing out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60"
      >
        {loading ? 'Signing out…' : 'Log out'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

