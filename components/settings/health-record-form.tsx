"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateHealthRecord } from "@/app/app/settings/actions"

interface Props {
  record: {
    height_cm?: number | null
    weight_kg?: number | null
    chronic_conditions?: string[] | null
    allergies?: string[] | null
    current_medications?: Array<{ name?: string; schedule?: string | null }> | null
  } | null
}

export function HealthRecordForm({ record }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const conditions = (record?.chronic_conditions ?? []).join(", ")
  const allergies = (record?.allergies ?? []).join(", ")
  const meds = (record?.current_medications ?? [])
    .map((m) => (m?.schedule ? `${m.name} — ${m.schedule}` : m?.name ?? ""))
    .filter(Boolean)
    .join("\n")

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateHealthRecord(formData)
      if (res?.error) setError(res.error)
      else setMessage("Saved")
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="height_cm">Height (cm)</Label>
          <Input id="height_cm" name="height_cm" type="number" min={0} defaultValue={record?.height_cm ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min={0}
            defaultValue={record?.weight_kg ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chronic_conditions">Chronic conditions</Label>
        <Input
          id="chronic_conditions"
          name="chronic_conditions"
          defaultValue={conditions}
          placeholder="Diabetes, Hypertension, Asthma"
        />
        <p className="text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Input
          id="allergies"
          name="allergies"
          defaultValue={allergies}
          placeholder="Penicillin, Peanuts, Sulfa drugs"
        />
        <p className="text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_medications">Current medications</Label>
        <Textarea
          id="current_medications"
          name="current_medications"
          rows={4}
          defaultValue={meds}
          placeholder={"One per line, e.g.\nMetformin 500mg — twice daily\nLisinopril 10mg — once at night"}
        />
        <p className="text-xs text-muted-foreground">
          {'One medication per line. Use " — " (em dash with spaces) to separate name from schedule.'}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save health record"}
        </Button>
      </div>
    </form>
  )
}
