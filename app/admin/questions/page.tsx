import Image from "next/image"
import type { QuestionSummary } from "@iq/openapi"

import { ArchiveQuestionButton } from "@/components/archive-question-button"
import { LogoutButton } from "@/components/logout-button"
import { QuestionAdminForm } from "@/components/question-admin-form"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

export default async function AdminQuestionsPage() {
  await requireSession("ADMIN")
  const response = await fetchApi<{ questions: QuestionSummary[] }>("/api/v1/admin/questions")

  return (
    <main className="page-shell space-y-6">
      <header className="glass-panel flex items-end justify-between p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Admin / Soal</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Bank soal test IQ</h1>
        </div>
        <LogoutButton />
      </header>

      <QuestionAdminForm />

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">Daftar soal</h2>
          <p className="mt-2 text-sm text-slate-600">
            Soal lama tanpa index dan subtes sekarang diarsipkan otomatis agar bank soal aktif tetap bersih dan fokus ke
            struktur VCI, PRI, WMI, dan PSI.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {response.questions.map((question) => (
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
          ))}
        </div>
      </section>
    </main>
  )
}
