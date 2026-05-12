"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveDoctorProfile } from "@/app/doctor/settings/actions"

type Defaults = {
  full_name: string
  specialty: string
  bmdc_id: string
  bio: string
  consultation_fee: number
  years_experience: number
  available_for_telemedicine: boolean
}

export function DoctorSettingsForm({ defaults }: { defaults: Defaults }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, start] = useTransition()

  return (
    <form
      className="mt-8 space-y-6"
      action={(fd) => {
        setError(null)
        setSuccess(false)
        start(async () => {
          const res = await saveDoctorProfile(fd)
          if (res.error) setError(res.error)
          else setSuccess(true)
        })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={defaults.full_name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input id="specialty" name="specialty" defaultValue={defaults.specialty} placeholder="e.g. Cardiology" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bmdc_id">BMDC ID</Label>
          <Input id="bmdc_id" name="bmdc_id" defaultValue={defaults.bmdc_id} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="years_experience">Years of experience</Label>
          <Input
            id="years_experience"
            name="years_experience"
            type="number"
            min={0}
            defaultValue={defaults.years_experience}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="consultation_fee">Consultation fee (BDT)</Label>
          <Input
            id="consultation_fee"
            name="consultation_fee"
            type="number"
            min={0}
            defaultValue={defaults.consultation_fee}
          />
        </div>
        <label className="mt-7 flex items-center gap-3 text-sm text-foreground sm:mt-0">
          <input
            type="checkbox"
            name="available_for_telemedicine"
            defaultChecked={defaults.available_for_telemedicine}
            className="size-4 rounded border-border"
          />
          Available for telemedicine
        </label>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={defaults.bio} placeholder="Tell patients about your training and approach." />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-primary">Profile saved.</p>}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}
