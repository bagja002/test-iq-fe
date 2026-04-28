"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { QuestionImportResult } from "@iq/openapi"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { browserApiUrl } from "@/lib/browser-api"

const templateHeaders = [
  "test_type",
  "question_index",
  "subtest_code",
  "room_code",
  "prompt",
  "prompt_media_url",
  "prompt_media_alt",
  "difficulty",
  "status",
  "option_a",
  "option_a_media_url",
  "option_a_media_alt",
  "option_b",
  "option_b_media_url",
  "option_b_media_alt",
  "option_c",
  "option_c_media_url",
  "option_c_media_alt",
  "option_d",
  "option_d_media_url",
  "option_d_media_alt",
  "correct_key",
]

const templateRows = [
  [
    "IQ",
    "VCI",
    "VOCABULARY",
    "",
    "Apa arti kata inovatif?",
    "",
    "",
    "medium",
    "PUBLISHED",
    "Kreatif dan membawa pembaruan",
    "",
    "",
    "Tidak berubah",
    "",
    "",
    "Meniru kebiasaan lama",
    "",
    "",
    "Menghindari perubahan",
    "",
    "",
    "A",
  ],
  [
    "IQ",
    "PRI",
    "MATRIX_REASONING",
    "",
    "Perhatikan pola gambar berikut, pilih gambar yang melengkapi pola.",
    "/api/v1/question-assets/imports/iq/matrix-reasoning/001-prompt.png",
    "Pola matrix reasoning nomor 1",
    "medium",
    "PUBLISHED",
    "",
    "/api/v1/question-assets/imports/iq/matrix-reasoning/001-a.png",
    "Opsi A matrix 1",
    "",
    "/api/v1/question-assets/imports/iq/matrix-reasoning/001-b.png",
    "Opsi B matrix 1",
    "",
    "/api/v1/question-assets/imports/iq/matrix-reasoning/001-c.png",
    "Opsi C matrix 1",
    "",
    "/api/v1/question-assets/imports/iq/matrix-reasoning/001-d.png",
    "Opsi D matrix 1",
    "C",
  ],
  [
    "SKB",
    "SKB",
    "MANAGER_OPERASIONAL_KNMP",
    "MANAGER_OPERASIONAL_KNMP",
    "Dalam pengelolaan operasional koperasi, tindakan pertama saat distribusi barang terlambat adalah?",
    "",
    "",
    "medium",
    "PUBLISHED",
    "Mengevaluasi penyebab keterlambatan dan membuat rencana koreksi",
    "",
    "",
    "Menghentikan seluruh kegiatan operasional",
    "",
    "",
    "Menunggu arahan tanpa tindakan",
    "",
    "",
    "Menghapus data distribusi lama",
    "",
    "",
    "A",
  ],
]

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function downloadTemplate() {
  const rows = [templateHeaders, ...templateRows]
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "template-import-soal.csv"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function QuestionImportDialog() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<QuestionImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError("")
    setResult(null)

    const file = formData.get("file")
    if (!(file instanceof File) || file.size === 0) {
      setError("Pilih file Excel atau CSV terlebih dahulu.")
      return
    }

    startTransition(async () => {
      try {
        const payload = new FormData()
        payload.set("file", file)

        const response = await fetch(browserApiUrl("/api/v1/admin/questions/import"), {
          method: "POST",
          credentials: "include",
          body: payload,
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Import soal gagal")
        }

        setResult(data.result)
        fileInputRef.current?.form?.reset()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import soal gagal")
      }
    })
  }

  return (
    <>
      <Button type="button" variant="outline" className="h-11 rounded-2xl px-5" onClick={() => setOpen(true)}>
        Import Excel
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setError("")
            setResult(null)
          }
        }}
        title="Import Soal"
        description="Upload file .xlsx atau .csv sesuai template. Untuk soal gambar, isi kolom path gambar seperti /api/v1/question-assets/imports/...."
        className="max-w-3xl"
      >
        <form action={handleSubmit} className="space-y-5">
          <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div>
              <label htmlFor="questionImportFile" className="text-sm font-medium text-slate-700">
                File import
              </label>
              <input
                ref={fileInputRef}
                id="questionImportFile"
                name="file"
                type="file"
                accept=".xlsx,.csv"
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="h-10 rounded-2xl px-4" onClick={downloadTemplate}>
                Download Template CSV
              </Button>
              <div className="rounded-2xl bg-white px-4 py-3 text-xs leading-6 text-slate-600">
                File CSV bisa dibuka dan diedit lewat Excel. Upload juga mendukung .xlsx asli.
              </div>
            </div>
          </div>

          {result ? (
            <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm font-semibold text-emerald-800">Import selesai</div>
              <div className="mt-3 grid gap-3 text-sm text-emerald-900 md:grid-cols-3">
                <div>Total baris: {result.totalRows}</div>
                <div>Berhasil: {result.importedCount}</div>
                <div>Gagal: {result.failedCount}</div>
              </div>
              {result.errors.length > 0 ? (
                <div className="mt-4 max-h-52 overflow-auto rounded-2xl bg-white p-4">
                  {result.errors.map((item) => (
                    <div key={`${item.rowNumber}-${item.message}`} className="text-sm leading-7 text-rose-700">
                      Baris {item.rowNumber}: {item.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-2xl px-5" onClick={() => setOpen(false)}>
              Tutup
            </Button>
            <Button type="submit" className="h-11 rounded-2xl px-5" disabled={isPending}>
              {isPending ? "Mengimport..." : "Import Soal"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
