import Link from "next/link"
import { redirect } from "next/navigation"

import type { AttemptResult, AttemptSummary, TestConfigResponse } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { UpgradeProDialog } from "@/components/upgrade-pro-dialog"
import { getAccountBadgeLabel, hasPaidAccess } from "@/lib/account-types"
import { getSKBRoomCodeForPosition } from "@/lib/positions"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { IQ_TOTAL_QUESTION_COUNT, SKB_QUESTION_COUNT_PER_JABATAN, FREE_IQ_QUESTION_LIMIT } from "@/lib/test-rules"

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
  const iqQuestionCount = isPaidAccount ? IQ_TOTAL_QUESTION_COUNT : FREE_IQ_QUESTION_LIMIT
  const skbConfigCount = (allConfigRes.configs ?? []).filter((item) => item.testType === "SKB").length
  const hasMappedSKBRoom = Boolean(getSKBRoomCodeForPosition(user.position))

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Dashboard Peserta</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Selamat datang, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Silakan pilih jenis test yang ingin dikerjakan. Test IQ dan SKB dipisah, dan SKB sekarang langsung mengikuti jabatan yang tersimpan di akun Anda.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              Status akun {getAccountBadgeLabel(user.accountType)}
            </p>
            {!isPaidAccount ? (
              <UpgradeProDialog
                triggerLabel="Upgrade Akun Jadi Pro"
                className="h-10 rounded-2xl px-5"
              />
            ) : null}
          </div>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Opsi 1</div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Test IQ</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isPaidAccount
              ? "Kerjakan test IQ sesuai alur 4 index seperti biasa. Hasil akan menampilkan skor dan estimasi IQ screening."
              : "Akun gratis hanya mendapat preview Test IQ sebanyak 2 soal. Upgrade akun untuk membuka seluruh paket soal IQ."}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Durasi</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {iqConfig?.durationMinutes ?? 0} menit
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Jumlah soal</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {iqQuestionCount}
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Status</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {iqAttemptRes.attempt ? `Attempt #${iqAttemptRes.attempt.id}` : "Belum mulai"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StartTestButton
              currentAttemptId={iqAttemptRes.attempt?.id}
              testType="IQ"
              label="Pilih Test IQ"
            />
            <Link
              href="/result?testType=IQ"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              {iqResultRes.attempt ? "Lihat hasil IQ" : "Buka hasil IQ"}
            </Link>
          </div>
        </article>

        <article className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-emerald-600">Opsi 2</div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Test SKB</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isPaidAccount
              ? "Setelah memilih SKB, sistem akan langsung membuka kamar sesuai jabatan akun Anda. Soal yang tampil mengikuti posisi yang diampu."
              : "SKB hanya terbuka untuk akun PRO atau MAX. Setelah akun di-upgrade, Anda bisa langsung mengerjakan SKB penuh."}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Jabatan akun</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {user.position || "Belum diisi"}
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Langkah berikutnya</div>
              <div className="mt-2 text-xl font-semibold text-slate-950">{SKB_QUESTION_COUNT_PER_JABATAN} soal per jabatan</div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                {isPaidAccount
                  ? hasMappedSKBRoom
                    ? `Sistem menyiapkan 1 kamar SKB dari ${skbConfigCount} jabatan yang tersedia.`
                    : "Jabatan akun Anda belum terhubung ke kamar SKB."
                  : "Upgrade akun untuk membuka SKB penuh."}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={isPaidAccount ? "/test/start?testType=SKB" : "/dashboard"}
              aria-disabled={!isPaidAccount}
              className={`inline-flex h-12 items-center rounded-2xl px-5 text-sm font-medium transition ${
                isPaidAccount
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              {isPaidAccount ? "Pilih Test SKB" : "SKB Terkunci"}
            </Link>
            <Link
              href="/result?testType=SKB"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Lihat hasil SKB
            </Link>
          </div>
        </article>
      </section>
    </main>
  )
}
