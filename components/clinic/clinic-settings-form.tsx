"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveClinicProfile } from "@/app/clinic/settings/actions"

type Defaults = {
  name: string
  description: string
  address: string
  city: string
  district: string
  division: string
  phone: string
  services: string
}

export function ClinicSettingsForm({ defaults }: { defaults: Defaults }) {
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
          const res = await saveClinicProfile(fd)
          if (res.error) setError(res.error)
          else setSuccess(true)
        })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="name">Clinic name</Label>
          <Input id="name" name="name" defaultValue={defaults.name} required />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={defaults.description} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={defaults.address} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={defaults.city} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" defaultValue={defaults.district} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="division">Division</Label>
          <Input id="division" name="division" defaultValue={defaults.division} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaults.phone} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="services">Services (comma-separated)</Label>
        <Input id="services" name="services" defaultValue={defaults.services} placeholder="X-Ray, MRI, Blood test, ECG" />
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
