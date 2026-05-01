"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { TestConfigResponse, TestType } from "@/lib/api-types"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface TestConfigFormProps {
  config: TestConfigResponse | null
  testType: TestType
  roomCode?: string
  roomLabel?: string
  title: string
  description: string
}

const iqSections = [
  { code: "VCI", label: "Verbal Reasoning Index", questionCount: 50, durationMinutes: 40 },
  { code: "PRI", label: "Perceptual Reasoning Index", questionCount: 20, durationMinutes: 15 },
  { code: "WMI", label: "Working Memory Index", questionCount: 40, durationMinutes: 30 },
  { code: "PSI", label: "Processing Speed Index", questionCount: 20, durationMinutes: 15 },
] as const

export function TestConfigForm({
  config,
  testType,
  roomCode,
  roomLabel,
  title,
  description,
}: TestConfigFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const isIQ = testType === "IQ"
  const sections = iqSections.map((section, index) => {
    const saved = config?.sections?.find((item) => item.questionIndex === section.code)
    return {
      ...section,
      orderNo: index + 1,
      questionCount: saved?.questionCount ?? section.questionCount,
      durationMinutes: saved?.durationMinutes ?? section.durationMinutes,
    }
  })
  const totalIQQuestions = sections.reduce((total, section) => total + section.questionCount, 0)
  const totalIQDuration = sections.reduce((total, section) => total + section.durationMinutes, 0)

  function handleSubmit(formData: FormData) {
    setError("")
    const submittedSections = isIQ
      ? iqSections.map((section, index) => ({
          questionIndex: section.code,
          label: section.label,
          orderNo: index + 1,
          questionCount: Number(formData.get(`questionCount_${section.code}`) ?? section.questionCount),
          durationMinutes: Number(formData.get(`durationMinutes_${section.code}`) ?? section.durationMinutes),
        }))
      : []
    const questionCount = isIQ
      ? submittedSections.reduce((total, section) => total + section.questionCount, 0)
      : Number(formData.get("questionCount") ?? 50)
    const durationMinutes = isIQ
      ? submittedSections.reduce((total, section) => total + section.durationMinutes, 0)
      : Number(formData.get("durationMinutes") ?? 60)

    const payload = {
      title: String(formData.get("title") ?? ""),
      testType,
      roomCode: roomCode ?? "",
      roomLabel: roomLabel ?? "",
      durationMinutes,
      questionCount,
      active: true,
      sections: submittedSections,
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/admin/test-config"), {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal menyimpan konfigurasi")
        }
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi")
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <input
        name="title"
        required
        defaultValue={config?.title ?? (testType === "SKB" ? `SKB ${roomLabel}` : "Simulasi Test IQ Utama")}
        className="form-control"
      />
      {isIQ ? (
        <div className="grid gap-3">
          <div className="grid gap-3 rounded-[22px] bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-500">Total soal IQ</div>
              <div className="mt-1 text-2xl font-semibold text-slate-950">{totalIQQuestions}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Total waktu IQ</div>
              <div className="mt-1 text-2xl font-semibold text-slate-950">{totalIQDuration} menit</div>
            </div>
          </div>
          {sections.map((section) => (
            <div key={section.code} className="grid gap-3 rounded-[22px] border border-slate-200 p-4 md:grid-cols-[1fr_0.7fr_0.7fr] md:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{section.code}</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{section.label}</div>
              </div>
              <label className="grid gap-1 text-sm text-slate-600">
                Jumlah soal
                <input
                  name={`questionCount_${section.code}`}
                  type="number"
                  min={1}
                  defaultValue={section.questionCount}
                  className="form-control"
                />
              </label>
              <label className="grid gap-1 text-sm text-slate-600">
                Waktu menit
                <input
                  name={`durationMinutes_${section.code}`}
                  type="number"
                  min={1}
                  defaultValue={section.durationMinutes}
                  className="form-control"
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-600">
            Durasi menit
            <input
              name="durationMinutes"
              type="number"
              min={1}
              defaultValue={config?.durationMinutes ?? 60}
              className="form-control"
            />
          </label>
          <label className="grid gap-1 text-sm text-slate-600">
            Jumlah soal
            <input
              name="questionCount"
              type="number"
              min={1}
              defaultValue={config?.questionCount ?? 50}
              className="form-control"
            />
          </label>
        </div>
      )}
      <p className="text-xs leading-6 text-slate-500">
        Jika bank soal lebih sedikit dari angka ini, sistem memakai soal yang tersedia saja tanpa membuat dummy.
      </p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
      </Button>
    </form>
  )
}
