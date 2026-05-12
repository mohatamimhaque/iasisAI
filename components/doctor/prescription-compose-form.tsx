"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, FileSignature } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPrescription, type PrescriptionItemInput } from "@/app/doctor/prescriptions/actions"

type PatientOption = { id: string; full_name: string | null }

export function PrescriptionComposeForm({
  patients,
  defaultPatientId,
  defaultAppointmentId,
}: {
  patients: PatientOption[]
  defaultPatientId?: string
  defaultAppointmentId?: string
}) {
  const [patientId, setPatientId] = useState(defaultPatientId ?? "")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<PrescriptionItemInput[]>([
    { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ])
  const [pending, startTransition] = useTransition()

  function updateItem(index: number, patch: Partial<PrescriptionItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createPrescription({
          patient_id: patientId,
          appointment_id: defaultAppointmentId,
          diagnosis,
          notes,
          items,
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to sign prescription")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Patient & diagnosis</h2>

        <div className="space-y-2">
          <Label htmlFor="patient">Patient</Label>
          {patients.length > 0 ? (
            <select
              id="patient"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? "Unnamed patient"} ({p.id.slice(0, 8)})
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="patient"
              placeholder="Patient ID (UUID)"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Input
            id="diagnosis"
            required
            placeholder="e.g. Acute viral pharyngitis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Clinical notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="History, exam findings, follow-up advice…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">Medicines</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="size-4" />
            Add medicine
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Medicine {i + 1}</p>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    aria-label="Remove medicine"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`name-${i}`} className="text-xs">
                    Name
                  </Label>
                  <Input
                    id={`name-${i}`}
                    required
                    placeholder="e.g. Paracetamol 500mg"
                    value={item.medicine_name}
                    onChange={(e) => updateItem(i, { medicine_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`dosage-${i}`} className="text-xs">
                    Dosage
                  </Label>
                  <Input
                    id={`dosage-${i}`}
                    placeholder="e.g. 1 tablet"
                    value={item.dosage}
                    onChange={(e) => updateItem(i, { dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`frequency-${i}`} className="text-xs">
                    Frequency
                  </Label>
                  <Input
                    id={`frequency-${i}`}
                    placeholder="e.g. Three times a day"
                    value={item.frequency}
                    onChange={(e) => updateItem(i, { frequency: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`duration-${i}`} className="text-xs">
                    Duration
                  </Label>
                  <Input
                    id={`duration-${i}`}
                    placeholder="e.g. 5 days"
                    value={item.duration}
                    onChange={(e) => updateItem(i, { duration: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`instructions-${i}`} className="text-xs">
                    Instructions
                  </Label>
                  <Input
                    id={`instructions-${i}`}
                    placeholder="e.g. After meals; avoid alcohol"
                    value={item.instructions}
                    onChange={(e) => updateItem(i, { instructions: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Once signed, this prescription is immutable and verifiable by any pharmacy via its QR code.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          <FileSignature className="size-4" />
          {pending ? "Signing…" : "Sign & issue prescription"}
        </Button>
      </div>
    </form>
  )
}
