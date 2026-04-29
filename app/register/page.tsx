import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProOfferPanel } from "@/components/pro-offer-panel"
import { RegisterForm } from "@/components/register-form"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Daftar Try Out KDMP KNMP",
  description:
    "Daftar akun untuk mengakses TO dan Try Out KDMP KNMP, latihan Koperasi Desa Merah Putih, Koperasi Nelayan Merah Putih, test kognitif, dan SKB koperasi.",
}

export default async function RegisterPage() {
  const session = await getSession()
  if (session.authenticated) {
    redirect("/dashboard")
  }

  return (
    <main className="page-shell flex items-center justify-center">
      <div className="grid w-full items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <ProOfferPanel />

        <section className="glass-panel order-first p-5 md:p-10 lg:order-none">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-600 md:text-sm md:tracking-[0.3em]">Daftar</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Buat akun peserta baru</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Setelah registrasi berhasil, Anda akan langsung masuk ke dashboard peserta.
            </p>
          </div>
          <RegisterForm />
        </section>
      </div>
    </main>
  )
}
