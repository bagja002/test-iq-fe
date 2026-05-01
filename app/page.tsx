import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BadgeCheck, BookOpen, BookOpenCheck, ClipboardList, Route, Sparkles, Waves } from "lucide-react"

import type { UpgradePlan } from "@/lib/api-types"

import { formatRupiah } from "@/lib/currency"
import { fetchApi } from "@/lib/server-api"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "TO Try Out KDMP KNMP untuk Koperasi Desa Merah Putih",
  description:
    "TO dan Try Out KDMP KNMP untuk persiapan seleksi Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih. Latihan test kognitif dan SKB koperasi berbasis jabatan.",
}

const metrics = [
  {
    value: "20",
    label: "Paket test kognitif",
    detail: "Bank latihan  2.000 soal untuk membangun ritme TO.",
  },
  {
    value: "20",
    label: "Paket SKB jabatan",
    detail: "Materi SKB seputar peran KDMP dan KNMP yang tervalid.",
  },
  {
    value: "5",
    label: "Pilihan jabatan",
    detail: "Soal SKB otomatis mengikuti posisi yang dipilih peserta.",
  },
]

const roles = [
  "Manager - KDMP",
  "Manager Operasional - KNMP",
  "Kepala Produksi - KNMP",
  "Penjamin Mutu - KNMP",
  "Administrasi Keuangan - KNMP",
]

const learningFlow = [
  {
    icon: BookOpenCheck,
    title: "Mulai dari Test IQ",
    text: "Latihan kognitif dibagi per bagian agar peserta tidak bingung dan bisa fokus satu index sampai selesai.",
  },
  {
    icon: ClipboardList,
    title: "Lanjut SKB Jabatan",
    text: "SKB tampil sesuai jabatan peserta, jadi bank soal yang keluar lebih relevan dengan posisi yang diampu.",
  },
  {
    icon: Route,
    title: "Pantau Riwayat Nilai",
    text: "Hasil latihan tersimpan agar peserta bisa melihat perkembangan dan mengulang dengan soal yang berubah.",
  },
]

const fallbackUpgradePlans: UpgradePlan[] = [
  {
    accountType: "PRO",
    productCode: "PRO_UPGRADE",
    name: "Paket Pro",
    description: "Semua fitur terbuka dengan batas 10 submit IQ dan 10 submit SKB per hari.",
    amount: 40000,
    formattedPrice: formatRupiah(40000),
    submitLimitPerDay: 10,
    isActive: true,
  },
  {
    accountType: "MAX",
    productCode: "MAX_UPGRADE",
    name: "Paket Max",
    description: "Full akses tanpa batas submit harian untuk IQ dan SKB.",
    amount: 50000,
    formattedPrice: formatRupiah(50000),
    submitLimitPerDay: 0,
    isActive: true,
  },
]

const planBenefits: Record<UpgradePlan["accountType"], string[]> = {
  PRO: [
    "Semua fitur IQ dan SKB terbuka",
    "10x submit IQ per hari",
    "10x submit SKB per hari",
    "SKB otomatis sesuai jabatan akun",
    "Maksimal 3 browser/perangkat per akun",
  ],
  MAX: [
    "Full akses IQ dan SKB tanpa batas submit harian",
    "Cocok untuk latihan intens berulang",
    "Soal berubah saat attempt baru dimulai",
    "Riwayat nilai IQ dan SKB tersimpan",
    "Maksimal 3 browser/perangkat per akun",
  ],
}

const seoPoints = [
  {
    title: "TO dan Try Out KDMP KNMP",
    text: "Halaman ini menargetkan peserta yang mencari TO dan Try Out KDMP KNMP dengan fokus pada pola test kognitif dan latihan SKB berbasis jabatan koperasi.",
  },
  {
    title: "Koperasi Desa Merah Putih",
    text: "Latihan dirancang untuk membantu calon peserta memahami arah persiapan Koperasi Desa Merah Putih, mulai dari kemampuan dasar hingga kesiapan jabatan.",
  },
  {
    title: "Koperasi Nelayan Merah Putih",
    text: "Peserta Koperasi Nelayan Merah Putih dapat memakai platform ini sebagai ruang simulasi berulang untuk meningkatkan ketelitian, kecepatan, dan pemahaman koperasi.",
  },
]

