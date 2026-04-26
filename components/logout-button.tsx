"use client"

import { useRouter } from "next/navigation"
import { type ComponentProps, useState, useTransition } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  beforeLogout?: () => Promise<void> | void
  className?: string
  label?: string
  size?: ComponentProps<typeof Button>["size"]
}

export function LogoutButton({
  beforeLogout,
  className,
  label = "Keluar",
  size = "default",
}: LogoutButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      try {
        setError("")
        await beforeLogout?.()

        await fetch(browserApiUrl("/api/v1/auth/logout"), {
          method: "POST",
          credentials: "include",
        })

        setOpen(false)
        router.replace("/login")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Logout gagal. Coba lagi.")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={() => {
          setError("")
          setOpen(true)
        }}
        disabled={isPending}
        className={cn(
          "h-10 rounded-2xl border-rose-200 bg-white px-4 font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800",
          className,
        )}
      >
        {isPending ? "Keluar..." : label}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Keluar dari akun?"
        description="Pastikan semua proses yang sedang Anda kerjakan sudah selesai sebelum logout."
        className="max-w-lg"
      >
        <div className="space-y-5">
          <div className="rounded-[24px] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            Anda akan keluar dari sesi saat ini dan perlu login kembali untuk mengakses dashboard.
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"

              className="h-11 bg-red-400 rounded-2xl px-5"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl px-5"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending ? "Keluar..." : "Ya, Logout"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
