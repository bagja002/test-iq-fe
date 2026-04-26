interface AdminStatCardProps {
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "cyan" | "amber" | "emerald"
}

const toneClasses: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "bg-slate-50",
  cyan: "bg-cyan-50",
  amber: "bg-amber-50",
  emerald: "bg-emerald-50",
}

export function AdminStatCard({
  label,
  value,
  hint,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <div className={`rounded-[24px] p-5 ${toneClasses[tone]}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
      {hint ? <div className="mt-2 text-sm text-slate-600">{hint}</div> : null}
    </div>
  )
}
