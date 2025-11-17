'use client';

import { useState } from 'react';

interface SaveHadithButtonProps {
  hadithId: string;
  initialSavedId: string | null;
}

export default function SaveHadithButton({ hadithId, initialSavedId }: SaveHadithButtonProps) {
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/save-hadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hadithId, savedId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSavedId(data.savedId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={loading}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        savedId ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'border border-neutral-200 text-neutral-800 hover:border-neutral-900'
      }`}
    >
      {savedId ? 'Saved' : 'Save'}
    </button>
  );
}
