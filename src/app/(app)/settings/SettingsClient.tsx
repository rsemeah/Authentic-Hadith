'use client';

import { useState } from 'react';

interface SettingsClientProps {
  initialProfile: { name: string; language_preference: string };
}

export default function SettingsClient({ initialProfile }: SettingsClientProps) {
  const [name, setName] = useState(initialProfile.name);
  const [language, setLanguage] = useState(initialProfile.language_preference || 'en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, language_preference: language }),
      });
      if (res.ok) setMessage('Profile updated.');
    } finally {
      setSaving(false);
    }
  };

  const exportSaved = async () => {
    setExporting(true);
    setExportData(null);
    const res = await fetch('/api/export-saved');
    if (res.ok) {
      const data = await res.json();
      setExportData(JSON.stringify(data, null, 2));
    }
    setExporting(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Delete your account and all associated data?')) return;
    setDeleting(true);
    await fetch('/api/delete-account', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
          <p className="text-sm text-neutral-600">Update your display name and language preference.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-800">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-800">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {message && <p className="text-xs text-green-700">{message}</p>}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Export saved hadith</h2>
          <p className="text-sm text-neutral-600">Download your saved list as JSON for your own archive.</p>
        </div>
        <button
          type="button"
          onClick={exportSaved}
          disabled={exporting}
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {exporting ? 'Preparing…' : 'Export as JSON'}
        </button>
        {exportData && (
          <textarea
            readOnly
            value={exportData}
            rows={8}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700"
          />
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Danger zone</h2>
          <p className="text-sm text-neutral-600">Delete your account and all associated data.</p>
        </div>
        <button
          type="button"
          onClick={deleteAccount}
          disabled={deleting}
          className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 hover:border-red-400"
        >
          {deleting ? 'Deleting…' : 'Delete account'}
        </button>
      </section>
    </div>
  );
}
