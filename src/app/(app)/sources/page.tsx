export default function SourcesPage() {
  return (
    <div className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Sources</p>
        <h1 className="text-xl font-semibold text-neutral-900">Collections & methodology</h1>
        <p className="text-sm text-neutral-600">
          How we approach authentic hadith, translations, and safety for the assistant experience.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900">Collections</h2>
        <p className="text-sm text-neutral-700">
          We prioritize widely accepted authentic collections such as Sahih al-Bukhari, Sahih Muslim, and other rigorously
          verified sources. Each entry includes collection name, book and hadith numbers, and reference details when available.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900">Translations</h2>
        <p className="text-sm text-neutral-700">
          English translations come from trusted publishers where possible. Arabic text is provided alongside translation, with
          the Noto Sans Arabic font for clarity and comfort when reading.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900">Safety & disclaimers</h2>
        <p className="text-sm text-neutral-700">
          The assistant is designed for language and thematic understanding only. It does not issue fatwas or personal rulings.
          For halal/haram decisions and detailed guidance, please consult qualified scholars. Reports on hadith content or AI
          answers are reviewed so we can keep this space trustworthy.
        </p>
      </section>
    </div>
  );
}
