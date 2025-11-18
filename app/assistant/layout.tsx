export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-neutral-50 p-4">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  )
}
