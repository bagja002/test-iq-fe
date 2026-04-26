"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface ArchiveQuestionButtonProps {
  questionId: number
}

export function ArchiveQuestionButton({ questionId }: ArchiveQuestionButtonProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleArchive() {
    startTransition(async () => {
      try {
        setError("")
        const response = await fetch(browserApiUrl(`/api/v1/admin/questions/${questionId}`), {
          method: "DELETE",
          credentials: "include",
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal mengarsipkan soal")
        }
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengarsipkan soal")
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleArchive}
        disabled={isPending}
      >
        {isPending ? "..." : "Arsipkan"}
      </Button>
      {error ? <p className="max-w-48 text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
