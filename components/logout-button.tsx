"use client"

import { useRouter } from "next/navigation"
import { type ComponentProps, useState, useTransition } from "react"

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
        onClick={handleLogout}
        disabled={isPending}
        className={cn(
          "h-10 rounded-2xl border-rose-200 bg-white px-4 font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800",
          className,
        )}
      >
        {isPending ? "Keluar..." : label}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
