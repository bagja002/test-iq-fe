import type { Metadata } from "next"

import { SeoKeywordPage } from "@/components/seo-keyword-page"

export const metadata: Metadata = {
  title: "TO KDMP",
  description:
    "TO KDMP untuk persiapan seleksi Koperasi Desa Merah Putih dengan latihan test kognitif, Try Out, dan SKB koperasi berbasis jabatan.",
  alternates: {
    canonical: "/to-kdmp",
  },
}

export default function TOKDMPPage() {
  return (
    <SeoKeywordPage
      badge="TO KDMP"
      title="TO KDMP untuk persiapan seleksi Koperasi Desa Merah Putih"
      description="Halaman ini fokus pada keyword TO KDMP untuk peserta yang ingin membangun kesiapan menghadapi test kognitif dan latihan jabatan koperasi."
      sections={[
        {
          title: "TO KDMP yang relevan untuk latihan",
          body: "TO KDMP di platform ini diarahkan untuk membantu peserta mengenali ritme soal, membiasakan diri dengan latihan terstruktur, dan menyiapkan performa yang lebih stabil saat menghadapi seleksi berbasis koperasi desa.",
        },
        {
          title: "Latihan test kognitif dan SKB koperasi",
          body: "Peserta dapat memakai platform ini sebagai ruang Try Out KDMP yang memadukan latihan kemampuan dasar dan latihan jabatan koperasi agar persiapan menjadi lebih menyeluruh.",
        },
      ]}
    />
  )
}
