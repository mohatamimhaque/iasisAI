import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TriageIntakeForm } from "@/components/triage/triage-intake-form"

export const metadata = {
  title: "New AI Triage",
}

export default function NewTriagePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/triage"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to triage
      </Link>

      <header className="mt-6">
        <p className="text-sm uppercase tracking-wider text-primary">AI Triage</p>
        <h1 className="mt-1 text-balance font-serif text-4xl tracking-tight text-foreground">
          Tell us how you feel.
        </h1>
        <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Iasis AI uses your symptoms and basic profile to suggest possible conditions, recommended tests, and which
          specialist to see. You will see results in seconds.
        </p>
      </header>

      <section className="mt-10">
        <TriageIntakeForm />
      </section>
    </div>
  )
}
