import { cn } from "@/lib/utils"

type Urgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

const STYLES: Record<Urgency, string> = {
  LOW: "bg-emerald-50 text-emerald-900 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-900 border-amber-200",
  HIGH: "bg-orange-50 text-orange-900 border-orange-200",
  CRITICAL: "bg-rose-50 text-rose-900 border-rose-300",
}

const LABEL: Record<Urgency, string> = {
  LOW: "Low urgency",
  MEDIUM: "Medium urgency",
  HIGH: "High urgency",
  CRITICAL: "Critical",
}

export function UrgencyPill({ urgency, className }: { urgency: Urgency; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[urgency],
        className,
      )}
    >
      {LABEL[urgency]}
    </span>
  )
}
