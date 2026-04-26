"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface UserStatusFormProps {
  id: number
  name: string
  role: "USER" | "ADMIN"
  status: "ACTIVE" | "INACTIVE"
  accountType: "FREE" | "PAID"
}

export function UserStatusForm({ id, name, role, status, accountType }: UserStatusFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    const payload = {
      name,
      role: String(formData.get("role") ?? role),
      status: String(formData.get("status") ?? status),
      accountType: String(formData.get("accountType") ?? accountType),
    }

    startTransition(async () => {
      try {
        setError("")
        const response = await fetch(browserApiUrl(`/api/v1/admin/users/${id}`), {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal mengubah user")
        }

        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengubah user")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <select
          name="role"
          defaultValue={role}
          className="form-inline-select"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="form-inline-select"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
        <select
          name="accountType"
          defaultValue={accountType}
          className="form-inline-select"
        >
          <option value="FREE">FREE</option>
          <option value="PAID">PAID</option>
        </select>
        <Button variant="outline" size="sm" type="submit" disabled={isPending}>
          {isPending ? "..." : "Update"}
        </Button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </form>
  )
}
