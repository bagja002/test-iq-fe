import type { Metadata } from "next"

import { SeoKeywordPage } from "@/components/seo-keyword-page"

export const metadata: Metadata = {
  title: "Koperasi Nelayan Merah Putih",
  description:
    "Latihan TO, Try Out, test kognitif, dan SKB untuk peserta yang mencari persiapan seleksi Koperasi Nelayan Merah Putih.",
  alternates: {
    canonical: "/koperasi-nelayan-merah-putih",
  },
}

export default function KoperasiNelayanMerahPutihPage() {
  return (
    <SeoKeywordPage
      badge="KOPERASI NELAYAN MERAH PUTIH"
      title="Persiapan latihan untuk Koperasi Nelayan Merah Putih"
      description="Halaman ini menargetkan keyword Koperasi Nelayan Merah Putih dengan dukungan konten TO, Try Out, test kognitif, dan latihan SKB koperasi."
      sections={[
        {
          title: "Keyword fokus Koperasi Nelayan Merah Putih",
          body: "Untuk pencarian yang mengarah ke Koperasi Nelayan Merah Putih, halaman ini dibuat agar Google melihat topik yang jelas, spesifik, dan relevan dengan kebutuhan latihan peserta.",
        },
        {
          title: "Try Out dan latihan koperasi nelayan",
          body: "Peserta dapat memakai platform ini sebagai basis latihan Try Out dan TO yang lebih dekat dengan konteks koperasi, terutama bagi yang ingin membangun kesiapan sebelum mengikuti seleksi sebenarnya.",
        },
      ]}
    />
  )
}
