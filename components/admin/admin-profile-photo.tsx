"use client"

import { useState } from "react"
import { updateAvatarUrl } from "@/app/app/settings/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminProfilePhotoProps {
  email: string
  avatarUrl?: string | null
}

export function AdminProfilePhoto({ email, avatarUrl }: AdminProfilePhotoProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 1_000_000) {
      setError("Profile photo must be 1MB or less.")
      return
    }

    setError(null)
    setMessage(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.set("file", file)

      const res = await fetch("/api/profile/avatar-upload-url", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? "Failed to upload profile photo")
      }

      const payload = (await res.json()) as { publicUrl: string }
      const result = await updateAvatarUrl(payload.publicUrl)
      if (result?.error) throw new Error(result.error)

      setCurrentUrl(payload.publicUrl)
      setMessage("Profile photo updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {currentUrl ? <AvatarImage src={currentUrl} alt="Admin profile photo" /> : null}
          <AvatarFallback className="bg-primary/10 text-sm text-primary">{email[0]?.toUpperCase() ?? "A"}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <Label htmlFor="admin_avatar_upload">Profile photo</Label>
          <Input
            id="admin_avatar_upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onAvatarChange}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Max 1MB.</p>
          {isUploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
    </section>
  )
}