const faqItems = [
  {
    question: "Apa itu TO dan Try Out KDMP KNMP di platform ini?",
    answer:
      "TO dan Try Out di platform ini adalah simulasi latihan untuk membantu peserta mempersiapkan diri menghadapi seleksi KDMP dan KNMP, termasuk test kognitif dan SKB jabatan koperasi.",
  },
  {
    question: "Apakah materi cocok untuk Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih?",
    answer:
      "Ya, arah kontennya dibuat relevan untuk Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih, terutama pada latihan dasar dan latihan berbasis jabatan koperasi.",
  },
  {
    question: "Apa bedanya akun gratis, Pro, dan Max?",
    answer:
      "Akun gratis hanya mendapat akses terbatas. Pro membuka fitur utama dengan batas percobaan harian, sedangkan Max memberi akses penuh tanpa batas latihan.",
  },
]

async function getLandingUpgradePlans() {
  try {
    const response = await fetchApi<{ plans: UpgradePlan[] }>("/api/v1/payments/upgrade/plans", {
      withCookies: false,
    })
    const plans = response.plans?.filter((plan) => plan.isActive) ?? []
    if (plans.length === 0) {
      return fallbackUpgradePlans
    }

    return fallbackUpgradePlans.map(
      (fallback) => plans.find((plan) => plan.accountType === fallback.accountType) ?? fallback,
    )
  } catch {
    return fallbackUpgradePlans
  }
}

