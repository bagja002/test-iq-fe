"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/questions", label: "Soal" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/results", label: "Hasil" },
  { href: "/admin/settings", label: "Settings" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="glass-panel flex flex-wrap gap-3 p-4">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300",
            ].join(" ")}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
