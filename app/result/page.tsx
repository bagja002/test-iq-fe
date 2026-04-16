import Link from "next/link"

import type { AttemptResult } from "@iq/openapi"

import { LogoutButton } from "@/components/logout-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function ResultPage() {
  await requireSession("USER")
  const result = await fetchApi<{ attempt: AttemptResult | null }>("/api/v1/results/me/latest")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Hasil Test</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Skor akhir Anda</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="glass-panel p-8">
        {result.attempt ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">Estimasi IQ Screening</div>
                <div className="mt-3 text-5xl font-semibold">
                  {result.attempt.estimatedIq ?? "-"}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">Klasifikasi</div>
                <div className="mt-3 text-2xl font-semibold text-slate-950">
                  {result.attempt.classificationLabel}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">Skor mentah</div>
                <div className="mt-3 text-4xl font-semibold text-slate-950">
                  {result.attempt.rawScore}/{result.attempt.totalQuestions}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">Akurasi jawaban</div>
                <div className="mt-3 text-4xl font-semibold text-slate-950">
                  {result.attempt.percentage}%
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/80 p-5 text-sm leading-7 text-slate-700">
              Hasil ini adalah estimasi IQ untuk kebutuhan screening seleksi berbasis persentase jawaban benar pada test internal.
              Nilai ini membantu pemeringkatan kandidat, tetapi bukan hasil psikotes klinis resmi.
            </div>

            <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-700">Skor per index</div>
              {result.attempt.indexScores.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {result.attempt.indexScores.map((item) => (
                    <div key={item.code} className="rounded-[24px] bg-white p-5 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.code}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950">{item.label}</div>
                      <div className="mt-4 text-3xl font-semibold text-slate-950">{item.percentage}%</div>
                      <div className="mt-2 text-sm text-slate-600">
                        {item.correct}/{item.total} benar
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] bg-white p-5 text-sm leading-7 text-slate-600">
                  Attempt lama ini dibuat sebelum struktur 4 index diterapkan, jadi breakdown VCI, PRI, WMI, dan PSI
                  belum tersedia. Skor total dan estimasi IQ screening tetap valid untuk arsip hasil.
                </div>
              )}

              <div className="mt-5 text-sm text-slate-500">
                Status attempt: <span className="font-medium text-slate-700">{result.attempt.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] bg-slate-50 p-6 text-sm text-slate-600">
            Belum ada hasil test yang disubmit.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Kembali ke dashboard
          </Link>
          <Link
            href="/test/start"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Buka halaman test
          </Link>
        </div>
      </section>
    </main>
  )
}
