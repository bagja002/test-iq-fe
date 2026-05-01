"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import type { UpgradePlan } from "@/lib/api-types"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { formatRupiah } from "@/lib/currency"

interface MembershipPlanFormProps {
  plans: UpgradePlan[]
}

const editablePlans = [
  {
    accountType: "PRO",
    fallbackName: "Paket Pro",
    fallbackAmount: 40000,
    note: "Semua fitur terbuka, dibatasi 10 submit IQ dan 10 submit SKB per hari.",
  },
  {
    accountType: "MAX",
    fallbackName: "Paket Max",
    fallbackAmount: 50000,
    note: "Full akses tanpa batas submit harian untuk IQ dan SKB.",
  },
] as const

export function MembershipPlanForm({ plans }: MembershipPlanFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()

  const planRows = useMemo(
    () =>
      editablePlans.map((item) => {
        const saved = plans.find((plan) => plan.accountType === item.accountType)
        return {
          ...item,
          name: saved?.name ?? item.fallbackName,
          amount: saved?.amount ?? item.fallbackAmount,
          formattedPrice: saved?.formattedPrice ?? formatRupiah(item.fallbackAmount),
        }
      }),
    [plans],
  )

  function handleSubmit(formData: FormData) {
    setError("")
    setSuccess("")

    const payload = {
      plans: planRows.map((plan) => ({
        accountType: plan.accountType,
        amount: Number(formData.get(`amount_${plan.accountType}`) ?? plan.amount),
      })),
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/admin/membership-plans"), {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal menyimpan harga membership")
        }

        setSuccess("Harga Pro dan Max berhasil diperbarui.")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan harga membership")
      }
    })
  }

  return (
    <form action={handleSubmit} className="glass-panel grid gap-5 p-6 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Harga Upgrade</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Atur harga Pro dan Max</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Harga ini dipakai di dialog upgrade peserta dan langsung dipakai saat membuat transaksi Midtrans baru.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {planRows.map((plan) => (
          <section key={plan.accountType} className="rounded-[26px] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {plan.accountType}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{plan.name}</h3>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                {plan.formattedPrice}
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{plan.note}</p>
            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              Harga dalam Rupiah
              <input
                name={`amount_${plan.accountType}`}
                type="number"
                min={1}
                step={1000}
                defaultValue={plan.amount}
                className="form-control"
              />
            </label>
          </section>
        ))}
      </div>

      <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
        Jika ada peserta yang sudah membuka Snap sebelum harga diubah, sistem akan membatalkan transaksi pending lama dan membuat Snap baru dengan harga terbaru.
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan harga..." : "Simpan Harga Upgrade"}
      </Button>
    </form>
  )
}
