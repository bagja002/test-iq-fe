import Image from "next/image"

import type { AdminOverview, QuestionSummary } from "@/lib/api-types"

import { AdminNav } from "@/components/admin-nav"
import { AdminStatCard } from "@/components/admin-stat-card"
import { ArchiveQuestionButton } from "@/components/archive-question-button"
import { LogoutButton } from "@/components/logout-button"
import { QuestionAdminForm } from "@/components/question-admin-form"
import { QuestionAssetImportDialog } from "@/components/question-asset-import-dialog"
import { QuestionImportDialog } from "@/components/question-import-dialog"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"
import { readSearchParam } from "@/lib/search-params"

interface AdminQuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  await requireSession("ADMIN")

  const params = await searchParams
  const q = readSearchParam(params.q)
  const status = readSearchParam(params.status)
  const questionIndex = readSearchParam(params.index)
  const query = new URLSearchParams()
  if (q) query.set("q", q)
  if (status) query.set("status", status)
  if (questionIndex) query.set("index", questionIndex)

  const [questionRes, overviewRes] = await Promise.all([
    fetchApi<{ questions: QuestionSummary[] }>(
      `/api/v1/admin/questions${query.toString() ? `?${query.toString()}` : ""}`,
    ),
    fetchApi<{ overview: AdminOverview }>("/api/v1/admin/overview"),
  ])

  const overview = overviewRes.overview

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Soal</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Bank soal test IQ</h1>
        </div>
        <LogoutButton />
      </header>

      <AdminNav />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Soal Published"
          value={overview.questionStats.published}
          hint="Siap dipakai attempt baru"
          tone="emerald"
        />
        <AdminStatCard
          label="Draft"
          value={overview.questionStats.draft}
          hint="Perlu review sebelum dipublikasikan"
          tone="amber"
        />
        <AdminStatCard
          label="Arsip"
          value={overview.questionStats.archived}
          hint="Tidak lagi muncul di bank aktif"
        />
        <AdminStatCard
          label="Soal Visual"
          value={overview.questionStats.visual}
          hint="Prompt visual yang sudah tersedia"
          tone="cyan"
        />
      </section>

      <section className="glass-panel p-6">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari prompt soal..."
            className="form-control"
          />
          <select name="status" defaultValue={status} className="form-select">
            <option value="">Semua status aktif</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select name="index" defaultValue={questionIndex} className="form-select">
            <option value="">Semua index</option>
            <option value="VCI">VCI</option>
            <option value="PRI">PRI</option>
            <option value="WMI">WMI</option>
            <option value="PSI">PSI</option>
          </select>
          <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            Terapkan Filter
          </button>
        </form>
      </section>

      <section className="glass-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Tambah atau Import Soal</h3>
          <p className="mt-1 text-sm text-slate-600">
            Tambah satu soal manual, atau import banyak soal sekaligus dari Excel sesuai template.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <QuestionAssetImportDialog />
          <QuestionImportDialog />
          <QuestionAdminForm />
        </div>
      </section>

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Daftar soal</h2>
          <p className="mt-2 text-sm text-slate-600">
            Saya tambahkan filter operasional supaya admin lebih cepat menemukan soal berdasarkan
            prompt, status, dan index.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {questionRes.questions.length > 0 ? (
            questionRes.questions.map((question) => (
              <div key={question.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  {question.promptMediaUrl ? (
                    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                      <Image
                        src={question.promptMediaUrl}
                        alt={question.promptMediaAlt ?? question.prompt}
                        width={960}
                        height={540}
                        unoptimized
                        className="max-h-44 w-full rounded-2xl object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="text-base font-medium text-slate-950">{question.prompt}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                    {question.questionIndexLabel ? <span>{question.questionIndexLabel}</span> : null}
                    {question.subtestLabel ? <span>{question.subtestLabel}</span> : null}
                    {question.promptMediaUrl ? <span>Prompt Visual</span> : null}
                    {question.hasOptionMedia ? <span>Opsi Visual</span> : null}
                    <span>{question.difficulty}</span>
                    <span>{question.status}</span>
                    <span>{question.optionCount} opsi</span>
                  </div>
                </div>
                <ArchiveQuestionButton questionId={question.id} />
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-sm text-slate-600">
              Tidak ada soal yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
