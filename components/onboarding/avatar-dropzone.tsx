"use client"

import { useRef, useState, useCallback } from "react"
import { Camera, Loader2, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarDropzoneProps {
  onUploaded: (url: string) => void
  currentUrl?: string | null
}

const ACCEPTED = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_BYTES = 1_000_000 // 1 MB

export function AvatarDropzone({ onUploaded, currentUrl }: AvatarDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!ACCEPTED.has(file.type)) {
        setError("Only PNG, JPG, or WebP images are accepted.")
        return
      }
      if (file.size > MAX_BYTES) {
        setError("Image must be under 1 MB.")
        return
      }

      // Instant local preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setIsUploading(true)

      try {
        const body = new FormData()
        body.set("file", file)

        const res = await fetch("/api/profile/avatar-upload-url", {
          method: "POST",
          body,
        })

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? "Upload failed")
        }

        const { publicUrl } = (await res.json()) as { publicUrl: string }
        onUploaded(publicUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
        setPreview(currentUrl ?? null)
      } finally {
        setIsUploading(false)
      }
    },
    [currentUrl, onUploaded],
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const clearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setError(null)
    onUploaded("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Drop zone / avatar circle */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex size-28 cursor-pointer select-none items-center justify-center",
          "rounded-full border-2 border-dashed bg-muted/40 transition-all duration-200",
          isDragging
            ? "scale-105 border-primary bg-primary/10 shadow-lg shadow-primary/20"
            : "border-border hover:border-primary/60 hover:bg-primary/5",
          preview && "border-solid border-border",
        )}
      >
        {/* Preview image */}
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="size-full rounded-full object-cover"
          />
        ) : (
          <User className="size-10 text-muted-foreground/40 transition-colors group-hover:text-primary/50" />
        )}

        {/* Uploading spinner overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {/* Drag-over overlay */}
        {isDragging && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/15">
            <Camera className="size-7 text-primary" />
          </div>
        )}

        {/* Hover camera badge */}
        {!isDragging && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
            <Camera className="size-6 text-white drop-shadow" />
          </div>
        )}

        {/* Clear button */}
        {preview && !isUploading && (
          <button
            type="button"
            onClick={clearPhoto}
            aria-label="Remove photo"
            className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Label */}
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {isUploading ? "Uploading…" : "Drag & drop or click to upload"}
        </p>
        <p className="text-[11px] text-muted-foreground/60">PNG, JPG, WebP · max 1 MB</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
