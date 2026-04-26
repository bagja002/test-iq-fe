"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { browserApiUrl } from "@/lib/browser-api"

interface UpgradeProDialogProps {
  triggerLabel?: string
  title?: string
  description?: string
  className?: string
}

const proBenefits = [
  {
    title: "Siap tempur untuk KDMP dan KNMP",
    description: "Dirancang untuk peserta yang ingin memaksimalkan peluang lolos seleksi KDMP dan KNMP dengan latihan yang jauh lebih lengkap.",
  },
  {
    title: "20 paket test kognitif",
    description: "Akses 20 paket latihan kognitif dengan total sekitar 2.500 soal untuk membangun kecepatan, akurasi, dan daya analisis.",
  },
  {
    title: "20 paket SKB tervalid",
    description: "Dapatkan 20 paket SKB dengan total sekitar 2.000 soal seputar jabatan, disusun untuk latihan yang lebih relevan dan tervalid.",
  },
  {
    title: "Akses semua jabatan dan hasil penuh",
    description: "Buka seluruh room SKB, latihan tanpa batas preview, dan lihat hasil lengkap untuk evaluasi belajar yang lebih serius.",
  },
]

export function UpgradeProDialog({
  triggerLabel = "Upgrade Akun ke Pro",
  title = "Upgrade Akun ke Pro",
  description = "Buka akses penuh untuk Test IQ dan seluruh jabatan SKB dengan akun Pro.",
  className,
}: UpgradeProDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [snapToken, setSnapToken] = useState("")
  const [orderId, setOrderId] = useState("")

  useEffect(() => {
    if (!open) {
      setError("")
      setIsPending(false)
    }
  }, [open])

  async function syncPayment(orderId: string) {
    const response = await fetch(browserApiUrl("/api/v1/payments/pro-upgrade/confirm"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
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
        const response = await fetch(browserApiUrl("/api/v1/payments/pro-upgrade"), {
          method: "POST",
          credentials: "include",
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
        className="max-w-3xl"
      >
        <div className="space-y-6">
          <section className="rounded-[28px] bg-slate-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">Paket Pro</div>
            <h3 className="mt-3 text-3xl font-semibold">Persiapan serius untuk lolos KDMP dan KNMP</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Upgrade ke Pro untuk membuka bank latihan besar, paket kognitif lengkap, dan SKB jabatan tervalid dalam satu akun.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {proBenefits.map((benefit) => (
              <article key={benefit.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-lg font-semibold text-slate-950">{benefit.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">{benefit.description}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-amber-800">Nilai jual paket Pro</div>
            <p className="mt-2 text-sm leading-7 text-amber-900">
              Dengan <strong>Rp30.000</strong>, peserta membuka akses latihan kognitif dan SKB yang jauh lebih besar: <strong>20 paket kognitif</strong>, sekitar <strong>2.500 soal</strong>, <strong>20 paket SKB</strong>, dan sekitar <strong>2.000 soal jabatan tervalid</strong>.
            </p>
          </section>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"

              className="h-11 bg-red-400 rounded-2xl px-5"
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
              {isPending ? "Memproses..." : "Upgrade"}
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
