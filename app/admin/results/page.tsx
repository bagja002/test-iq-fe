import type { AdminOverview, AdminResultSummary } from "@iq/openapi"

import { AdminNav } from "@/components/admin-nav"
import { AdminStatCard } from "@/components/admin-stat-card"
import { LogoutButton } from "@/components/logout-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { readSearchParam } from "@/lib/search-params"

interface AdminResultsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminResultsPage({ searchParams }: AdminResultsPageProps) {
  await requireSession("ADMIN")

  const params = await searchParams
  const q = readSearchParam(params.q)
  const query = new URLSearchParams()
  if (q) query.set("q", q)

  const [resultRes, overviewRes] = await Promise.all([
    fetchApi<{ results: AdminResultSummary[] }>(
      `/api/v1/admin/results${query.toString() ? `?${query.toString()}` : ""}`,
    ),
    fetchApi<{ overview: AdminOverview }>("/api/v1/admin/overview"),
  ])

  const overview = overviewRes.overview

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Results</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Pantau hasil pengerjaan peserta</h1>
        </div>
        <LogoutButton />
      </header>

      <AdminNav />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total Submission"
          value={overview.resultStats.submissionCount}
          tone="cyan"
        />
        <AdminStatCard
          label="Rata-rata Skor"
          value={`${overview.resultStats.averagePercentage.toFixed(2)}%`}
          tone="amber"
        />
        <AdminStatCard
          label="IQ Tertinggi"
          value={overview.resultStats.highestEstimatedIq}
          tone="emerald"
        />
        <AdminStatCard
          label="Attempt Berjalan"
          value={overview.attemptStats.inProgress}
          hint="Peserta yang belum selesai"
        />
      </section>

      <section className="glass-panel p-6">
        <form className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari peserta atau email..."
            className="form-control"
          />
          <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            Cari Hasil
          </button>
        </form>
      </section>

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Result feed</h2>
          <p className="mt-2 text-sm text-slate-600">
            Saya tambahkan pencarian cepat agar admin bisa langsung melompat ke peserta tertentu saat seleksi berjalan.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Peserta</th>
                <th className="px-6 py-4 font-medium">IQ</th>
                <th className="px-6 py-4 font-medium">Klasifikasi</th>
                <th className="px-6 py-4 font-medium">Skor</th>
                <th className="px-6 py-4 font-medium">Persentase</th>
                <th className="px-6 py-4 font-medium">Durasi</th>
                <th className="px-6 py-4 font-medium">Submit</th>
              </tr>
            </thead>
            <tbody>
              {resultRes.results.length > 0 ? (
                resultRes.results.map((row, index) => (
                  <tr key={row.attemptId} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-base font-semibold text-slate-950">#{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-950">{row.userName}</div>
                      <div className="text-slate-500">{row.email}</div>
                    </td>
                    <td className="px-6 py-4 text-base font-semibold text-slate-950">{row.estimatedIq}</td>
                    <td className="px-6 py-4 text-slate-700">{row.classificationLabel}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {row.rawScore}/{row.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.percentage}%</td>
                    <td className="px-6 py-4 text-slate-700">{row.durationMinutes} menit</td>
                    <td className="px-6 py-4 text-slate-700">{row.submittedAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-sm text-slate-600">
                    Belum ada hasil yang cocok dengan filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
