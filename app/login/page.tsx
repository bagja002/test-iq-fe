import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { ProOfferPanel } from "@/components/pro-offer-panel"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Login Try Out KDMP KNMP",
  description:
    "Login ke platform TO dan Try Out KDMP KNMP untuk latihan Koperasi Desa Merah Putih, Koperasi Nelayan Merah Putih, test kognitif, dan SKB jabatan koperasi.",
}

export default async function LoginPage() {
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
            <p className="text-xs uppercase tracking-[0.24em] text-amber-600 md:text-sm md:tracking-[0.3em]">Masuk</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Akses akun Anda</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Gunakan email dan password yang sudah terdaftar untuk masuk ke dashboard peserta atau admin.
            </p>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  )
}
