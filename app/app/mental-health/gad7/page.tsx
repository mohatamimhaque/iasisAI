import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AssessmentForm } from "@/components/mental-health/assessment-form"
import { GAD7_QUESTIONS } from "@/lib/mental-health"
import { submitGad7 } from "@/app/app/mental-health/actions"

export const metadata = {
  title: "GAD-7 — anxiety screen",
}

export default function Gad7Page() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/mental-health"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <header className="mt-6">
        <p className="text-sm uppercase tracking-wider text-primary">Anxiety screen</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">GAD-7</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A validated 7-question screen for generalized anxiety. Answers are stored in your private encrypted timeline.
        </p>
      </header>

      <div className="mt-8">
        <AssessmentForm questions={GAD7_QUESTIONS} action={submitGad7} />
      </div>
    </div>
  )
}
