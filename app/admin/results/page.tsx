import type { AdminResultSummary } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminResultsPage() {
  await requireSession("ADMIN")
  const response = await fetchApi<{ results: AdminResultSummary[] }>("/api/v1/admin/results")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Results</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Pantau hasil pengerjaan peserta</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Result feed</h2>
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
              </tr>
            </thead>
            <tbody>
              {response.results.map((row, index) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
