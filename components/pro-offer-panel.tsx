import { BadgeCheck, BookMarked, Layers3, ShieldCheck } from "lucide-react"

interface ProOfferPanelProps {
  compact?: boolean
}

const offerHighlights = [
  {
    icon: BookMarked,
    title: "20 paket test kognitif",
    text: " 2.500 soal untuk latihan TO dan Try Out.",
  },
  {
    icon: Layers3,
    title: "20 paket SKB jabatan",
    text: " 2.000 soal SKB seputar posisi KDMP dan KNMP.",
  },
  {
    icon: ShieldCheck,
    title: "Soal tervalid",
    text: "Materi dibuat lebih terarah untuk kebutuhan seleksi koperasi.",
  },
  {
    icon: BadgeCheck,
    title: "Riwayat nilai",
    text: "Hasil IQ dan SKB tersimpan agar perkembangan mudah dibaca.",
  },
]

export function ProOfferPanel({ compact = false }: ProOfferPanelProps) {
  return (
    <section className="glass-panel relative overflow-hidden p-6 md:p-8">
      <div className="absolute -right-16 -top-16 size-52 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="absolute -bottom-20 left-6 size-56 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative">
        <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-teal-700">
          TO Try Out KDMP KNMP
        </div>
        <h1 className={`${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"} mt-6 max-w-2xl font-black tracking-[-0.045em] text-slate-950`}>
          Latihan koperasi yang dibuat lebih fokus, bukan sekadar kumpulan soal.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
          Cocok untuk persiapan Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih, mulai dari test kognitif sampai SKB jabatan.
        </p>

        <div className={`mt-7 grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
          {offerHighlights.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                <div className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="size-4" />
                </div>
                <div className="mt-4 text-sm font-black text-slate-950">{item.title}</div>
                <p className="mt-2 text-xs leading-6 text-slate-500">{item.text}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-7 rounded-[28px] bg-slate-950 p-5 text-white">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">Akun Pro & Max</div>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Pro membuka semua fitur dengan batas percobaan harian. Max memberi akses penuh tanpa batas, tetap dibatasi maksimal 3 device per akun.
          </p>
        </div>
      </div>
    </section>
  )
}
