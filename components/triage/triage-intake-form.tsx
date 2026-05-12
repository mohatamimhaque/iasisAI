"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const DURATION_OPTIONS = [
  { value: "less_than_24h", label: "Less than 24 hours" },
  { value: "1_3_days", label: "1–3 days" },
  { value: "3_7_days", label: "3–7 days" },
  { value: "1_2_weeks", label: "1–2 weeks" },
  { value: "more_than_2_weeks", label: "More than 2 weeks" },
]

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild", hint: "Annoying but functional" },
  { value: "moderate", label: "Moderate", hint: "Hard to ignore" },
  { value: "severe", label: "Severe", hint: "Can't function normally" },
]

export function TriageIntakeForm() {
  const router = useRouter()
  const [symptoms, setSymptoms] = useState("")
  const [duration, setDuration] = useState<string>("")
  const [severity, setSeverity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = symptoms.trim().length >= 10 && !isLoading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          duration: duration || null,
          severity: severity || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Something went wrong")
      }
      const data = await res.json()
      router.push(`/app/triage/${data.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Label htmlFor="symptoms" className="text-base font-medium text-foreground">
          What are you feeling?
        </Label>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Describe your symptoms in your own words. Mention where it hurts, when it started, and anything that makes it
          better or worse.
        </p>
        <Textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="For example: I've had fever and body ache for three days. My temperature is around 102°F at night. I also have a headache behind my eyes."
          rows={6}
          required
          minLength={10}
          maxLength={2000}
          className="resize-none text-base leading-relaxed"
        />
        <div className="text-right text-xs text-muted-foreground">{symptoms.length} / 2000</div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-base font-medium text-foreground">How long have you had these symptoms?</Label>
        <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DURATION_OPTIONS.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`dur-${opt.value}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/40",
                duration === opt.value && "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem value={opt.value} id={`dur-${opt.value}`} className="shrink-0" />
              <span className="text-sm text-foreground">{opt.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-base font-medium text-foreground">How severe is it?</Label>
        <RadioGroup value={severity} onValueChange={setSeverity} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SEVERITY_OPTIONS.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`sev-${opt.value}`}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/40",
                severity === opt.value && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={opt.value} id={`sev-${opt.value}`} className="shrink-0" />
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              </div>
              <span className="ml-7 text-xs text-muted-foreground">{opt.hint}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          Iasis AI provides guidance, not a diagnosis. In a real emergency, call <strong>999</strong> or go to the
          nearest hospital.
        </p>
        <Button type="submit" size="lg" disabled={!canSubmit}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analysing symptoms…
            </>
          ) : (
            "Analyse symptoms"
          )}
        </Button>
      </div>
    </form>
  )
}
