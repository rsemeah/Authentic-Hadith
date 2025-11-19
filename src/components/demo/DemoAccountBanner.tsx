'use client';

interface DemoAccountBannerProps {
  onDismiss?: () => void;
}

export function DemoAccountBanner({ onDismiss }: DemoAccountBannerProps) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-neutral-900/5 p-3 text-xl">✨</div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">demo account</p>
            <h2 className="text-lg font-semibold text-neutral-900">
              Explore the premium job discovery workspace
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Sign in with the demo account to try every feature — curated feeds, saved searches, and deep role
              insights.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm font-medium">
          <code className="rounded-full border border-neutral-200 px-4 py-1 text-neutral-900">demo@calmjobs.dev</code>
          <code className="rounded-full border border-neutral-200 px-4 py-1 text-neutral-900">calm-demo-2024</code>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2 font-semibold text-white shadow-sm hover:bg-neutral-800"
          onClick={() => navigator.clipboard?.writeText('demo@calmjobs.dev / calm-demo-2024')}
        >
          Copy credentials
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          I already have access
        </button>
      </div>
    </section>
  );
}

export default DemoAccountBanner;
