import Link from "next/link"

import type { AttemptResult, AttemptSummary, TestConfigResponse, TestType } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { getRuntimeQuestionCount, IQ_QUESTIONS_PER_SECTION } from "@/lib/test-rules"

interface TestStartPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }
  return value ?? ""
}

function buildQuery(testType: TestType, roomCode?: string | null): string {
  const params = new URLSearchParams({ testType })
  if (roomCode) {
    params.set("roomCode", roomCode)
  }
  return params.toString()
}

export default async function TestStartPage({ searchParams }: TestStartPageProps) {
  const user = await requireSession("USER")
  const isPaidAccount = user.accountType === "PAID"

  const params = await searchParams
  const testType = (readParam(params.testType).toUpperCase() || "IQ") as TestType
  const roomCode = readParam(params.roomCode).toUpperCase()
  const isSKB = testType === "SKB"

  if (isSKB && !roomCode) {
    if (!isPaidAccount) {
      return (
        <main className="page-shell space-y-6">
          <header className="glass-panel flex items-end justify-between p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-600">SKB Terkunci</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Upgrade akun untuk membuka SKB</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Akun gratis belum bisa memilih jabatan SKB. Setelah status akun Anda diubah menjadi bayar, semua jabatan SKB akan langsung terbuka.
              </p>
            </div>
            <LogoutButton />
          </header>

          <section className="glass-panel p-8">
            <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="text-sm text-slate-500">Status akun saat ini</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">{user.accountType}</div>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Kembali ke dashboard
            </Link>
          </section>
        </main>
      )
    }

    const configRes = await fetchApi<{ configs: TestConfigResponse[] }>("/api/v1/test-config/active")
    const skbConfigs = (configRes.configs ?? []).filter((item) => item.testType === "SKB")
    const skbCards = await Promise.all(
      skbConfigs.map(async (config) => {
        const query = buildQuery("SKB", config.roomCode)
        const resultRes = await fetchApi<{ attempt: AttemptResult | null }>(
          `/api/v1/results/me/latest?${query}`,
        )

        return {
          config,
          latestResult: resultRes.attempt,
        }
      }),
    )

    return (
      <main className="page-shell space-y-6">
        <header className="glass-panel flex items-end justify-between p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Pilih Jabatan SKB</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Tentukan jabatan Anda</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Soal SKB akan menyesuaikan dengan jabatan yang Anda pilih. Silakan pilih satu posisi di bawah ini.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="glass-panel p-8">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {skbCards.map(({ config, latestResult }) => (
              <article key={config.id} className="rounded-[28px] border border-slate-200 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Jabatan SKB</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  {config.roomLabel ?? config.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{config.title}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Durasi</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">
                      {config.durationMinutes} menit
                    </div>
                  </div>
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Soal</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{getRuntimeQuestionCount("SKB", true)}</div>
                  </div>
                </div>
                <div className="mt-4 rounded-[22px] bg-amber-50 p-4">
                  <div className="text-sm text-amber-700">Nilai terakhir</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {latestResult?.skbScore != null ? latestResult.skbScore : "Belum ada"}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/test/start?${buildQuery("SKB", config.roomCode)}`}
                    className="inline-flex h-12 items-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Pilih Jabatan Ini
                  </Link>
                  <Link
                    href={`/result?${buildQuery("SKB", config.roomCode)}`}
                    className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                  >
                    Lihat Nilai
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Kembali ke dashboard
          </Link>
        </section>
      </main>
    )
  }

  if (isSKB && roomCode && !isPaidAccount) {
    return (
      <main className="page-shell space-y-6">
        <header className="glass-panel flex items-end justify-between p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-600">SKB Terkunci</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Akun gratis belum bisa masuk SKB</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Pilihan jabatan SKB hanya tersedia untuk akun bayar. Silakan kembali ke dashboard atau upgrade akun terlebih dahulu.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="glass-panel p-8">
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Kembali ke dashboard
          </Link>
        </section>
      </main>
    )
  }

  const query = buildQuery(testType, roomCode)
  const [configRes, current] = await Promise.all([
    fetchApi<{ config: TestConfigResponse | null }>(`/api/v1/test-config/active?${query}`),
    fetchApi<{ attempt: AttemptSummary | null }>(`/api/v1/test-attempts/current?${query}`),
  ])

  const config = configRes.config
  const roomName = config?.roomLabel ?? "Kamar SKB"
  const displayedQuestionCount = getRuntimeQuestionCount(testType, isPaidAccount)

  const instructions = isSKB
    ? [
        `Anda akan mengerjakan SKB untuk jabatan ${roomName}.`,
        "Soal yang tampil sudah disesuaikan dengan jabatan yang Anda pilih.",
        "Kerjakan semua soal sampai selesai, lalu submit final untuk melihat hasil jabatan tersebut.",
        "Jawaban tetap tersimpan otomatis ketika Anda memilih opsi atau berpindah soal.",
      ]
    : [
        !isPaidAccount
          ? "Akun gratis hanya membuka preview Test IQ sebanyak 2 soal."
          : `Setelah test dimulai, Anda akan melihat 4 bagian besar: VCI, PRI, WMI, dan PSI, masing-masing ${IQ_QUESTIONS_PER_SECTION} soal.`,
        !isPaidAccount
          ? "Kedua soal preview tetap mengikuti alur bagian yang aktif, lalu hasil bisa langsung dilihat setelah submit."
          : "Setiap bagian dikerjakan satu per satu. Anda harus menekan mulai pada bagian yang aktif sebelum soal tampil.",
        !isPaidAccount
          ? "Upgrade akun akan membuka seluruh paket soal IQ dan akses ke SKB."
          : "Bagian berikutnya tetap terkunci sampai bagian yang sedang aktif disubmit atau waktunya habis.",
        "Setiap bagian memiliki timer sendiri, dan jawaban akan tersimpan otomatis saat Anda memilih opsi atau pindah soal.",
        !isPaidAccount
          ? "Tombol submit tetap muncul di soal terakhir preview."
          : "Tombol submit final baru muncul setelah keempat bagian selesai dikerjakan.",
      ]

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">
            {isSKB ? "Instruksi SKB" : "Instruksi Test IQ"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            {isSKB ? roomName : "Baca sebentar, lalu mulai."}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-8">
          <ol className="grid gap-4">
            {instructions.map((item, index) => (
              <li key={item} className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-sm font-semibold text-cyan-700">Langkah {index + 1}</div>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="glass-panel p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Aksi</div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            {current.attempt ? "Anda punya attempt aktif." : "Siap mulai sekarang?"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {config
              ? `${config.title} • ${config.durationMinutes} menit • ${displayedQuestionCount} soal`
              : "Konfigurasi test belum tersedia."}
          </p>
          <div className="mt-6">
            <StartTestButton
              currentAttemptId={current.attempt?.id}
              testType={testType}
              roomCode={config?.roomCode}
              label={isSKB ? `Mulai SKB ${roomName}` : "Mulai Test IQ"}
            />
          </div>
          <Link
            href={isSKB ? "/test/start?testType=SKB" : "/dashboard"}
            className="mt-4 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            {isSKB ? "Kembali pilih jabatan" : "Kembali ke dashboard"}
          </Link>
        </div>
      </section>
    </main>
  )
}
