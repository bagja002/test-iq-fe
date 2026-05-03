"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { browserApiUrl } from "@/lib/browser-api"
import { POSITION_OPTIONS } from "@/lib/positions"

export function UserAdminForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError("")

    const payload = {
      name: String(formData.get("name") ?? ""),
      position: String(formData.get("position") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "USER"),
      status: String(formData.get("status") ?? "ACTIVE"),
      accountType: String(formData.get("accountType") ?? "FREE"),
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
        formRef.current?.reset()
        setOpen(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat user")
      }
    })
  }

  return (
    <>
      <section className="glass-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Tambah User Baru</h3>
          <p className="mt-1 text-sm text-slate-600">
            Form pembuatan akun saya pindahkan ke dialog agar daftar user tetap bersih dan mudah dipindai.
          </p>
        </div>
        <Button type="button" className="h-11 rounded-2xl px-5" onClick={() => setOpen(true)}>
          Tambah User
        </Button>
      </section>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setError("")
          }
        }}
        title="Tambah User Baru"
        description="Gunakan dialog ini untuk mendaftarkan peserta atau admin baru tanpa memenuhi halaman utama."
        className="max-w-2xl"
      >
        <form ref={formRef} action={handleSubmit} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Nama lengkap"
              className="form-control"
            />
            <select
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
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="email"
              type="email"
              required
              placeholder="email@domain.com"
              className="form-control"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="Nomor HP"
              className="form-control"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="form-control"
            />
            <select name="role" defaultValue="USER" className="form-select">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select name="status" defaultValue="ACTIVE" className="form-select">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <select name="accountType" defaultValue="FREE" className="form-select">
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="MAX">MAX</option>
            </select>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-2xl px-5" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="h-11 rounded-2xl px-5" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Buat User"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
