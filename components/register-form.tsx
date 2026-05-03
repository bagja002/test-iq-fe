"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { POSITION_OPTIONS } from "@/lib/positions"

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "")
    const position = String(formData.get("position") ?? "")
    const phone = String(formData.get("phone") ?? "")
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    setError("")

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum sama.")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/auth/register"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, position, phone, email, password }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Registrasi gagal")
        }

        router.replace("/dashboard")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registrasi gagal")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Nama lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Masukkan nama lengkap"
          className="form-control"
        />
      </div>
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
        <label className="text-sm font-medium text-slate-700" htmlFor="phone">
          Nomor HP
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="08xxxxxxxxxx"
          className="form-control"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="position">
          Jabatan
        </label>
        <select
          id="position"
          name="position"
          required
          defaultValue=""
          className="form-select"
        >
          <option value="" disabled>
            Pilih jabatan
          </option>
          {POSITION_OPTIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className="form-control pr-12"
          />
          <button
            type="button"
            className="absolute right-3 top-[34px] grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="relative space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
            Konfirmasi password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ulangi password"
            className="form-control pr-12"
          />
          <button
            type="button"
            className="absolute right-3 top-[34px] grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <Button type="submit" size="lg" className="h-12 w-full rounded-2xl gap-2" disabled={isPending}>
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {isPending ? "Membuat akun..." : "Daftar & Masuk"}
      </Button>
      <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm leading-7 text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
          Masuk di sini
        </Link>
        .
        <br />
        Akun admin dikelola internal dan tidak dibuat dari form publik ini.
      </div>
    </form>
  )
}
