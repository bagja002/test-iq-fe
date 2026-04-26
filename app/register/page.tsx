import { redirect } from "next/navigation"

import { ProOfferPanel } from "@/components/pro-offer-panel"
import { RegisterForm } from "@/components/register-form"
import { getSession } from "@/lib/session"

export default async function RegisterPage() {
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
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Daftar</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Buat akun peserta baru</h2>
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
