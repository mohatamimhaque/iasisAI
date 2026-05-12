"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MOOD_OPTIONS } from "@/lib/mental-health"
import { recordMood } from "@/app/app/mental-health/actions"

export function MoodCheckin() {
  const [selected, setSelected] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    if (selected == null) {
      toast.error("Pick how you feel right now")
      return
    }
    formData.set("score", String(selected))
    startTransition(async () => {
      try {
        await recordMood(formData)
        toast.success("Mood logged")
        setSelected(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">How are you feeling right now?</h2>
        <p className="mt-1 text-sm text-muted-foreground">A daily check-in helps you spot patterns over time.</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {MOOD_OPTIONS.map((m) => {
          const active = selected === m.value
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setSelected(m.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-colors ${
                active ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
              aria-pressed={active}
            >
              <span className="text-2xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="font-medium">{m.label}</span>
            </button>
          )
        })}
      </div>
      <Textarea name="notes" rows={2} placeholder="Anything on your mind? (optional)" />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log mood"}
        </Button>
      </div>
    </form>
  )
}
