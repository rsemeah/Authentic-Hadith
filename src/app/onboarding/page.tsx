'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type UsageIntent = 'daily_reading' | 'study_notes' | 'quick_reference' | null;
type LanguagePreference = 'en' | 'ar';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [usageIntent, setUsageIntent] = useState<UsageIntent>(null);
  const [language, setLanguage] = useState<LanguagePreference>('en');
  const [understood, setUnderstood] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_preference: language }),
      });

      if (!res.ok) {
        setError('Unable to save your preferences right now. Please try again.');
        return;
      }

      router.push('/home');
    } catch (err) {
      console.error('Onboarding save failed', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Onboarding</p>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">Let&apos;s set up your experience.</h1>
        <p className="mt-1 text-sm text-neutral-600">
          A few quick questions to make the app more helpful for you.
        </p>

        <div className="mt-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-neutral-900">How do you want to use this app?</h2>
              <div className="space-y-3">
                {[
                  { key: 'daily_reading' as UsageIntent, title: 'Daily reading', description: 'A calm hadith to read and reflect on each day.' },
                  { key: 'study_notes' as UsageIntent, title: 'Study & notes', description: 'Deeper reading with personal notes and saved references.' },
                  { key: 'quick_reference' as UsageIntent, title: 'Quick reference', description: 'Look up narrations by topic or collection when needed.' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setUsageIntent(option.key)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                      usageIntent === option.key ? 'border-neutral-900 bg-neutral-900/5' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-medium text-neutral-900">{option.title}</div>
                    <div className="mt-1 text-neutral-600">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-neutral-900">Preferred language for the interface?</h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                    language === 'en' ? 'border-neutral-900 bg-neutral-900/5' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-medium text-neutral-900">English</div>
                  <div className="mt-1 text-neutral-600">Default UI language, hadith available in Arabic + English.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                    language === 'ar' ? 'border-neutral-900 bg-neutral-900/5' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-medium text-neutral-900">Arabic (soon)</div>
                  <div className="mt-1 text-neutral-600">Prioritize Arabic UI as we expand language support.</div>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-neutral-900">A gentle, important reminder.</h2>
              <p className="text-sm text-neutral-600">
                This app is for learning and reflection. It is not a source of fatwas or personal rulings. For halal/haram and detailed legal questions, please consult qualified scholars or imams.
              </p>
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                />
                <span>I understand.</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="text-sm text-neutral-500 hover:text-neutral-700 disabled:cursor-default disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={step === 3 ? handleFinish : nextStep}
            disabled={(step === 1 && !usageIntent) || (step === 3 && !understood)}
            className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {step === 3 ? (saving ? 'Saving…' : 'Continue to home') : 'Next'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
