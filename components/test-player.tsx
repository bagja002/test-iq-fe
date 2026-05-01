"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import type {
  AttemptDetail,
  AttemptQuestion,
  AttemptSection,
  QuestionIndex,
} from "@/lib/api-types"

import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { questionMediaSrc } from "@/lib/question-media"

type AnswerMap = Record<number, string>
type DirtyAnswerMap = Record<number, string>

interface TestPlayerProps {
  attempt: AttemptDetail
}

function getInitialAnswers(attempt: AttemptDetail): AnswerMap {
  return Object.fromEntries(
    attempt.questions
      .filter((question) => question.selectedOptionKey)
      .map((question) => [question.id, question.selectedOptionKey as string]),
  )
}

function isCompletedSection(section: AttemptSection): boolean {
  return section.status === "SUBMITTED" || section.status === "EXPIRED"
}

function getActiveSection(sections: AttemptSection[]): AttemptSection | null {
  return sections.find((section) => section.status === "IN_PROGRESS") ?? null
}

function getNextSection(sections: AttemptSection[]): AttemptSection | null {
  return sections.find((section) => !isCompletedSection(section)) ?? null
}

function getSectionOrder(sections: AttemptSection[], code: QuestionIndex): number {
  return sections.findIndex((section) => section.code === code)
}

function getSectionQuestions(questions: AttemptQuestion[], code: QuestionIndex): AttemptQuestion[] {
  return questions.filter((question) => question.questionIndex === code)
}

function getFirstUnansweredQuestionId(
  questions: AttemptQuestion[],
  answers: AnswerMap,
): number | null {
  return questions.find((question) => !answers[question.id])?.id ?? questions[0]?.id ?? null
}

function getInitialSelectedQuestionId(attempt: AttemptDetail, answers: AnswerMap): number | null {
  const activeSection = getActiveSection(attempt.sections)
  if (!activeSection) {
    return null
  }

  return getFirstUnansweredQuestionId(
    getSectionQuestions(attempt.questions, activeSection.code),
    answers,
  )
}

function formatSectionStatus(section: AttemptSection): string {
  switch (section.status) {
    case "NOT_STARTED":
      return "Belum dimulai"
    case "IN_PROGRESS":
      return "Sedang dikerjakan"
    case "SUBMITTED":
      return "Selesai"
    case "EXPIRED":
      return "Waktu habis"
    default:
      return section.status
  }
}

function sectionTone(section: AttemptSection, isNextStartable: boolean): string {
  if (section.status === "IN_PROGRESS") {
    return "border-cyan-300 bg-cyan-50"
  }
  if (section.status === "SUBMITTED") {
    return "border-emerald-200 bg-emerald-50"
  }
  if (section.status === "EXPIRED") {
    return "border-amber-200 bg-amber-50"
  }
  if (isNextStartable) {
    return "border-slate-300 bg-white"
  }
  return "border-slate-200 bg-slate-50"
}

