import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AssessmentForm } from "@/components/mental-health/assessment-form"
import { PHQ9_QUESTIONS } from "@/lib/mental-health"
import { submitPhq9 } from "@/app/app/mental-health/actions"

export const metadata = {
  title: "PHQ-9 — depression screen",
}

export default function Phq9Page() {
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
        <p className="text-sm uppercase tracking-wider text-primary">Depression screen</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">PHQ-9</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A validated 9-question screen for depression. Be honest — this is for your benefit and is end-to-end private.
        </p>
      </header>

      <div className="mt-8">
        <AssessmentForm questions={PHQ9_QUESTIONS} action={submitPhq9} />
      </div>
    </div>
  )
}
