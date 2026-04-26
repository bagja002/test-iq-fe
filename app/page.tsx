import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { ProOfferPanel } from "@/components/pro-offer-panel"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "TO Try Out KDMP KNMP untuk Koperasi Desa Merah Putih",
  description:
    "TO dan Try Out KDMP KNMP untuk persiapan seleksi Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih. Latihan test kognitif dan SKB koperasi berbasis jabatan.",
}

const seoPoints = [
  {
    title: "TO dan Try Out KDMP KNMP",
    text: "Halaman ini dirancang untuk peserta yang mencari TO dan Try Out KDMP KNMP dengan fokus pada pola test kognitif dan latihan jabatan koperasi.",
  },
  {
    title: "Koperasi Desa Merah Putih",
    text: "Materi dan arah latihan cocok untuk kebutuhan persiapan Koperasi Desa Merah Putih, baik dari sisi kemampuan dasar maupun pemahaman jabatan.",
  },
  {
    title: "Koperasi Nelayan Merah Putih",
    text: "Peserta yang menargetkan Koperasi Nelayan Merah Putih juga bisa memakai platform ini untuk membangun ritme latihan try out dan SKB berbasis posisi.",
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
      "Ya, arah kontennya dibuat relevan untuk kata kunci Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih, terutama pada latihan dasar dan latihan berbasis jabatan koperasi.",
  },
  {
    question: "Apa yang didapat di akun Pro?",
    answer:
      "Akun Pro membuka akses Try Out KDMP KNMP yang lebih lengkap, termasuk paket test kognitif, paket SKB jabatan, dan bank soal yang lebih besar untuk latihan berulang.",
  },
]

export default async function Page() {
  const session = await getSession()
  if (session.authenticated) {
    redirect("/dashboard")
  }

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
    <main className="page-shell space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="glass-panel overflow-hidden p-8 md:p-12">
        <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
          TO • TRY OUT • KDMP • KNMP
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          TO Try Out KDMP KNMP untuk Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
          Platform ini membantu peserta berlatih test kognitif dan SKB koperasi dengan pendekatan yang lebih terarah untuk kebutuhan seleksi KDMP, KNMP, Koperasi Desa Merah Putih, dan Koperasi Nelayan Merah Putih.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-2xl bg-slate-950 px-6 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Daftar Try Out
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-6 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            Masuk ke Platform
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {seoPoints.map((item) => (
          <article key={item.title} className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>

      <ProOfferPanel />

      <section className="glass-panel p-8 md:p-10">
        <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Bahasan Utama</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Keyword utama yang dibahas di halaman ini</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-950">Try Out Koperasi Desa Merah Putih</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Jika Anda mencari Try Out Koperasi Desa Merah Putih, halaman ini menempatkan latihan test kognitif dan SKB koperasi sebagai fondasi utama. Fokusnya bukan hanya latihan soal, tetapi juga ritme latihan yang konsisten untuk seleksi berbasis koperasi desa.
            </p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-950">Try Out Koperasi Nelayan Merah Putih</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Untuk peserta yang membidik Koperasi Nelayan Merah Putih, platform ini juga cocok dipakai sebagai ruang Try Out dan TO berulang, terutama untuk membangun kesiapan menghadapi test dasar dan SKB jabatan yang terkait dengan operasional koperasi.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-8 md:p-10">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-600">FAQ</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Pertanyaan yang sering dicari</h2>
        <div className="mt-6 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-[24px] bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel p-8 md:p-10">
        <div className="text-sm uppercase tracking-[0.3em] text-amber-600">Topik Terkait</div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Halaman keyword yang bisa dijelajahi</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/to-kdmp" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            TO KDMP
          </Link>
          <Link href="/try-out-knmp" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            Try Out KNMP
          </Link>
          <Link href="/koperasi-desa-merah-putih" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            Koperasi Desa Merah Putih
          </Link>
          <Link href="/koperasi-nelayan-merah-putih" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            Koperasi Nelayan Merah Putih
          </Link>
        </div>
      </section>
    </main>
  )
}