export function TestPlayer({ attempt }: TestPlayerProps) {
  const router = useRouter()
  const isSKB = attempt.testType === "SKB"
  const testLabel = isSKB ? `SKB ${attempt.roomLabel ?? ""}`.trim() : "test IQ"
  const initialAnswers = getInitialAnswers(attempt)
  const [attemptState, setAttemptState] = useState<AttemptDetail>(attempt)
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    getInitialSelectedQuestionId(attempt, initialAnswers),
  )
  const [error, setError] = useState("")
  const [saveMessage, setSaveMessage] = useState("Jawaban akan tersimpan otomatis.")
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [isSectionBusy, startSectionTransition] = useTransition()
  const [isFinalSubmitting, startFinalTransition] = useTransition()
  const dirtyAnswersRef = useRef<DirtyAnswerMap>({})
  const flushAnswersRef = useRef<(options?: { keepalive?: boolean; silent?: boolean }) => Promise<boolean>>(
    async () => true,
  )
  const autoSubmittedSectionRef = useRef<number | null>(null)

  const sections = attemptState.sections
  const activeSection = getActiveSection(sections)
  const nextSection = activeSection ?? getNextSection(sections)
  const allSectionsCompleted =
    sections.length > 0 && sections.every((section) => isCompletedSection(section))
  const activeQuestions = activeSection
    ? getSectionQuestions(attemptState.questions, activeSection.code)
    : []
  const currentQuestion =
    activeSection && selectedQuestionId
      ? activeQuestions.find((question) => question.id === selectedQuestionId) ?? activeQuestions[0]
      : activeQuestions[0]
  const currentQuestionIndex = currentQuestion
    ? activeQuestions.findIndex((question) => question.id === currentQuestion.id)
    : -1
  const hasPreviousQuestion = currentQuestionIndex > 0
  const hasNextQuestion = currentQuestionIndex >= 0 && currentQuestionIndex < activeQuestions.length - 1
  const isOnLastQuestion = currentQuestionIndex >= 0 && currentQuestionIndex === activeQuestions.length - 1
  const activeSectionOrder = activeSection ? getSectionOrder(sections, activeSection.code) : -1
  const isLastSection =
    activeSectionOrder >= 0 && activeSectionOrder === sections.length - 1
  const currentPromptMediaSrc = questionMediaSrc(currentQuestion?.promptMediaUrl)

  const syncAttemptState = useCallback((detail: AttemptDetail) => {
    const nextAnswers = getInitialAnswers(detail)
    const nextActiveSection = getActiveSection(detail.sections)

    setAttemptState(detail)
    setAnswers(nextAnswers)
    setError("")
    dirtyAnswersRef.current = {}

    if (!nextActiveSection) {
      setSelectedQuestionId(null)
      return
    }

    const nextQuestions = getSectionQuestions(detail.questions, nextActiveSection.code)
    setSelectedQuestionId(getFirstUnansweredQuestionId(nextQuestions, nextAnswers))
  }, [])

  const reloadAttemptDetail = useCallback(async () => {
    const response = await fetch(browserApiUrl(`/api/v1/test-attempts/${attempt.id}`), {
      credentials: "include",
      cache: "no-store",
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.message ?? "Gagal mengambil progress test")
    }

    syncAttemptState(data as AttemptDetail)
    return data as AttemptDetail
  }, [attempt.id, syncAttemptState])

  const flushAnswers = useCallback(
    async (options: { keepalive?: boolean; silent?: boolean } = {}) => {
      const dirtyEntries = Object.entries(dirtyAnswersRef.current)
      if (!dirtyEntries.length) {
        return true
      }

      const snapshot = { ...dirtyAnswersRef.current }
      dirtyAnswersRef.current = {}

      if (!options.silent) {
        setSaveMessage("Menyimpan jawaban...")
      }

      try {
        const response = await fetch(browserApiUrl(`/api/v1/test-attempts/${attempt.id}/answers`), {
          method: "PUT",
          credentials: "include",
          keepalive: options.keepalive,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: Object.entries(snapshot).map(([attemptQuestionId, selectedOptionKey]) => ({
              attemptQuestionId: Number(attemptQuestionId),
              selectedOptionKey,
            })),
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal menyimpan jawaban")
        }

        if (!options.silent) {
          setSaveMessage("Jawaban tersimpan otomatis.")
        }
        return true
      } catch (err) {
        dirtyAnswersRef.current = {
          ...snapshot,
          ...dirtyAnswersRef.current,
        }

        if (!options.silent) {
          setError(err instanceof Error ? err.message : "Gagal menyimpan jawaban")
          setSaveMessage("Penyimpanan tertunda. Sistem akan mencoba lagi.")
        }
        return false
      }
    },
    [attempt.id],
  )

  const submitSection = useCallback(
    (section: AttemptSection, reason: "manual" | "auto") => {
      startSectionTransition(async () => {
        setError("")

        try {
          const saved = await flushAnswers({
            keepalive: reason === "auto",
            silent: reason === "auto",
          })
          if (!saved && reason === "manual") {
            return
          }

          const response = await fetch(
            browserApiUrl(`/api/v1/test-attempts/${attempt.id}/sections/${section.code}/submit`),
            {
              method: "POST",
              credentials: "include",
            },
          )
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data?.message ?? "Gagal submit bagian")
          }

          await reloadAttemptDetail()
          setSaveMessage(
            reason === "auto"
              ? `Waktu ${section.code} habis. Lanjutkan ke bagian berikutnya.`
              : `Bagian ${section.code} selesai. Lanjutkan ke bagian berikutnya.`,
          )
        } catch (err) {
          setError(err instanceof Error ? err.message : "Gagal submit bagian")
        }
      })
    },
    [attempt.id, flushAnswers, reloadAttemptDetail, startSectionTransition],
  )

  useEffect(() => {
    flushAnswersRef.current = flushAnswers
  }, [flushAnswers])

  useEffect(() => {
    if (!activeSection) {
      setSecondsLeft(null)
      autoSubmittedSectionRef.current = null
      return
    }

    const syncTimer = () => {
      const expiresAt = activeSection.expiresAt ? new Date(activeSection.expiresAt).getTime() : Date.now()
      setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))
    }

    syncTimer()
    const timer = window.setInterval(syncTimer, 1000)

    return () => window.clearInterval(timer)
  }, [activeSection])

  useEffect(() => {
    if (!activeSection) {
      return
    }

    const sectionQuestions = getSectionQuestions(attemptState.questions, activeSection.code)
    setSelectedQuestionId((current) => {
      if (current && sectionQuestions.some((question) => question.id === current)) {
        return current
      }
      return getFirstUnansweredQuestionId(sectionQuestions, answers)
    })
  }, [activeSection, answers, attemptState.questions])

  useEffect(() => {
    if (!Object.keys(dirtyAnswersRef.current).length) {
      return
    }

    const timer = window.setTimeout(() => {
      void flushAnswersRef.current()
    }, 600)

    return () => window.clearTimeout(timer)
  }, [answers])

  useEffect(() => {
    const handlePageHide = () => {
      void flushAnswersRef.current({ keepalive: true, silent: true })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePageHide()
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      void flushAnswersRef.current({ keepalive: true, silent: true })
    }
  }, [])

  useEffect(() => {
    if (!activeSection || secondsLeft === null || secondsLeft > 0) {
      return
    }

    if (autoSubmittedSectionRef.current === activeSection.id) {
      return
    }

    autoSubmittedSectionRef.current = activeSection.id

    startSectionTransition(async () => {
      setError("")

      try {
        await flushAnswersRef.current({ keepalive: true, silent: true })

        const sectionResponse = await fetch(
          browserApiUrl(`/api/v1/test-attempts/${attempt.id}/sections/${activeSection.code}/submit`),
          {
            method: "POST",
            credentials: "include",
          },
        )
        const sectionData = await sectionResponse.json()
        if (!sectionResponse.ok) {
          throw new Error(sectionData?.message ?? "Gagal submit bagian")
        }

        if (isLastSection) {
          const response = await fetch(browserApiUrl(`/api/v1/test-attempts/${attempt.id}/submit`), {
            method: "POST",
            credentials: "include",
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data?.message ?? "Gagal submit final")
          }

          const params = new URLSearchParams({ testType: attempt.testType })
          if (attempt.roomCode) {
            params.set("roomCode", attempt.roomCode)
          }
          router.replace(`/result?${params.toString()}`)
          router.refresh()
          return
        }

        await reloadAttemptDetail()
        setSaveMessage(`Waktu ${activeSection.code} habis. Lanjutkan ke bagian berikutnya.`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal submit otomatis saat waktu habis")
      }
    })
  }, [activeSection, attempt.id, attempt.roomCode, attempt.testType, isLastSection, reloadAttemptDetail, router, secondsLeft, startSectionTransition])

  function selectAnswer(selectedOptionKey: string) {
    if (!currentQuestion) {
      return
    }

    setError("")
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: selectedOptionKey,
    }))
    dirtyAnswersRef.current = {
      ...dirtyAnswersRef.current,
      [currentQuestion.id]: selectedOptionKey,
    }
  }

  function handleStartSection(section: AttemptSection) {
    startSectionTransition(async () => {
      setError("")
      try {
        const response = await fetch(
          browserApiUrl(`/api/v1/test-attempts/${attempt.id}/sections/${section.code}/start`),
          {
            method: "POST",
            credentials: "include",
          },
        )
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal memulai bagian")
        }

        await reloadAttemptDetail()
        setSaveMessage(`Bagian ${section.code} dimulai. Jawaban akan tersimpan otomatis.`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memulai bagian")
      }
    })
  }

  function goToPreviousQuestion() {
    if (!hasPreviousQuestion || !currentQuestion) {
      return
    }

    void flushAnswersRef.current()
    setSelectedQuestionId(activeQuestions[currentQuestionIndex - 1].id)
  }

  function goToNextQuestion() {
    if (!hasNextQuestion || !currentQuestion) {
      return
    }

    void flushAnswersRef.current()
    setSelectedQuestionId(activeQuestions[currentQuestionIndex + 1].id)
  }

  const minutes =
    secondsLeft === null ? null : String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const seconds = secondsLeft === null ? null : String(secondsLeft % 60).padStart(2, "0")

  async function submitFinalAttempt() {
    const response = await fetch(browserApiUrl(`/api/v1/test-attempts/${attempt.id}/submit`), {
      method: "POST",
      credentials: "include",
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.message ?? "Gagal submit final")
    }

    const params = new URLSearchParams({ testType: attempt.testType })
    if (attempt.roomCode) {
      params.set("roomCode", attempt.roomCode)
    }
    router.replace(`/result?${params.toString()}`)
    router.refresh()
  }

  function handleLastQuestionSubmit() {
    if (!activeSection || !isOnLastQuestion) {
      return
    }

    if (isLastSection) {
      startFinalTransition(async () => {
        setError("")

        try {
          const saved = await flushAnswers()
          if (!saved) {
            return
          }

          const sectionResponse = await fetch(
            browserApiUrl(`/api/v1/test-attempts/${attempt.id}/sections/${activeSection.code}/submit`),
            {
              method: "POST",
              credentials: "include",
            },
          )
          const sectionData = await sectionResponse.json()
          if (!sectionResponse.ok) {
            throw new Error(sectionData?.message ?? "Gagal submit bagian terakhir")
          }

          await submitFinalAttempt()
        } catch (err) {
          setError(err instanceof Error ? err.message : "Gagal submit final")
        }
      })
      return
    }

    submitSection(activeSection, "manual")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Instruksi Pengerjaan</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {isSKB ? `Kerjakan ${testLabel} sampai selesai.` : "Kerjakan test IQ per bagian, satu index sampai selesai."}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isSKB
              ? "Alurnya tetap berurutan sesuai bagian yang aktif. Progress tiap jawaban akan disimpan ke server agar saat refresh Anda kembali ke posisi terakhir."
              : "Alurnya sekarang berurutan per index. Mulai dari bagian yang aktif, selesaikan, submit bagian tersebut, lalu lanjut ke bagian berikutnya. Progress tiap jawaban akan disimpan ke server agar saat refresh Anda kembali ke bagian yang sedang aktif."}
          </p>
        </div>
        <LogoutButton
          beforeLogout={async () => {
            await flushAnswers({ silent: true })
          }}
          label="Simpan & Keluar"
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => {
          const isCurrentStartable =
            nextSection?.code === section.code && section.status === "NOT_STARTED"

          return (
            <article
              key={section.id}
              className={[
                "rounded-[28px] border p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]",
                sectionTone(section, isCurrentStartable),
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{section.code}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">{section.label}</h2>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {formatSectionStatus(section)}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  {section.answeredCount}/{section.questionCount} soal terjawab
                </p>
                <p>Durasi bagian: {section.durationMinutes} menit</p>
              </div>

              {section.status === "IN_PROGRESS" && section.expiresAt ? (
                <p className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  Timer aktif: {minutes}:{seconds}
                </p>
              ) : null}

              {isCurrentStartable ? (
                <Button
                  className="mt-4 h-11 w-full rounded-2xl"
                  onClick={() => handleStartSection(section)}
                  disabled={isSectionBusy}
                >
                  {isSectionBusy ? "Menyiapkan..." : `Mulai ${section.code}`}
                </Button>
              ) : null}
            </article>
          )
        })}
      </section>

      {activeSection ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">
                Bagian {activeSection.code}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{activeSection.label}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Gunakan navigasi soal di atas untuk berpindah. Tombol `Previous` dan `Next`
                tersedia di bawah area soal. Tombol submit baru akan muncul saat Anda sudah
                berada di nomor terakhir bagian yang aktif.
              </p>
            </div>
            <div className="rounded-[28px] bg-slate-950 px-5 py-4 text-white">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">Sisa waktu</div>
              <div className="mt-2 text-4xl font-semibold">
                {minutes}:{seconds}
              </div>
              <p className="mt-2 text-sm text-slate-300">{saveMessage}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-900">Navigasi Soal</p>
            <div className="flex flex-wrap gap-2">
              {activeQuestions.map((question, index) => {
                const isActive = currentQuestion?.id === question.id
                const answered = Boolean(answers[question.id])
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      void flushAnswersRef.current()
                      setSelectedQuestionId(question.id)
                    }}
                    className={[
                      "h-11 min-w-11 rounded-2xl border px-4 text-sm font-semibold transition",
                      isActive
                        ? "border-cyan-500 bg-cyan-500 text-white"
                        : answered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300",
                    ].join(" ")}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {currentQuestion ? (
            <>
              <div className="mt-6 rounded-[28px] bg-slate-50 p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
                  </span>
                  {currentQuestion.subtestLabel ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                      {currentQuestion.subtestLabel}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-lg leading-8 text-slate-900">{currentQuestion.prompt}</p>

                {currentPromptMediaSrc ? (
                  <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4">
                    <Image
                      src={currentPromptMediaSrc}
                      alt={currentQuestion.promptMediaAlt || currentQuestion.prompt}
                      width={960}
                      height={640}
                      unoptimized
                      className="max-h-[360px] w-full rounded-2xl object-contain"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3">
                {currentQuestion.options.map((option) => {
                  const active = answers[currentQuestion.id] === option.key
                  const optionMediaSrc = questionMediaSrc(option.mediaUrl)

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => selectAnswer(option.key)}
                      className={[
                        "flex items-start gap-4 rounded-[24px] border px-5 py-4 text-left transition",
                        active
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                          active ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {option.key}
                      </span>
                      <span className="flex-1 space-y-3">
                        {optionMediaSrc ? (
                          <span className="block overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                            <Image
                              src={optionMediaSrc}
                              alt={option.mediaAlt || option.content || `Pilihan ${option.key}`}
                              width={640}
                              height={360}
                              unoptimized
                              className="max-h-48 w-full rounded-2xl object-contain"
                            />
                          </span>
                        ) : null}
                        {option.content ? (
                          <span className="block text-sm leading-7 text-slate-800">{option.content}</span>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-blue-500 text-white hover:bg-blue-600"
                    disabled={!hasPreviousQuestion || isSectionBusy}
                    onClick={goToPreviousQuestion}
                  >
                    Previous
                  </Button>

                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-700"
                    disabled={!hasNextQuestion || isSectionBusy}
                    onClick={goToNextQuestion}
                  >
                    Next
                  </Button>
                </div>

                {isOnLastQuestion ? (
                  <Button
                    type="button"
                    className="h-12 w-full rounded-2xl"
                    disabled={isSectionBusy || isFinalSubmitting}
                    onClick={handleLastQuestionSubmit}
                  >
                    {isSectionBusy || isFinalSubmitting
                      ? "Memproses..."
                      : isLastSection
                        ? isSKB
                          ? "Submit Ujian SKB"
                          : "Submit Ujian IQ"
                        : `Submit Bagian ${activeSection.code}`}
                  </Button>
                ) : null}
                {!isOnLastQuestion ? (
                  <p className="text-sm text-slate-500">
                    Gunakan tombol <span className="font-medium text-slate-700">Next</span> untuk lanjut sampai nomor terakhir. Tombol submit akan muncul di soal terakhir.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {!activeSection && nextSection ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)]">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Bagian Berikutnya</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Siap lanjut ke {nextSection.code}?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Klik tombol mulai untuk membuka bagian ini. Setelah bagian aktif dimulai, timer bagian
            akan berjalan sesuai durasi yang sudah ditentukan.
          </p>
          <Button
            className="mt-6 h-12 rounded-2xl"
            onClick={() => handleStartSection(nextSection)}
            disabled={isSectionBusy}
          >
            {isSectionBusy ? "Menyiapkan..." : `Mulai ${nextSection.code}`}
          </Button>
        </section>
      ) : null}

      {allSectionsCompleted ? (
        <section className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.28)]">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Ujian Selesai</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            {isSKB ? "SKB sudah selesai disubmit." : "Test IQ sudah selesai disubmit."}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            Hasil ujian diproses setelah submit dari nomor terakhir pada bagian terakhir.
          </p>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}
