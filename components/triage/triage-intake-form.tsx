"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud, X, AlertCircle } from "lucide-react"
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
  const [images, setImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = symptoms.trim().length >= 10 && !isLoading

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processFiles = (files: FileList) => {
    setError(null)
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith("image/")
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      if (!isImage) {
        setError("Only image files are allowed.")
      } else if (!isValidSize) {
        setError("Images must be under 5MB.")
      }
      return isImage && isValidSize
    })

    if (validFiles.length + images.length > 4) {
      setError("You can only upload up to 4 images.")
      return
    }

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent, useMock: boolean = false) {
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
          images: images.length > 0 ? images : undefined,
          useMock: useMock || undefined,
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

      {/* Image Attachments Dropzone */}
      <div className="flex flex-col gap-3">
        <Label className="text-base font-medium text-foreground">
          Attachments <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Upload up to 4 clear photos of the affected area, rashes, swelling, or relevant medical records (max 5MB each).
        </p>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:bg-secondary/20 hover:border-muted-foreground/30"
          )}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="rounded-full bg-secondary p-3 text-muted-foreground">
              <UploadCloud className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drag & drop images here, or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">Supports PNG, JPEG, WEBP up to 5MB (Max 4 images)</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                <img src={img} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(idx)
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground p-1 transition-colors border border-border shadow-sm"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
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
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive flex flex-col gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive mt-0.5">
              <AlertCircle className="size-4" />
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">
                AI Triage Analysis Failed
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                {error === "AI reasoning failed" || error.includes("offline")
                  ? "We were unable to generate structured triage reasoning. This usually happens if the AI service is temporarily offline or processing was interrupted."
                  : error}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pl-11">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => handleSubmit(e, false)}
              className="text-xs h-8 border-destructive/20 hover:bg-destructive/10 text-destructive font-medium cursor-pointer"
            >
              Retry analysis
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => handleSubmit(e, true)}
              className="text-xs h-8 hover:bg-secondary/80 font-medium cursor-pointer"
            >
              Use demo triage fallback
            </Button>
          </div>
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
