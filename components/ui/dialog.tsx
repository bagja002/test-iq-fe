"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby={description ? "admin-dialog-description" : undefined}
          className={cn(
            "w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div>
              <h2 id="admin-dialog-title" className="text-xl font-semibold text-slate-950">
                {title}
              </h2>
              {description ? (
                <p
                  id="admin-dialog-description"
                  className="mt-2 max-w-2xl text-sm leading-7 text-slate-600"
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
            >
              Tutup
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
