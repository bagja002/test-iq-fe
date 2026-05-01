import type { AdminOverview, TestConfigResponse } from "@/lib/api-types"

import { AdminNav } from "@/components/admin-nav"
import { AdminStatCard } from "@/components/admin-stat-card"
import { LogoutButton } from "@/components/logout-button"
import { TestConfigForm } from "@/components/test-config-form"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminSettingsPage() {
  await requireSession("ADMIN")
  const [configRes, overviewRes] = await Promise.all([
    fetchApi<{ configs: TestConfigResponse[] }>("/api/v1/admin/test-config"),
    fetchApi<{ overview: AdminOverview }>("/api/v1/admin/overview"),
  ])

  const configs = configRes.configs ?? []
  const iqConfig = configs.find((item) => item.testType === "IQ") ?? null
  const skbConfigs = configs.filter((item) => item.testType === "SKB")
  const activeConfig = overviewRes.overview.activeConfig

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Settings</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Atur IQ dan kamar SKB</h1>
        </div>
        <LogoutButton />
      </header>

      <AdminNav />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Config aktif"
          value={configs.length}
          tone="cyan"
        />
        <AdminStatCard
          label="Kamar SKB"
          value={skbConfigs.length}
          tone="amber"
        />
        <AdminStatCard
          label="Published tersedia"
          value={overviewRes.overview.questionStats.published}
          tone="emerald"
        />
        <AdminStatCard
          label="Readiness IQ"
          value={activeConfig?.canStartAttempt ? "Siap" : "Perlu cek"}
          hint={activeConfig?.readinessMessage ?? "Belum ada konfigurasi IQ aktif"}
        />
      </section>

      {configs.length > 0 ? (
        <section className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-600">Konfigurasi Aktif</div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {configs.map((config) => (
              <article key={config.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {config.testType} {config.roomLabel ? `· ${config.roomLabel}` : ""}
                </div>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{config.title}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Durasi</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">
                      {config.durationMinutes} menit
                    </div>
                  </div>
                  <div className="rounded-[20px] bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Soal</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">
                      {config.questionCount}
                    </div>
                  </div>
                </div>
                {config.sections?.length ? (
                  <div className="mt-4 grid gap-2">
                    {config.sections.map((section) => (
                      <div key={section.questionIndex} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <span className="font-medium text-slate-700">{section.questionIndex}</span>
                        <span className="text-slate-500">
                          {section.questionCount} soal / {section.durationMinutes} menit
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <TestConfigForm
          config={iqConfig}
          testType="IQ"
          title="Konfigurasi IQ"
          description="Atur jumlah soal dan waktu untuk tiap bagian IQ. Default baru: VCI 50/40 menit, WMI 40/30 menit, PSI 20/15 menit, PRI 20/15 menit."
        />
        {[
          { code: "MANAJER_KOPERASI_KDMP", label: "Manajer Kopreasi (KDMP)" },
          { code: "MANAGER_OPERASIONAL_KNMP", label: "Manager Operesial (KNMP)" },
          { code: "KEPALA_PRODUKSI", label: "Kepala Produksi (KNMP)" },
          { code: "PENGELOLA_KEUANGAN", label: "Pengelola Keuangan (KNMP)" },
          { code: "PENJAMIN_MUTU", label: "Penjamin Mutu (KNMP)" },
        ].map((room) => (
          <TestConfigForm
            key={room.code}
            config={skbConfigs.find((item) => item.roomCode === room.code) ?? null}
            testType="SKB"
            roomCode={room.code}
            roomLabel={room.label}
            title={`Kamar SKB ${room.label}`}
            description={`Atur jumlah soal dan waktu untuk kamar SKB jabatan ${room.label}. Default baru: 50 soal dengan waktu 60 menit.`}
          />
        ))}
      </div>
    </main>
  )
}
