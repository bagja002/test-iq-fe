import Link from "next/link"
import { redirect } from "next/navigation"

import type { AttemptSummary, TestConfigResponse, TestType } from "@/lib/api-types"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { hasPaidAccess } from "@/lib/account-types"
import { getSKBRoomCodeForPosition } from "@/lib/positions"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { getIQSectionSummary, getRuntimeQuestionCount } from "@/lib/test-rules"

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
  const isPaidAccount = hasPaidAccess(user.accountType)

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

    const assignedRoomCode = getSKBRoomCodeForPosition(user.position)

    if (assignedRoomCode) {
      redirect(`/test/start?${buildQuery("SKB", assignedRoomCode)}`)
    }

    return (
      <main className="page-shell space-y-6">
        <header className="glass-panel flex items-end justify-between p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Jabatan Belum Cocok</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Akun Anda belum punya kamar SKB</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              SKB sekarang langsung mengikuti jabatan yang tersimpan di akun. Jabatan Anda saat ini belum terhubung ke kamar SKB mana pun.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="glass-panel p-8">
          <div className="rounded-[28px] bg-slate-50 p-6">
            <div className="text-sm text-slate-500">Jabatan akun saat ini</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {user.position || "Belum diisi"}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Silakan perbarui jabatan akun ke salah satu posisi SKB yang tersedia agar peserta bisa langsung masuk ke kamar SKB yang sesuai.
            </p>
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
              Pilihan jabatan SKB hanya tersedia untuk akun PRO atau MAX. Silakan kembali ke dashboard atau upgrade akun terlebih dahulu.
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
  const displayedQuestionCount = getRuntimeQuestionCount(testType, isPaidAccount, config)
  const iqSectionSummary = getIQSectionSummary(config)

  const instructions = isSKB
    ? [
        `Anda akan mengerjakan SKB untuk jabatan ${roomName}.`,
        "Soal yang tampil sudah disesuaikan dengan jabatan yang Anda pilih.",
        "Kerjakan semua soal sampai selesai, lalu submit final untuk melihat hasil jabatan tersebut.",
        "Jawaban tetap tersimpan otomatis ketika Anda memilih opsi atau berpindah soal.",
      ]
    : [
        !isPaidAccount
          ? `Akun gratis membuka full Test IQ satu kali dengan komposisi: ${iqSectionSummary}.`
          : `Setelah test dimulai, komposisi IQ mengikuti setting admin: ${iqSectionSummary}.`,
        !isPaidAccount
          ? "Setiap bagian dikerjakan satu per satu. Setelah full test ini selesai, akun gratis tidak bisa memulai IQ baru."
          : "Setiap bagian dikerjakan satu per satu. Anda harus menekan mulai pada bagian yang aktif sebelum soal tampil.",
        !isPaidAccount
          ? "Upgrade akun akan membuka akses SKB dan batas latihan tambahan."
          : "Bagian berikutnya tetap terkunci sampai bagian yang sedang aktif disubmit atau waktunya habis.",
        "Setiap bagian memiliki timer sendiri, dan jawaban akan tersimpan otomatis saat Anda memilih opsi atau pindah soal.",
        !isPaidAccount
          ? "Tombol submit final baru muncul setelah keempat bagian selesai dikerjakan."
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
            href="/dashboard"
            className="mt-4 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
