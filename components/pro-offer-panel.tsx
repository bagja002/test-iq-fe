interface ProOfferPanelProps {
  compact?: boolean
}

const offerHighlights = [
  "20 paket test kognitif",
  "Sekitar 2.500 soal latihan",
  "20 paket SKB jabatan",
  "Sekitar 2.000 soal tervalid",
]

export function ProOfferPanel({ compact = false }: ProOfferPanelProps) {
  return (
    <section className="glass-panel overflow-hidden p-8 md:p-10">
      <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
        TO Try Out KDMP KNMP
      </div>
      <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
        Persiapan serius untuk Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
        Bukan sekadar akses test biasa. Paket Pro dirancang untuk peserta yang mencari TO, TRY OUT, KDMP, KNMP, latihan koperasi, dan materi nelayan yang lebih relevan untuk kebutuhan seleksi.
      </p>

      <div className={`mt-8 grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        {offerHighlights.map((item) => (
          <div key={item} className="rounded-[24px] bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">{item}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[28px] bg-slate-950 p-6 text-white">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">Yang didapat</div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
          Akses penuh ke latihan kognitif, bank soal besar, paket SKB jabatan, dan pengalaman Try Out KDMP KNMP yang lebih siap untuk menghadapi seleksi Koperasi Desa Merah Putih maupun Koperasi Nelayan Merah Putih.
        </p>
      </div>
    </section>
  )
}
