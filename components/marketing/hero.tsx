import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24" suppressHydrationWarning>
        <div className="lg:col-span-7" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground" suppressHydrationWarning>
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Healthcare built for every neighborhood
          </div>

          <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Healthcare that finally{" "}
            <span className="italic text-primary">reaches every South Asia</span>.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Iasis AI is the global, AI-powered healthcare layer connecting every citizen, doctor, clinic and hospital
            across South Asia. From symptom triage to telemedicine, prescriptions and lab reports — one record, one
            region, one platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" suppressHydrationWarning>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Create your account
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-8" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Districts</dt>
              <dd className="mt-1 font-serif text-3xl text-foreground">64</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Languages</dt>
              <dd className="mt-1 font-serif text-3xl text-foreground">2</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Avg. triage</dt>
              <dd className="mt-1 font-serif text-3xl text-foreground">90s</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-5" suppressHydrationWarning>
          <div className="relative" suppressHydrationWarning>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted" suppressHydrationWarning>
              <Image
                src="/marketing/hero-consult.jpg"
                alt="A patient using Iasis AI for a telemedicine consultation in a calm, modern clinic in Dhaka."
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -left-4 bottom-6 hidden max-w-[220px] rounded-xl border border-border bg-card p-4 shadow-sm sm:block lg:-left-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-xs font-medium text-foreground">DGHS-aligned</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Built to the standards of South Asia&apos;s Directorate General of Health Services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
