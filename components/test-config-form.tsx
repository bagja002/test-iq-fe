"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { TestConfigResponse } from "@iq/openapi"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface TestConfigFormProps {
  config: TestConfigResponse | null
}

export function TestConfigForm({ config }: TestConfigFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError("")
    const payload = {
      title: String(formData.get("title") ?? ""),
      durationMinutes: Number(formData.get("durationMinutes") ?? 30),
      questionCount: Number(formData.get("questionCount") ?? 10),
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
        <h3 className="text-lg font-semibold text-slate-950">Konfigurasi Test Aktif</h3>
        <p className="mt-1 text-sm text-slate-600">
          Ubah judul test, durasi, dan jumlah soal yang akan dipakai untuk attempt baru.
        </p>
      </div>
      <input
        name="title"
        required
        defaultValue={config?.title ?? "Simulasi Test IQ Utama"}
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
          min={1}
          defaultValue={config?.questionCount ?? 10}
          className="form-control"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
      </Button>
    </form>
  )
}
