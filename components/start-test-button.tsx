"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { LoaderCircle, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface StartTestButtonProps {
  currentAttemptId?: number
  testType: "IQ" | "SKB"
  roomCode?: string | null
  label?: string
  className?: string
}

export function StartTestButton({ currentAttemptId, testType, roomCode, label, className }: StartTestButtonProps) {
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testType,
            roomCode: roomCode ?? "",
          }),
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
      <Button
        size="lg"
        className={`h-12 w-full rounded-2xl gap-2 sm:w-auto ${className ?? ""}`}
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
        {isPending
          ? "Menyiapkan..."
          : currentAttemptId
            ? "Lanjutkan Test"
            : label ?? (testType === "SKB" ? "Mulai SKB" : "Mulai IQ")}
      </Button>
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
    </div>
  )
}
