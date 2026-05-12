import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" suppressHydrationWarning>
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12" suppressHydrationWarning>
          <div className="lg:col-span-8" suppressHydrationWarning>
            <p className="text-sm uppercase tracking-wider text-primary/90">Start today</p>
            <h2 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The healthcare layer Bangladesh has been waiting for.
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-background/70">
              Whether you&apos;re a citizen looking for trusted care, a doctor wanting to reach more patients, or a
              clinic ready to go digital — Iasis is built for you.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end" suppressHydrationWarning>
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/sign-up">
                Create your account
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              <Link href="#">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
