import type { Metadata } from "next"

import { SeoKeywordPage } from "@/components/seo-keyword-page"

export const metadata: Metadata = {
  title: "Koperasi Desa Merah Putih",
  description:
    "Latihan TO, Try Out, test kognitif, dan SKB untuk peserta yang mencari persiapan seleksi Koperasi Desa Merah Putih.",
  alternates: {
    canonical: "/koperasi-desa-merah-putih",
  },
}

export default function KoperasiDesaMerahPutihPage() {
  return (
    <SeoKeywordPage
      badge="KOPERASI DESA MERAH PUTIH"
      title="Persiapan latihan untuk Koperasi Desa Merah Putih"
      description="Halaman ini dibuat khusus untuk memperkuat keyword Koperasi Desa Merah Putih dengan bahasan Try Out, TO, latihan test kognitif, dan SKB koperasi."
      sections={[
        {
          title: "Keyword fokus Koperasi Desa Merah Putih",
          body: "Jika target Anda adalah pencarian atau kebutuhan latihan yang berkaitan dengan Koperasi Desa Merah Putih, halaman ini menjadi landing page yang menegaskan fokus topik tersebut secara langsung.",
        },
        {
          title: "Ruang latihan yang lebih terarah",
          body: "Dengan pendekatan TO dan Try Out koperasi, peserta dapat menggunakan platform ini untuk membangun pola belajar yang lebih rapi sebelum masuk ke sesi test dan latihan jabatan.",
        },
      ]}
    />
  )
}
