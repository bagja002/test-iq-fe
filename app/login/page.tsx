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
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProOfferPanel />

        <section className="glass-panel p-8 md:p-10">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Masuk</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Akses akun Anda</h2>
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