export default async function Page() {
  const session = await getSession()
  if (session.authenticated) {
    redirect("/dashboard")
  }
  const upgradePlans = await getLandingUpgradePlans()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TO Try Out KDMP KNMP",
    description:
      "Platform TO dan Try Out KDMP KNMP untuk persiapan Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih.",
    inLanguage: "id-ID",
    keywords:
      "TO, TRY OUT, KDMP, KNMP, Koperasi, Nelayan, Koperasi Desa Merah Putih, Koperasi Nelayan Merah Putih",
  }

  return (
    <main className="landing-canvas min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 md:px-8 md:py-8">
        <nav className="landing-reveal flex items-center justify-between rounded-[28px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] backdrop-blur md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_34px_-24px_rgba(15,23,42,0.9)]">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.22em] text-slate-950">KDMP KNMP</span>
              <span className="block text-xs font-medium text-slate-500">Try Out Koperasi Merah Putih</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_16px_36px_-22px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Daftar
            </Link>
          </div>
        </nav>

        <section className="grid items-stretch gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="landing-reveal glass-panel relative overflow-hidden p-6 md:p-10 lg:p-12">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-cyan-200/50 blur-3xl" />
            <div className="absolute bottom-10 right-8 hidden h-28 w-28 rounded-[36px] border border-amber-200 bg-amber-100/70 rotate-12 md:block" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                <Sparkles className="size-4" />
                TO • TRY OUT • KDMP • KNMP
              </div>
              <h1 className="mt-7 max-w-4xl text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-6xl lg:text-7xl">
                Ruang latihan yang lebih rapi untuk calon pengelola koperasi.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Persiapan TO dan Try Out KDMP KNMP untuk Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih, dengan alur test kognitif, SKB jabatan, dan riwayat nilai yang mudah dipahami di mobile.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Mulai Try Out
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
                >
                  Saya sudah punya akun
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                {["Test IQ", "SKB sesuai jabatan", "Riwayat nilai", "Pro & Max"].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white/70 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="landing-reveal landing-delay-1 relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_28px_70px_-38px_rgba(15,23,42,0.9)] md:p-8">
            <div className="absolute -right-12 -top-12 size-44 rounded-full bg-cyan-400/30 blur-2xl" />
            <div className="absolute -bottom-20 -left-16 size-52 rounded-full bg-amber-300/25 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Paket Belajar</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">Kognitif + SKB</h2>
                </div>
                <Waves className="landing-float size-12 text-cyan-200" />
              </div>

              <div className="mt-8 grid gap-3">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl font-black text-amber-200">{item.value}</div>
                      <div>
                        <div className="font-black">{item.label}</div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] bg-white p-5 text-slate-950">
                <div className="flex items-center gap-2 text-sm font-black">
                  <BadgeCheck className="size-4 text-teal-600" />
                  Cocok untuk peserta non-teknis
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tombol besar, alur pendek, dan tampilan dibuat ringan supaya nyaman dipakai dari HP.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {learningFlow.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className={`landing-reveal glass-panel p-6 ${index === 1 ? "landing-delay-1" : ""} ${index === 2 ? "landing-delay-2" : ""}`}
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
              </article>
            )
          })}
        </section>

        <section className="landing-reveal glass-panel overflow-hidden p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Harga Membership</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Pilih akses latihan sesuai ritme belajar.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                Mulai gratis untuk coba preview IQ. Upgrade ke Pro atau Max untuk membuka bank soal, SKB jabatan, dan riwayat latihan yang lebih lengkap.
              </p>
            </div>
            <div className="rounded-[28px] bg-slate-950 p-5 text-white">
              <div className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Benefit Utama</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Pro cocok untuk latihan teratur harian. Max cocok untuk peserta yang ingin latihan intens tanpa batas submit harian.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {upgradePlans.map((plan) => {
              const isMax = plan.accountType === "MAX"
              return (
                <article
                  key={plan.accountType}
                  className={`relative overflow-hidden rounded-[30px] border p-6 ${
                    isMax
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  {isMax ? (
                    <div className="absolute -right-10 -top-16 size-40 rounded-full bg-cyan-300/25 blur-2xl" />
                  ) : null}
                  <div className="relative">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className={`text-xs font-black uppercase tracking-[0.28em] ${isMax ? "text-cyan-200" : "text-slate-500"}`}>
                          {plan.accountType === "PRO" ? "Paket hemat" : "Paket paling bebas"}
                        </div>
                        <h3 className="mt-3 text-2xl font-black">{plan.name}</h3>
                      </div>
                      <div className={`rounded-2xl px-4 py-2 text-sm font-black ${isMax ? "bg-white text-slate-950" : "bg-slate-950 text-white"}`}>
                        {plan.accountType}
                      </div>
                    </div>

                    <div className="mt-6 flex items-end gap-2">
                      <span className="text-4xl font-black tracking-tight md:text-5xl">{plan.formattedPrice}</span>
                      <span className={`pb-2 text-sm font-semibold ${isMax ? "text-slate-300" : "text-slate-500"}`}>
                        sekali bayar
                      </span>
                    </div>
                    <p className={`mt-4 text-sm leading-7 ${isMax ? "text-slate-200" : "text-slate-600"}`}>
                      {plan.description}
                    </p>

                    <div className="mt-6 grid gap-3">
                      {planBenefits[plan.accountType].map((benefit) => (
                        <div
                          key={benefit}
                          className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isMax ? "bg-white/10 text-slate-100" : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          <BadgeCheck className={`mt-0.5 size-4 shrink-0 ${isMax ? "text-cyan-200" : "text-emerald-600"}`} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/register"
                      className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-black transition hover:-translate-y-0.5 ${
                        isMax
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      Daftar dan pilih {plan.name}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="glass-panel landing-reveal grid gap-8 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600">SKB mengikuti jabatan</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Peserta tidak perlu memilih banyak room lagi.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              Saat peserta mendaftar, jabatan disimpan di akun. Ketika membuka SKB, sistem hanya menampilkan paket sesuai posisi tersebut sehingga pengalaman lebih sederhana.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <div key={role} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-black text-slate-950">{role}</div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Room SKB</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {seoPoints.map((item) => (
            <article key={item.title} className="glass-panel landing-reveal p-6">
              <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel landing-reveal p-6 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">Keyword Utama</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Try Out Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[28px] bg-gradient-to-br from-cyan-50 to-white p-6">
              <h3 className="text-xl font-black text-slate-950">Koperasi Desa Merah Putih</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Platform ini membantu peserta membangun kesiapan melalui TO, TRY OUT, test kognitif, dan SKB jabatan yang relevan dengan kebutuhan Koperasi Desa Merah Putih.
              </p>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-amber-50 to-white p-6">
              <h3 className="text-xl font-black text-slate-950">Koperasi Nelayan Merah Putih</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Untuk calon peserta KNMP, latihan dibuat agar bisa digunakan berulang dengan bank soal yang berubah saat attempt baru dimulai.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel landing-reveal p-6 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">FAQ</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Pertanyaan yang sering dicari</h2>
          <div className="mt-6 grid gap-4">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[24px] bg-slate-50 p-5">
                <h3 className="text-lg font-black text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-reveal mb-6 overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white md:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Siap latihan?</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Mulai dari akun gratis, upgrade saat butuh akses penuh.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
              >
                Daftar sekarang
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Masuk
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/to-kdmp" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
              TO KDMP
            </Link>
            <Link href="/try-out-knmp" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200">
              Try Out KNMP
            </Link>
            <Link
              href="/koperasi-desa-merah-putih"
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              Koperasi Desa Merah Putih
            </Link>
            <Link
              href="/koperasi-nelayan-merah-putih"
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              Koperasi Nelayan Merah Putih
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
