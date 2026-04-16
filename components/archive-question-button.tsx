"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface ArchiveQuestionButtonProps {
  questionId: number
}

export function ArchiveQuestionButton({ questionId }: ArchiveQuestionButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleArchive() {
    startTransition(async () => {
      await fetch(browserApiUrl(`/api/v1/admin/questions/${questionId}`), {
        method: "DELETE",
        credentials: "include",
      })
      router.refresh()
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleArchive}
      disabled={isPending}
    >
      {isPending ? "..." : "Arsipkan"}
    </Button>
  )
}
