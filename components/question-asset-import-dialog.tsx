"use client"

import { useRef, useState, useTransition } from "react"
import type { QuestionAssetImportResult } from "@/lib/api-types"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { browserApiUrl } from "@/lib/browser-api"

export function QuestionAssetImportDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<QuestionAssetImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError("")
    setResult(null)

    const file = formData.get("file")
    if (!(file instanceof File) || file.size === 0) {
      setError("Pilih file ZIP gambar terlebih dahulu.")
      return
    }

    startTransition(async () => {
      try {
        const payload = new FormData()
        payload.set("file", file)

        const response = await fetch(browserApiUrl("/api/v1/admin/question-assets/import"), {
          method: "POST",
          credentials: "include",
          body: payload,
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Import gambar gagal")
        }

        setResult(data.result)
        fileInputRef.current?.form?.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import gambar gagal")
      }
    })
  }

  return (
    <>
      <Button type="button" className="h-11 rounded-2xl px-5" onClick={() => setOpen(true)}>
        Import Gambar ZIP
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
        title="Import Gambar Soal"
        description="Upload ZIP berisi gambar soal. Path di dalam ZIP akan menjadi URL /api/v1/question-assets/...."
        className="max-w-3xl"
      >
        <form action={handleSubmit} className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <label htmlFor="questionAssetImportFile" className="text-sm font-medium text-slate-700">
              File ZIP gambar
            </label>
            <input
              ref={fileInputRef}
              id="questionAssetImportFile"
              name="file"
              type="file"
              accept=".zip"
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            />
            <p className="mt-3 text-xs leading-6 text-slate-600">
              Contoh isi ZIP: imports/iq/matrix-reasoning/001-prompt.png. URL yang dipakai di Excel menjadi /api/v1/question-assets/imports/iq/matrix-reasoning/001-prompt.png.
            </p>
          </div>

          {result ? (
            <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm font-semibold text-emerald-800">Import gambar selesai</div>
              <div className="mt-3 grid gap-3 text-sm text-emerald-900 md:grid-cols-2">
                <div>Berhasil: {result.uploadedCount}</div>
                <div>Dilewati: {result.skippedCount}</div>
              </div>
              {result.files.length > 0 ? (
                <div className="mt-4 max-h-52 overflow-auto rounded-2xl bg-white p-4">
                  {result.files.map((file) => (
                    <div key={file} className="break-all text-sm leading-7 text-slate-700">
                      {file}
                    </div>
                  ))}
                </div>
              ) : null}
              {result.errors.length > 0 ? (
                <div className="mt-4 max-h-36 overflow-auto rounded-2xl bg-white p-4">
                  {result.errors.map((item) => (
                    <div key={item} className="text-sm leading-7 text-rose-700">
                      {item}
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
              {isPending ? "Mengupload..." : "Upload Gambar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
