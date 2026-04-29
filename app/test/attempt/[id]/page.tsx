import { notFound } from "next/navigation"

import type { AttemptDetail } from "@/lib/api-types"

import { TestPlayer } from "@/components/test-player"
import { fetchApi } from "@/lib/server-api"
import { requireSession } from "@/lib/session"

interface AttemptPageProps {
  params: Promise<{ id: string }>
}

export default async function AttemptPage({ params }: AttemptPageProps) {
  await requireSession("USER")
  const { id } = await params

  let attempt: AttemptDetail
  try {
    attempt = await fetchApi<AttemptDetail>(`/api/v1/test-attempts/${id}`)
  } catch {
    notFound()
  }

  return (
    <main className="page-shell">
      <TestPlayer attempt={attempt} />
    </main>
  )
}
