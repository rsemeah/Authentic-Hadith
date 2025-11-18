export default function Loading() {
  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
      <div className="h-3 w-24 rounded-full bg-neutral-200" />
      <div className="h-4 w-48 rounded-full bg-neutral-200" />
      <div className="space-y-2">
        <div className="h-6 w-full rounded-lg bg-neutral-100" />
        <div className="h-6 w-11/12 rounded-lg bg-neutral-100" />
        <div className="h-6 w-10/12 rounded-lg bg-neutral-100" />
      </div>
      <p className="text-sm text-neutral-500">Loading hadith…</p>
    </div>
  );
}
