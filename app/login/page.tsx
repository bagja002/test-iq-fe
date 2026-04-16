import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { getSession } from "@/lib/session"

export default async function LoginPage() {
  const session = await getSession()
  if (session.authenticated) {
    redirect("/dashboard")
  }

  return (
    <main className="page-shell flex items-center justify-center">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel overflow-hidden p-8 md:p-10">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
            Test IQ Untuk Seleksi
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            Tes kemampuan dasar yang rapi untuk screening kandidat.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            Brand-nya tetap Test IQ, tetapi flow-nya dibuat cocok untuk kebutuhan seleksi kerja:
            peserta daftar akun terlebih dahulu, mengerjakan test, lalu admin memantau hasil dari satu panel.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Daftar Dulu", text: "Peserta membuat akun sendiri sebelum login dan mulai test." },
              { title: "Autosave", text: "Jawaban tersimpan bertahap agar koneksi putus tidak bikin progres hilang." },
              { title: "Role-based", text: "Dashboard otomatis menyesuaikan antara peserta dan admin." },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

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
