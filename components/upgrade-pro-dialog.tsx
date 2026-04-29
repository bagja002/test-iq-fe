"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { AccountType } from "@/lib/api-types"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { browserApiUrl } from "@/lib/browser-api"

interface UpgradeProDialogProps {
  triggerLabel?: string
  title?: string
  description?: string
  className?: string
}

interface UpgradePlanCard {
  code: Extract<AccountType, "PRO" | "MAX">
  badge: string
  price: string
  headline: string
  description: string
  points: string[]
}

const upgradePlans: UpgradePlanCard[] = [
  {
    code: "PRO",
    badge: "Paket Pro",
    price: "Rp40.000",
    headline: "Semua fitur terbuka dengan batas latihan harian",
    description: "Cocok untuk peserta yang ingin akses penuh IQ dan SKB, tetapi tetap dengan kontrol pemakaian harian.",
    points: [
      "Akses penuh Test IQ 120 soal per sesi",
      "Akses semua jabatan SKB 30 soal per sesi",
      "Maksimal 10 submit IQ per hari",
      "Maksimal 10 submit SKB per hari",
      "Maksimal 3 browser/perangkat per akun",
    ],
  },
  {
    code: "MAX",
    badge: "Paket Max",
    price: "Rp50.000",
    headline: "Full akses tanpa batas submit harian",
    description: "Cocok untuk peserta yang ingin belajar intens tanpa dibatasi jumlah submit IQ atau SKB setiap hari.",
    points: [
      "Akses penuh Test IQ 120 soal per sesi",
      "Akses semua jabatan SKB 30 soal per sesi",
      "Submit IQ tanpa batas harian",
      "Submit SKB tanpa batas harian",
      "Maksimal 3 browser/perangkat per akun",
    ],
  },
]

export function UpgradeProDialog({
  triggerLabel = "Upgrade Akun",
  title = "Upgrade Akun",
  description = "Pilih paket upgrade yang paling sesuai untuk membuka akses penuh latihan KDMP dan KNMP.",
  className,
}: UpgradeProDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [snapToken, setSnapToken] = useState("")
  const [orderId, setOrderId] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<UpgradePlanCard["code"]>("PRO")

  useEffect(() => {
    if (!open) {
      setError("")
      setIsPending(false)
      setSnapToken("")
      setOrderId("")
      setSelectedPlan("PRO")
    }
  }, [open])

  async function syncPayment(nextOrderId: string) {
    const response = await fetch(browserApiUrl("/api/v1/payments/upgrade/confirm"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: nextOrderId }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.message ?? "Gagal memverifikasi pembayaran")
    }

    router.refresh()
    return data
  }

  function openSnapModal(nextSnapToken: string, nextOrderId: string) {
    const snap = window.snap
    if (!snap?.pay) {
      throw new Error("Snap Midtrans belum siap. Coba refresh halaman lagi.")
    }

    snap.pay(nextSnapToken, {
      onSuccess: async (result: { order_id?: string }) => {
        try {
          await syncPayment(result.order_id ?? nextOrderId)
          setOpen(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Pembayaran sukses, tapi sinkronisasi akun gagal")
        }
      },
      onPending: async (result: { order_id?: string }) => {
        try {
          await syncPayment(result.order_id ?? nextOrderId)
        } catch {
          return
        }
      },
      onError: (result: { status_message?: string }) => {
        setError(result.status_message ?? "Pembayaran gagal diproses")
      },
      onClose: () => {
        setIsPending(false)
      },
    })
  }

  async function handleUpgrade() {
    setError("")
    setIsPending(true)

    try {
      let nextSnapToken = snapToken
      let nextOrderId = orderId

      if (!nextSnapToken || !nextOrderId) {
        const response = await fetch(browserApiUrl("/api/v1/payments/upgrade"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountType: selectedPlan }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal membuat transaksi upgrade")
        }

        nextSnapToken = String(data.snapToken ?? "")
        nextOrderId = String(data.orderId ?? "")
        setSnapToken(nextSnapToken)
        setOrderId(nextOrderId)
      }

      openSnapModal(nextSnapToken, nextOrderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai pembayaran")
    } finally {
      setIsPending(false)
    }
  }

  const activePlan = upgradePlans.find((plan) => plan.code === selectedPlan) ?? upgradePlans[0]

  return (
    <>
      <Button type="button" size="lg" className={className} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        className="max-w-5xl"
      >
        <div className="space-y-6">
          <section className="rounded-[28px] bg-slate-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">Upgrade Membership</div>
            <h3 className="mt-3 text-3xl font-semibold">Persiapan serius untuk lolos KDMP dan KNMP</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Buka bank latihan besar untuk IQ dan SKB, lalu pilih paket yang paling pas dengan ritme belajar Anda.
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {upgradePlans.map((plan) => {
              const isSelected = plan.code === selectedPlan

              return (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.code)
                    setSnapToken("")
                    setOrderId("")
                    setError("")
                  }}
                  className={`rounded-[28px] border p-6 text-left transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                  }`}
                >
                  <div className={`text-xs uppercase tracking-[0.3em] ${isSelected ? "text-cyan-200" : "text-slate-500"}`}>
                    {plan.badge}
                  </div>
                  <div className="mt-3 text-3xl font-semibold">{plan.price}</div>
                  <h4 className="mt-3 text-xl font-semibold">{plan.headline}</h4>
                  <p className={`mt-3 text-sm leading-7 ${isSelected ? "text-slate-200" : "text-slate-600"}`}>
                    {plan.description}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {plan.points.map((point) => (
                      <div
                        key={point}
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isSelected ? "bg-white/10 text-slate-100" : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </section>

          <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-amber-800">Paket terpilih</div>
            <p className="mt-2 text-sm leading-7 text-amber-900">
              <strong>{activePlan.badge}</strong> dipilih dengan harga <strong>{activePlan.price}</strong>. Setelah pembayaran berhasil, akun Anda akan mengikuti batas akses paket ini.
            </p>
          </section>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-11 rounded-2xl bg-red-400 px-5"
              onClick={() => {
                setOpen(false)
              }}
              disabled={isPending}
            >
              Kembali
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl px-5"
              onClick={handleUpgrade}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : `Upgrade ke ${activePlan.badge}`}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: { order_id?: string }) => void | Promise<void>
          onPending?: (result: { order_id?: string }) => void | Promise<void>
          onError?: (result: { status_message?: string }) => void
          onClose?: () => void
        },
      ) => void
    }
  }
}
