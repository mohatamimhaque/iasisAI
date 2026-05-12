"use client"

import { useState, useTransition } from "react"
import { Video, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { bookAppointment } from "@/app/app/appointments/actions"

type Doctor = {
  id: string
  full_name: string
  specialty: string
  consultation_fee: number
  available_for_telemedicine: boolean
}

export function BookingForm({ doctors }: { doctors: Doctor[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]?.id ?? "")
  const [mode, setMode] = useState<"telemedicine" | "in_person">("telemedicine")
  const [pending, startTransition] = useTransition()

  const doctor = doctors.find((d) => d.id === selectedDoctor) ?? null

  function handleSubmit(formData: FormData) {
    formData.set("doctor_id", selectedDoctor)
    formData.set("consultation_type", mode)
    startTransition(async () => {
      try {
        await bookAppointment(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to book")
      }
    })
  }

  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No verified doctors are available right now. Please check back soon.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Choose a doctor</h2>
        <ul className="space-y-2">
          {doctors.map((d) => {
            const active = selectedDoctor === d.id
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(d.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                    active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{d.full_name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{d.specialty}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground">৳ {d.consultation_fee}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">When & how</h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("telemedicine")}
            disabled={doctor ? !doctor.available_for_telemedicine : false}
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm transition-colors disabled:opacity-50 ${
              mode === "telemedicine" ? "border-primary bg-primary/5" : "border-border bg-background"
            }`}
          >
            <Video className="size-4" /> Video call
          </button>
          <button
            type="button"
            onClick={() => setMode("in_person")}
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
              mode === "in_person" ? "border-primary bg-primary/5" : "border-border bg-background"
            }`}
          >
            <MapPin className="size-4" /> In person
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" name="time" type="time" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for visit</Label>
          <Textarea id="reason" name="reason" required rows={3} placeholder="What would you like to discuss?" />
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          You will receive an SMS confirmation. Cancellations up to 1 hour before are free.
        </p>
        <Button type="submit" size="lg" disabled={pending || !selectedDoctor}>
          {pending ? "Booking…" : "Confirm appointment"}
        </Button>
      </div>
    </form>
  )
}
