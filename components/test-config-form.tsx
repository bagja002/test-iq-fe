"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { TestConfigResponse, TestType } from "@iq/openapi"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { IQ_TOTAL_QUESTION_COUNT, SKB_QUESTION_COUNT_PER_JABATAN } from "@/lib/test-rules"

interface TestConfigFormProps {
  config: TestConfigResponse | null
  testType: TestType
  roomCode?: string
  roomLabel?: string
  title: string
  description: string
}

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
  const fixedQuestionCount = testType === "SKB" ? SKB_QUESTION_COUNT_PER_JABATAN : IQ_TOTAL_QUESTION_COUNT

  function handleSubmit(formData: FormData) {
    setError("")
    const payload = {
      title: String(formData.get("title") ?? ""),
      testType,
      roomCode: roomCode ?? "",
      roomLabel: roomLabel ?? "",
      durationMinutes: Number(formData.get("durationMinutes") ?? 30),
      questionCount: fixedQuestionCount,
      active: true,
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
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="durationMinutes"
          type="number"
          min={5}
          defaultValue={config?.durationMinutes ?? 30}
          className="form-control"
        />
        <input
          name="questionCount"
          type="number"
          min={fixedQuestionCount}
          value={fixedQuestionCount}
          readOnly
          className="form-control"
        />
      </div>
      <p className="text-xs leading-6 text-slate-500">
        Jumlah soal ditetapkan oleh sistem: {fixedQuestionCount} soal {testType === "IQ" ? "(30 soal per bagian)" : "per jabatan"}.
      </p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
      </Button>
    </form>
  )
}
