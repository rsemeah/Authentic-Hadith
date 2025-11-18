import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Authentic Hadith Assistant
        </h1>
        <p className="text-neutral-600 mb-8">
          Learn and understand hadith through AI-powered conversations with scholarly context.
        </p>
        <Link
          href="/assistant"
          className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition"
        >
          Open Assistant
        </Link>
      </div>
    </main>
  )
}
