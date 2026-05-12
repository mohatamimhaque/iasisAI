"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FREQUENCY_OPTIONS } from "@/lib/mental-health"

type Props = {
  questions: readonly string[]
  action: (formData: FormData) => Promise<void>
}

export function AssessmentForm({ questions, action }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer every question")
      return
    }
    for (let i = 0; i < questions.length; i++) {
      formData.set(`q${i}`, String(answers[i]))
    }
    startTransition(async () => {
      try {
        await action(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">
              <span className="mr-2 text-primary">{i + 1}.</span>
              Over the last 2 weeks, how often have you been bothered by: <span className="font-normal text-foreground">{q}</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FREQUENCY_OPTIONS.map((opt) => {
                const active = answers[i] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt.value }))}
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      active ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium">{opt.label}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">+{opt.value}</span>
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit assessment"}
        </Button>
      </div>
    </form>
  )
}
