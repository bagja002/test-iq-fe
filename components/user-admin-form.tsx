"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

export function UserAdminForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError("")

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "USER"),
      status: String(formData.get("status") ?? "ACTIVE"),
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/admin/users"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal membuat user")
        }
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat user")
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Tambah User Baru</h3>
        <p className="mt-1 text-sm text-slate-600">
          Gunakan ini untuk mendaftarkan peserta atau admin baru.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Nama lengkap"
          className="form-control"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="email@domain.com"
          className="form-control"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="form-control"
        />
        <select
          name="role"
          defaultValue="USER"
          className="form-select"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="status"
          defaultValue="ACTIVE"
          className="form-select"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Buat User"}
      </Button>
    </form>
  )
}
