"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react"

import type { LoginResponse } from "@/lib/api-types"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    setError("")

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/auth/login"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const data = (await response.json()) as LoginResponse
        if (!response.ok) {
          throw new Error(data?.message ?? "Login gagal")
        }

        router.replace(data.user.role === "ADMIN" ? "/admin" : "/dashboard")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login gagal")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="nama@email.com"
          className="form-control"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="form-control pr-12"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <Button type="submit" size="lg" className="h-12 w-full rounded-2xl gap-2" disabled={isPending}>
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
      <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm leading-7 text-slate-600">
        Belum punya akun peserta?{" "}
        <Link href="/register" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
          Daftar sekarang
        </Link>
        .

      </div>
    </form>
  )
}
