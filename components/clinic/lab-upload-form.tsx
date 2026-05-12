"use client"

import { useTransition } from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadLabReport } from "@/app/clinic/upload/actions"

const REPORT_TYPES = [
  "Complete Blood Count (CBC)",
  "Blood Sugar",
  "Lipid Profile",
  "Liver Function Test",
  "Kidney Function Test",
  "Thyroid Profile",
  "Urinalysis",
  "Dengue NS1 / IgM / IgG",
  "Imaging (X-ray, CT, MRI)",
  "Other",
]

export function LabUploadForm() {
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await uploadLabReport(formData)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Patient & report</h2>
        <div className="space-y-2">
          <Label htmlFor="patient_id">Patient ID</Label>
          <Input
            id="patient_id"
            name="patient_id"
            required
            placeholder="UUID from the patient's Iasis profile"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            The patient shows their Iasis Patient ID in their profile. This ensures the report is matched correctly.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="report_type">Report type</Label>
            <select
              id="report_type"
              name="report_type"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>
                Choose a category…
              </option>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Report title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. CBC — 12 May 2026"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file_url">Source file URL (optional)</Label>
          <Input
            id="file_url"
            name="file_url"
            type="url"
            placeholder="https://… (signed Cloudflare R2 link)"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            If you have already uploaded the PDF/JPG to Cloudflare R2, paste the signed URL here. Otherwise the
            structured analysis below is sufficient.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-serif text-xl text-foreground">Report content</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste the lab values verbatim — Iasis AI will produce a plain-language summary and flag abnormal values.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="raw_text">Lab values</Label>
          <Textarea
            id="raw_text"
            name="raw_text"
            required
            rows={12}
            placeholder={`Example:
WBC: 11.5 x10^3/uL (ref 4.0-10.0)
RBC: 4.2 x10^6/uL (ref 4.5-5.5)
Hemoglobin: 12.1 g/dL (ref 13.0-17.0)
…`}
            className="font-mono text-xs"
          />
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI summary runs immediately and syncs to the patient&apos;s dashboard.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Uploading & analysing…" : "Upload & analyse"}
        </Button>
      </div>
    </form>
  )
}
