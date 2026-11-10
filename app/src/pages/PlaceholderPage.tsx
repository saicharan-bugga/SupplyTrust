export function PlaceholderPage({ title, week }: { title: string; week: number }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        This screen is planned for week {week}.
      </p>
    </div>
  )
}
