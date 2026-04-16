import Link from "next/link"

import type { AttemptResult, AttemptSummary, TestConfigResponse } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function DashboardPage() {
  const user = await requireSession()

  if (user.role === "ADMIN") {
    return (
      <main className="page-shell space-y-6">
        <header className="glass-panel flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin Console</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Kelola seluruh ekosistem test IQ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Anda masuk sebagai admin. Dari sini Anda bisa mengatur bank soal, akun peserta, konfigurasi test aktif,
              dan memantau hasil yang masuk.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/questions", title: "Bank Soal", text: "Tambah, arsipkan, dan susun soal test." },
            { href: "/admin/users", title: "Manajemen User", text: "Buat akun peserta dan admin baru." },
            { href: "/admin/results", title: "Hasil Test", text: "Pantau skor peserta yang sudah submit." },
            { href: "/admin/settings", title: "Test Aktif", text: "Atur durasi dan jumlah soal." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass-panel rounded-[28px] p-6 transition hover:-translate-y-0.5"
            >
              <div className="text-lg font-semibold text-slate-950">{item.title}</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
            </Link>
          ))}
        </section>
      </main>
    )
  }

  const [currentAttemptRes, latestResultRes, configRes] = await Promise.all([
    fetchApi<{ attempt: AttemptSummary | null }>("/api/v1/test-attempts/current"),
    fetchApi<{ attempt: AttemptResult | null }>("/api/v1/results/me/latest"),
    fetchApi<{ config: TestConfigResponse | null }>("/api/v1/test-config/active"),
  ])

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Dashboard Peserta</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Selamat datang, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Anda bisa memulai test IQ, melanjutkan attempt yang masih aktif, atau melihat estimasi IQ screening dan hasil per index setelah submit.
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Test Aktif</div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            {configRes.config?.title ?? "Simulasi Test IQ"}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Durasi</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {configRes.config?.durationMinutes ?? 30} menit
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Jumlah soal</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {configRes.config?.questionCount ?? 10}
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Mode hasil</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">4 index + IQ</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StartTestButton currentAttemptId={currentAttemptRes.attempt?.id} />
            <Link
              href="/test/start"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Lihat instruksi
            </Link>
          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-600">Status Anda</div>
          <div className="mt-4 space-y-4">
            <div className="rounded-[24px] bg-cyan-50 p-5">
              <div className="text-sm text-cyan-700">Attempt aktif</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {currentAttemptRes.attempt ? `#${currentAttemptRes.attempt.id}` : "Belum ada"}
              </div>
            </div>
            <div className="rounded-[24px] bg-amber-50 p-5">
              <div className="text-sm text-amber-700">Hasil terakhir</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {latestResultRes.attempt?.estimatedIq != null
                  ? `IQ ${latestResultRes.attempt.estimatedIq}`
                  : "Belum ada hasil"}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {latestResultRes.attempt?.classificationLabel ?? "Menunggu submit test"}
              </div>
            </div>
          </div>
          <Link
            href="/result"
            className="mt-6 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            Buka halaman hasil
          </Link>
        </div>
      </section>
    </main>
  )
}
