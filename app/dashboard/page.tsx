import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BarChart3, Brain, Crown, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"

import type { AttemptResult, AttemptSummary, TestConfigResponse } from "@/lib/api-types"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { UpgradeProDialog } from "@/components/upgrade-pro-dialog"
import { getAccountBadgeLabel, hasPaidAccess } from "@/lib/account-types"
import { getSKBRoomCodeForPosition } from "@/lib/positions"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { getRuntimeQuestionCount } from "@/lib/test-rules"

export default async function DashboardPage() {
  const user = await requireSession()
  const isPaidAccount = hasPaidAccess(user.accountType)

  if (user.role === "ADMIN") {
    redirect("/admin")
  }

  const [iqConfigRes, iqAttemptRes, iqResultRes, allConfigRes] = await Promise.all([
    fetchApi<{ config: TestConfigResponse | null }>("/api/v1/test-config/active?testType=IQ"),
    fetchApi<{ attempt: AttemptSummary | null }>("/api/v1/test-attempts/current?testType=IQ"),
    fetchApi<{ attempt: AttemptResult | null }>("/api/v1/results/me/latest?testType=IQ"),
    fetchApi<{ configs: TestConfigResponse[] }>("/api/v1/test-config/active"),
  ])

  const iqConfig = iqConfigRes.config
  const skbConfigCount = (allConfigRes.configs ?? []).filter((item) => item.testType === "SKB").length
  const skbRoomCode = getSKBRoomCodeForPosition(user.position)
  const skbConfig = (allConfigRes.configs ?? []).find((item) => item.testType === "SKB" && item.roomCode === skbRoomCode) ?? null
  const iqQuestionCount = getRuntimeQuestionCount("IQ", isPaidAccount, iqConfig)
  const hasMappedSKBRoom = Boolean(skbRoomCode)
  const skbHref = isPaidAccount && hasMappedSKBRoom ? "/test/start?testType=SKB" : "/dashboard"
  const accountLabel = getAccountBadgeLabel(user.accountType)

  return (
    <main className="page-shell space-y-5 pb-28 md:space-y-6 md:pb-8">
      <header className="glass-panel flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-600 md:text-sm md:tracking-[0.3em]">
            Dashboard Peserta
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            Hai, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Pilih latihan yang ingin dikerjakan. SKB otomatis mengikuti jabatan akun, jadi Anda tidak perlu memilih room lagi.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
              <ShieldCheck className="size-4" />
              Akun {accountLabel}
            </p>
            {!isPaidAccount ? (
              <UpgradeProDialog
                triggerLabel="Upgrade"
                className="h-10 rounded-2xl px-5"
              />
            ) : null}
          </div>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <UserRound className="size-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Jabatan</div>
              <div className="text-base font-semibold text-slate-950">{user.position || "Belum diisi"}</div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <Brain className="size-5" />
            </div>
            <div>
              <div className="text-sm text-slate-500">IQ hari ini</div>
              <div className="text-base font-semibold text-slate-950">
                {iqAttemptRes.attempt ? "Ada test aktif" : iqResultRes.attempt ? "Hasil tersedia" : "Belum mulai"}
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              {isPaidAccount ? <Crown className="size-5" /> : <LockKeyhole className="size-5" />}
            </div>
            <div>
              <div className="text-sm text-slate-500">Akses SKB</div>
              <div className="text-base font-semibold text-slate-950">
                {isPaidAccount ? (hasMappedSKBRoom ? "Siap dikerjakan" : "Jabatan belum cocok") : "Terkunci"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel p-5 md:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            <Brain className="size-4" />
            Test IQ
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Latihan kognitif</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isPaidAccount
              ? "Kerjakan 4 bagian IQ dengan soal acak dari bank soal. Hasil akan tampil setelah test selesai."
              : "Akun gratis bisa mencoba preview 2 soal. Upgrade membuka test IQ penuh."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
              <div className="text-sm text-slate-500">Durasi</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
                {iqConfig?.durationMinutes ?? 0} menit
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
              <div className="text-sm text-slate-500">Jumlah soal</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
                {iqQuestionCount}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
              <div className="text-sm text-slate-500">Status</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">
                {iqAttemptRes.attempt ? "Sedang berjalan" : "Belum mulai"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <StartTestButton
              currentAttemptId={iqAttemptRes.attempt?.id}
              testType="IQ"
              label="Mulai IQ"
              className="px-5"
            />
            <Link
              href="/result?testType=IQ"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 sm:w-auto"
            >
              <BarChart3 className="size-4" />
              {iqResultRes.attempt ? "Lihat hasil IQ" : "Buka hasil IQ"}
            </Link>
          </div>
        </article>

        <article className="glass-panel p-5 md:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            <ShieldCheck className="size-4" />
            Test SKB
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Sesuai jabatan akun</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isPaidAccount
              ? "Sistem langsung membuka SKB sesuai jabatan. Tidak perlu memilih dari banyak room."
              : "SKB terbuka untuk akun PRO atau MAX. Setelah upgrade, SKB langsung mengikuti jabatan Anda."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
              <div className="text-sm text-slate-500">Jabatan akun</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {user.position || "Belum diisi"}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
              <div className="text-sm text-slate-500">Jumlah soal</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">{skbConfig?.questionCount ?? 50} soal per jabatan</div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                {isPaidAccount
                  ? hasMappedSKBRoom
                    ? `Sistem menyiapkan 1 kamar SKB dari ${skbConfigCount} jabatan yang tersedia.`
                    : "Jabatan akun Anda belum terhubung ke kamar SKB."
                  : "Upgrade akun untuk membuka SKB penuh."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Link
              href={skbHref}
              aria-disabled={!isPaidAccount || !hasMappedSKBRoom}
              className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition sm:w-auto ${
                isPaidAccount && hasMappedSKBRoom
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              {isPaidAccount && hasMappedSKBRoom ? <ArrowRight className="size-4" /> : <LockKeyhole className="size-4" />}
              {isPaidAccount ? (hasMappedSKBRoom ? "Mulai SKB Saya" : "Jabatan Belum Cocok") : "SKB Terkunci"}
            </Link>
            <Link
              href={skbRoomCode ? `/result?testType=SKB&roomCode=${skbRoomCode}` : "/result?testType=SKB"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 sm:w-auto"
            >
              <BarChart3 className="size-4" />
              Lihat hasil SKB
            </Link>
          </div>
        </article>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <Link
            href="/test/start?testType=IQ"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-3 text-sm font-semibold text-white"
          >
            IQ
          </Link>
          <Link
            href={skbHref}
            aria-disabled={!isPaidAccount || !hasMappedSKBRoom}
            className={`inline-flex h-12 items-center justify-center rounded-2xl px-3 text-sm font-semibold ${
              isPaidAccount && hasMappedSKBRoom ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            SKB
          </Link>
          <Link
            href="/result?testType=IQ"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
          >
            Hasil
          </Link>
        </div>
      </nav>
    </main>
  )
}
