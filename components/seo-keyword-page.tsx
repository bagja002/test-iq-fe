import Link from "next/link"

interface SeoKeywordPageProps {
  badge: string
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
  }>
}

export function SeoKeywordPage({ badge, title, description, sections }: SeoKeywordPageProps) {
  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel overflow-hidden p-8 md:p-12">
        <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
          {badge}
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-2xl bg-slate-950 px-6 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-6 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            Masuk ke Platform
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel p-8 md:p-10">
        <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Internal Link</div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/to-kdmp" className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
            TO KDMP
          </Link>
          <Link href="/try-out-knmp" className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
            Try Out KNMP
          </Link>
          <Link href="/koperasi-desa-merah-putih" className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
            Koperasi Desa Merah Putih
          </Link>
          <Link href="/koperasi-nelayan-merah-putih" className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
            Koperasi Nelayan Merah Putih
          </Link>
        </div>
      </section>
    </main>
  )
}
