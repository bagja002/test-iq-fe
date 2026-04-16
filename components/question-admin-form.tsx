"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { browserApiUrl } from "@/lib/browser-api"
import { questionIndexOptions, subtestOptions } from "@/lib/question-taxonomy"

const optionKeys = ["A", "B", "C", "D"]

export function QuestionAdminForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [questionIndex, setQuestionIndex] = useState<(typeof questionIndexOptions)[number]["value"]>("VCI")
  const [isPending, startTransition] = useTransition()

  const filteredSubtests = subtestOptions.filter((item) => item.questionIndex === questionIndex)

  function handleSubmit(formData: FormData) {
    setError("")

    const options = optionKeys.map((key) => ({
      key,
      content: String(formData.get(`option_${key}`) ?? ""),
      mediaUrl: String(formData.get(`option_media_${key}`) ?? ""),
      mediaAlt: String(formData.get(`option_media_alt_${key}`) ?? ""),
      isCorrect: String(formData.get("correctKey") ?? "") === key,
    }))

    const payload = {
      prompt: String(formData.get("prompt") ?? ""),
      promptMediaUrl: String(formData.get("promptMediaUrl") ?? ""),
      promptMediaAlt: String(formData.get("promptMediaAlt") ?? ""),
      difficulty: String(formData.get("difficulty") ?? "medium"),
      questionIndex: String(formData.get("questionIndex") ?? questionIndex),
      subtestCode: String(formData.get("subtestCode") ?? filteredSubtests[0]?.code ?? ""),
      status: String(formData.get("status") ?? "PUBLISHED"),
      options,
    }

    startTransition(async () => {
      try {
        const response = await fetch(browserApiUrl("/api/v1/admin/questions"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message ?? "Gagal menambah soal")
        }
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menambah soal")
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Tambah Soal Baru</h3>
        <p className="mt-1 text-sm text-slate-600">
          Form ini membuat soal pilihan ganda lengkap dengan satu jawaban benar untuk subtes VCI, PRI, WMI, atau PSI.
          Untuk soal visual, gunakan path asset lokal seperti{" "}
          <span className="font-mono text-slate-800">/question-assets/pri/block-design/prompt.svg</span>.
        </p>
      </div>

      <textarea
        name="prompt"
        required
        rows={4}
        placeholder="Tulis soal IQ di sini..."
        className="form-textarea"
      />

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="promptMediaUrl"
          placeholder="Path gambar prompt, mis. /question-assets/pri/matrix-reasoning/prompt.svg"
          className="form-control"
        />
        <input
          name="promptMediaAlt"
          placeholder="Alt text gambar prompt"
          className="form-control"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          name="questionIndex"
          className="form-select"
          value={questionIndex}
          onChange={(event) => setQuestionIndex(event.target.value as (typeof questionIndexOptions)[number]["value"])}
        >
          {questionIndexOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="subtestCode"
          className="form-select"
          defaultValue={filteredSubtests[0]?.code}
          key={questionIndex}
        >
          {filteredSubtests.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          name="difficulty"
          className="form-select"
          defaultValue="medium"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          name="status"
          className="form-select"
          defaultValue="PUBLISHED"
        >
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      <div className="grid gap-4">
        {optionKeys.map((key) => (
          <div key={key} className="grid gap-3 md:grid-cols-3">
            <input
              name={`option_${key}`}
              placeholder={`Teks opsi ${key}`}
              className="form-control"
            />
            <input
              name={`option_media_${key}`}
              placeholder={`Path gambar opsi ${key}`}
              className="form-control"
            />
            <input
              name={`option_media_alt_${key}`}
              placeholder={`Alt text opsi ${key}`}
              className="form-control"
            />
          </div>
        ))}
      </div>

      <select
        name="correctKey"
        defaultValue="A"
        className="form-select"
      >
        {optionKeys.map((key) => (
          <option key={key} value={key}>
            Jawaban benar: {key}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" className="h-12 rounded-2xl" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Soal"}
      </Button>
    </form>
  )
}
