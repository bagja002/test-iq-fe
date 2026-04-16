"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

interface UserStatusFormProps {
  id: number
  name: string
  role: "USER" | "ADMIN"
  status: "ACTIVE" | "INACTIVE"
}

export function UserStatusForm({ id, name, role, status }: UserStatusFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    const payload = {
      name,
      role: String(formData.get("role") ?? role),
      status: String(formData.get("status") ?? status),
    }

    startTransition(async () => {
      await fetch(browserApiUrl(`/api/v1/admin/users/${id}`), {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-center gap-3">
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
      <Button variant="outline" size="sm" type="submit" disabled={isPending}>
        {isPending ? "..." : "Update"}
      </Button>
    </form>
  )
}
