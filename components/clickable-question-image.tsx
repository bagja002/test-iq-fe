"use client"

import Image from "next/image"
import { useState, type KeyboardEvent, type MouseEvent } from "react"
import { ZoomIn } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ClickableQuestionImageProps {
  src: string
  alt: string
  title?: string
  width: number
  height: number
  className?: string
  imageClassName?: string
}

export function ClickableQuestionImage({
  src,
  alt,
  title = "Preview gambar soal",
  width,
  height,
  className,
  imageClassName,
}: ClickableQuestionImageProps) {
  const [open, setOpen] = useState(false)

  function openPreview(event: MouseEvent | KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Lihat gambar: ${alt}`}
        className={cn("group relative block cursor-zoom-in", className)}
        onClick={openPreview}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            openPreview(event)
          }
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className={imageClassName}
        />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-2xl bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
          <ZoomIn className="size-4" />
          Lihat
        </span>
      </span>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="Klik area luar atau tombol Tutup untuk kembali."
        className="max-w-6xl"
      >
        <div className="rounded-[28px] bg-slate-50 p-3">
          <Image
            src={src}
            alt={alt}
            width={1400}
            height={1000}
            unoptimized
            className="max-h-[72vh] w-full rounded-[24px] object-contain"
          />
        </div>
      </Dialog>
    </>
  )
}
