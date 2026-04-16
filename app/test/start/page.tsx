import Link from "next/link"

import type { AttemptSummary } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { StartTestButton } from "@/components/start-test-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function TestStartPage() {
  await requireSession("USER")
  const current = await fetchApi<{ attempt: AttemptSummary | null }>("/api/v1/test-attempts/current")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Instruksi Test</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Baca sebentar, lalu mulai.</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-8">
          <ol className="grid gap-4">
            {[
              "Setelah test dimulai, Anda akan melihat 4 bagian besar: VCI, PRI, WMI, dan PSI.",
              "Setiap bagian dikerjakan satu per satu. Anda harus menekan mulai pada bagian yang aktif sebelum soal tampil.",
              "Bagian berikutnya tetap terkunci sampai bagian yang sedang aktif disubmit atau waktunya habis.",
              "Setiap bagian memiliki timer sendiri, dan jawaban akan tersimpan otomatis saat Anda memilih opsi atau pindah soal.",
              "Jika browser direfresh, sistem akan memuat kembali bagian yang sedang aktif beserta jawaban yang sudah tersimpan.",
              "Tombol submit final baru muncul setelah keempat bagian selesai dikerjakan.",
            ].map((item, index) => (
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
            Pastikan koneksi stabil dan pilih tempat yang tenang agar Anda bisa fokus penuh selama pengerjaan.
          </p>
          <div className="mt-6">
            <StartTestButton currentAttemptId={current.attempt?.id} />
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
