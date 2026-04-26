import type { Metadata } from "next"

import { SeoKeywordPage } from "@/components/seo-keyword-page"

export const metadata: Metadata = {
  title: "Try Out KNMP",
  description:
    "Try Out KNMP untuk persiapan seleksi Koperasi Nelayan Merah Putih dengan latihan test kognitif, TO, dan SKB jabatan koperasi nelayan.",
  alternates: {
    canonical: "/try-out-knmp",
  },
}

export default function TryOutKNMPPage() {
  return (
    <SeoKeywordPage
      badge="TRY OUT KNMP"
      title="Try Out KNMP untuk peserta yang menargetkan Koperasi Nelayan Merah Putih"
      description="Halaman ini menargetkan keyword Try Out KNMP bagi peserta yang ingin meningkatkan kesiapan menghadapi seleksi dan latihan berbasis koperasi nelayan."
      sections={[
        {
          title: "Try Out KNMP yang terarah",
          body: "Try Out KNMP membantu peserta membangun kebiasaan latihan yang lebih konsisten, terutama untuk soal kognitif, ketelitian kerja, dan ritme menjawab dalam sesi ujian.",
        },
        {
          title: "Fokus pada kebutuhan koperasi nelayan",
          body: "Untuk pencarian yang berkaitan dengan Koperasi Nelayan Merah Putih, halaman ini memberikan konten yang lebih dekat dengan kebutuhan latihan seleksi koperasi dan SKB jabatan.",
        },
      ]}
    />
  )
}
