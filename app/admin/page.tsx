import type { AdminOverview as AdminOverviewData } from "@iq/openapi"

import { AdminNav } from "@/components/admin-nav"
import { AdminStatCard } from "@/components/admin-stat-card"
import { LogoutButton } from "@/components/logout-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminOverviewPage() {
  await requireSession("ADMIN")
  const response = await fetchApi<{ overview: AdminOverviewData }>("/api/v1/admin/overview")
  const { overview } = response

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin Overview</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Pantau kesiapan sistem test IQ</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Panel ini saya prioritaskan untuk menjawab satu pertanyaan penting admin: apakah
            bank soal, konfigurasi aktif, user, dan hasil test sudah cukup sehat untuk dipakai
            operasional.
          </p>
        </div>
        <LogoutButton />
      </header>

      <AdminNav />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Soal Published"
          value={overview.questionStats.published}
          hint={`Total bank soal ${overview.questionStats.total}`}
          tone="cyan"
        />
        <AdminStatCard
          label="Peserta Aktif"
          value={overview.userStats.active}
          hint={`Total user ${overview.userStats.total}`}
          tone="emerald"
        />
        <AdminStatCard
          label="Submission"
          value={overview.resultStats.submissionCount}
          hint={`Rata-rata ${overview.resultStats.averagePercentage.toFixed(2)}%`}
          tone="amber"
        />
        <AdminStatCard
          label="Attempt Berjalan"
          value={overview.attemptStats.inProgress}
          hint={`Expired ${overview.attemptStats.expired}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-panel p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Kesehatan Bank Soal</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Cakupan per index</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {overview.questionHealth.map((item) => (
              <div key={item.code} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.code}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{item.label}</div>
                <div className="mt-3 text-sm text-slate-600">
                  {item.published} soal published dari total {item.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Konfigurasi Aktif</p>
          {overview.activeConfig ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Judul test</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">
                  {overview.activeConfig.title}
                </div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Durasi / jumlah soal</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">
                  {overview.activeConfig.durationMinutes} menit / {overview.activeConfig.questionCount} soal
                </div>
              </div>
              <div
                className={[
                  "rounded-[24px] p-5",
                  overview.activeConfig.canStartAttempt
                    ? "bg-emerald-50"
                    : "bg-rose-50",
                ].join(" ")}
              >
                <div className="text-sm text-slate-500">Readiness</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">
                  {overview.activeConfig.canStartAttempt ? "Siap dipakai" : "Perlu perhatian admin"}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-700">
                  {overview.activeConfig.readinessMessage}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada konfigurasi test aktif.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
