import { redirect } from "next/navigation"

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
        <section className="glass-panel overflow-hidden p-8 md:p-10">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
            Test IQ Untuk Seleksi
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            Mulai dari pendaftaran kandidat, lalu lanjut ke test.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            Flow production untuk peserta dimulai dari daftar akun terlebih dahulu. Setelah itu,
            peserta bisa login, mengerjakan test, dan melihat skor akhir dari dashboard masing-masing.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Daftar Mandiri", text: "Peserta membuat akun sendiri tanpa menunggu admin input manual." },
              { title: "Siap Seleksi", text: "Cocok untuk screening kandidat dengan alur yang rapi dan cepat." },
              { title: "Admin Terkontrol", text: "Akun admin tetap dikelola terpisah untuk keamanan operasional." },
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
