import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col gap-10 py-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
          Authentic Hadith, calmly presented.
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">
          Read, search, and reflect on authentic narrations in Arabic and translation, with a simple
          helper for understanding — not for issuing fatwas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
          >
            Get started free
          </Link>
          <Link href="/auth" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Read</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Browse authentic hadith in Arabic with clear translations and references.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Search</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Find narrations by topic, collection, or reference with a calm, focused search.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Reflect</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Save hadith, jot down personal reflections, and ask simple questions to the assistant.
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900">Sources & methodology</h2>
        <p className="mt-2 text-sm text-neutral-600">
          We focus on authentic collections and trusted translations. This app is for learning and
          reflection only. For rulings and fatwas, please consult qualified scholars.
        </p>
        <Link href="/sources" className="mt-3 inline-flex text-sm font-medium text-neutral-900 hover:underline">
          Learn more
        </Link>
      </section>
    </main>
  );
}
