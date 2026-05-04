import Link from "next/link"

import type { AttemptDetail, AttemptQuestion, AttemptResult, ResultListResponse, TestType } from "@/lib/api-types"

import { LogoutButton } from "@/components/logout-button"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

interface ResultPageProps {
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

function optionLabel(question: AttemptQuestion, optionKey: string | null): string {
  if (!optionKey) {
    return "-"
  }

  const option = question.options.find((item) => item.key === optionKey)
  const content = option?.content?.trim()
  return content ? `${optionKey}. ${content}` : optionKey
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  await requireSession("USER")

  const params = await searchParams
  const testType = (readParam(params.testType).toUpperCase() || "IQ") as TestType
  const roomCode = readParam(params.roomCode).toUpperCase()
  const [result, history] = await Promise.all([
    fetchApi<{ attempt: AttemptResult | null }>(
      `/api/v1/results/me/latest?${buildQuery(testType, roomCode)}`,
    ),
    fetchApi<ResultListResponse>(
      `/api/v1/results/me?${buildQuery(testType, roomCode)}`,
    ),
  ])

  const attempt = result.attempt
  const displayAttempt = attempt ?? history.results[0] ?? null
  const isSKB = attempt?.testType === "SKB" || testType === "SKB"
  const roomName = displayAttempt?.roomLabel ?? "SKB"
  const showAllSKBFields = isSKB && !roomCode
  const uniqueSKBFields = Array.from(new Set(history.results.map((item) => item.roomLabel).filter(Boolean)))
  const bestSKBScore = history.results.reduce<number>(
    (best, item) => Math.max(best, item.skbScore ?? 0),
    0,
  )
  const hasRenderableResult = Boolean(attempt) || (showAllSKBFields && history.results.length > 0)
  const attemptDetail = displayAttempt && !showAllSKBFields
    ? await fetchApi<AttemptDetail>(`/api/v1/test-attempts/${displayAttempt.id}`).catch(() => null)
    : null
  const answerRows = attemptDetail?.questions ?? []

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">
            {isSKB ? "Hasil SKB" : "Hasil Test IQ"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            {isSKB ? `Skor akhir ${roomName}` : "Skor akhir Anda"}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <section className="glass-panel p-8">
        {hasRenderableResult ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {isSKB ? (
                <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                    {showAllSKBFields ? "Jabatan SKB" : "Kamar SKB"}
                  </div>
                  <div className="mt-3 text-3xl font-semibold">
                    {showAllSKBFields ? `${uniqueSKBFields.length} jabatan` : roomName}
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">Estimasi IQ Screening</div>
                  <div className="mt-3 text-5xl font-semibold">{displayAttempt?.estimatedIq ?? "-"}</div>
                </div>
              )}
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">{isSKB ? "Nilai SKB" : "Klasifikasi"}</div>
                <div className="mt-3 text-2xl font-semibold text-slate-950">
                  {isSKB
                    ? `${showAllSKBFields ? bestSKBScore : displayAttempt?.skbScore ?? 0}`
                    : displayAttempt?.classificationLabel || "-"}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">{isSKB ? "Kategori" : "Skor mentah"}</div>
                <div className="mt-3 text-4xl font-semibold text-slate-950">
                  {isSKB
                    ? (showAllSKBFields ? "Rekap semua jabatan" : displayAttempt?.classificationLabel || roomName)
                    : `${displayAttempt?.rawScore ?? 0}/${displayAttempt?.totalQuestions ?? 0}`}
                </div>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm text-slate-500">{isSKB ? (showAllSKBFields ? "Jumlah attempt" : "Skor mentah") : "Akurasi jawaban"}</div>
                <div className="mt-3 text-4xl font-semibold text-slate-950">
                  {isSKB
                    ? (showAllSKBFields ? `${history.results.length}` : `${displayAttempt?.rawScore ?? 0}/${displayAttempt?.totalQuestions ?? 0}`)
                    : `${displayAttempt?.percentage ?? 0}%`}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/80 p-5 text-sm leading-7 text-slate-700">
              {isSKB
                ? "Nilai SKB dihitung dari persentase jawaban benar pada soal jabatan yang dipilih, lalu ditampilkan dalam skala 0 sampai 100."
                : "Hasil ini adalah estimasi IQ untuk kebutuhan screening seleksi berbasis persentase jawaban benar pada test internal. Nilai ini membantu pemeringkatan kandidat, tetapi bukan hasil psikotes klinis resmi."}
            </div>

            {!showAllSKBFields ? (
              <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-700">
                {isSKB ? "Ringkasan pengerjaan" : "Skor per index"}
              </div>
              {displayAttempt && displayAttempt.indexScores.length > 0 ? (
                <div className={`mt-4 grid gap-4 ${isSKB ? "md:grid-cols-1 xl:grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4"}`}>
                  {displayAttempt.indexScores.map((item) => (
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
                  Breakdown detail belum tersedia untuk attempt ini, tetapi skor total tetap tersimpan.
                </div>
              )}

              <div className="mt-5 text-sm text-slate-500">
                Status attempt: <span className="font-medium text-slate-700">{displayAttempt?.status ?? "-"}</span>
              </div>
            </div>
            ) : null}

            {history.results.length > 0 ? (
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-700">
                  {isSKB ? "Riwayat Nilai SKB per Jabatan" : "Riwayat Hasil IQ"}
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        {isSKB ? <th className="px-4 py-3 font-medium">Jabatan</th> : null}
                        <th className="px-4 py-3 font-medium">Tanggal</th>
                        <th className="px-4 py-3 font-medium">{isSKB ? "Nilai" : "IQ / Klasifikasi"}</th>
                        <th className="px-4 py-3 font-medium">Skor</th>
                        <th className="px-4 py-3 font-medium">Akurasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.results.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          {isSKB ? (
                            <td className="px-4 py-3 font-medium text-slate-950">
                              {item.roomLabel ?? "-"}
                            </td>
                          ) : null}
                          <td className="px-4 py-3">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleString("id-ID")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-950">
                            {isSKB
                              ? `${item.skbScore ?? 0}`
                              : item.estimatedIq != null
                                ? `IQ ${item.estimatedIq}`
                                : (item.classificationLabel ?? "-")}
                          </td>
                          <td className="px-4 py-3">{item.rawScore}/{item.totalQuestions}</td>
                          <td className="px-4 py-3">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {answerRows.length > 0 ? (
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-700">
                  Riwayat Jawaban Benar
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Jawaban benar ditampilkan setelah attempt selesai disubmit.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[900px] w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-3 font-medium">No.</th>
                        <th className="px-4 py-3 font-medium">Index</th>
                        <th className="px-4 py-3 font-medium">Jawaban Anda</th>
                        <th className="px-4 py-3 font-medium">Jawaban Benar</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answerRows.map((question) => {
                        const isCorrect = Boolean(question.correctOptionKey && question.selectedOptionKey === question.correctOptionKey)
                        return (
                          <tr key={question.id} className="border-b border-slate-100 align-top">
                            <td className="px-4 py-3 font-medium text-slate-950">{question.orderNo}</td>
                            <td className="px-4 py-3 text-slate-600">{question.questionIndexLabel ?? question.questionIndex ?? "-"}</td>
                            <td className="px-4 py-3">{optionLabel(question, question.selectedOptionKey)}</td>
                            <td className="px-4 py-3 font-medium text-slate-950">{optionLabel(question, question.correctOptionKey)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              }`}>
                                {isCorrect ? "Benar" : "Salah"}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
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
            href={`/test/start?${buildQuery(testType, roomCode)}`}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            {showAllSKBFields ? "Pilih jabatan SKB" : "Buka halaman test"}
          </Link>
        </div>
      </section>
    </main>
  )
}
