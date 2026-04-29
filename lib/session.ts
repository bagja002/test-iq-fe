import { redirect } from "next/navigation"

import type { Role, SessionResponse } from "@/lib/api-types"

import { fetchApi } from "@/lib/server-api"

export async function getSession(): Promise<SessionResponse> {
  try {
    return await fetchApi<SessionResponse>("/api/v1/auth/session")
  } catch {
    return {
      authenticated: false,
      user: null,
    }
  }
}

export async function requireSession(role?: Role) {
  const session = await getSession()

  if (!session.authenticated || !session.user) {
    redirect("/login")
  }

  if (role && session.user.role !== role) {
    redirect("/dashboard")
  }

  return session.user
}
