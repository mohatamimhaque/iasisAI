import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type ComingSoonProps = {
  eyebrow?: string
  title: string
  description: string
  icon?: LucideIcon
  features?: string[]
  backHref?: string
  backLabel?: string
  variant?: "page" | "panel"
}

export function ComingSoon({
  eyebrow = "Coming soon",
  title,
  description,
  icon: Icon = Sparkles,
  features,
  backHref = "/app",
  backLabel = "Back to dashboard",
  variant = "page",
}: ComingSoonProps) {
  const wrapper =
    variant === "panel"
      ? "rounded-2xl border border-border bg-card p-8 sm:p-12"
      : "mx-auto w-full max-w-3xl px-4 py-12 sm:py-20 lg:py-24"

  return (
    <div className={wrapper}>
      <div className="flex flex-col items-start gap-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>

        {features && features.length > 0 && (
          <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-foreground"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Button asChild size="lg" variant="outline">
          <Link href={backHref}>
            {backLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
