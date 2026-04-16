"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface StartTestButtonProps {
  currentAttemptId?: number
}

export function StartTestButton({ currentAttemptId }: StartTestButtonProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setError("")

    if (currentAttemptId) {
      router.push(`/test/attempt/${currentAttemptId}`)
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/test-attempts/start"), {
          method: "POST",
          credentials: "include",
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal memulai test")
        }

        router.push(`/test/attempt/${data.attemptId}`)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memulai test")
      }
    })
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="h-12 rounded-2xl" onClick={handleClick} disabled={isPending}>
        {isPending
          ? "Menyiapkan..."
          : currentAttemptId
            ? "Lanjutkan Attempt Aktif"
            : "Mulai Test IQ"}
      </Button>
      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : null}
    </div>
  )
}
