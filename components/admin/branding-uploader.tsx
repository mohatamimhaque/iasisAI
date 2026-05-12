"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { upsertSiteConfig } from "@/app/admin/system/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BrandingUploaderProps {
  logoUrl?: string | null
  faviconUrl?: string | null
}

type BrandAsset = "logo" | "favicon"

export function BrandingUploader({ logoUrl, faviconUrl }: BrandingUploaderProps) {
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(logoUrl ?? null)
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState<string | null>(faviconUrl ?? null)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState<BrandAsset | null>(null)

  async function uploadAsset(asset: BrandAsset, file: File) {
    setIsUploading(asset)
    try {
      const formData = new FormData()
      formData.set("asset", asset)
      formData.set("file", file)

      const res = await fetch("/api/admin/branding/upload-url", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? "Failed to request upload URL")
      }

      const payload = (await res.json()) as { publicUrl: string }

      const configData = new FormData()
      configData.set("key", asset === "logo" ? "logo_url" : "favicon_url")
      configData.set("value", payload.publicUrl)
      configData.set("label", asset === "logo" ? "Site logo URL" : "Favicon URL")
      configData.set("category", "branding")
      configData.set("value_type", "text")

      await upsertSiteConfig(configData)

      startTransition(() => {
        if (asset === "logo") {
          setCurrentLogoUrl(payload.publicUrl)
        } else {
          setCurrentFaviconUrl(payload.publicUrl)
        }
      })

      toast.success(`${asset === "logo" ? "Logo" : "Favicon"} updated`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(null)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Logo</p>
              <p className="text-xs text-muted-foreground">SVG or PNG, max 200KB recommended.</p>
            </div>
            {currentLogoUrl ? (
              <img src={currentLogoUrl} alt="Current logo" className="h-10 w-10 rounded-md object-contain" />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="logo_upload" className="sr-only">
              Upload logo
            </Label>
            <Input
              id="logo_upload"
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void uploadAsset("logo", file)
                }
              }}
              disabled={isUploading !== null || isPending}
            />
            <span className="text-xs text-muted-foreground">
              {isUploading === "logo" ? "Uploading..." : "Choose a file to upload"}
            </span>
          </div>
          {currentLogoUrl ? (
            <p className="text-xs text-muted-foreground">Current: {currentLogoUrl}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Favicon</p>
              <p className="text-xs text-muted-foreground">ICO or PNG (32×32 recommended).</p>
            </div>
            {currentFaviconUrl ? (
              <img src={currentFaviconUrl} alt="Current favicon" className="h-8 w-8 rounded-md object-contain" />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="favicon_upload" className="sr-only">
              Upload favicon
            </Label>
            <Input
              id="favicon_upload"
              type="file"
              accept="image/x-icon,image/vnd.microsoft.icon,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void uploadAsset("favicon", file)
                }
              }}
              disabled={isUploading !== null || isPending}
            />
            <span className="text-xs text-muted-foreground">
              {isUploading === "favicon" ? "Uploading..." : "Choose a file to upload"}
            </span>
          </div>
          {currentFaviconUrl ? (
            <p className="text-xs text-muted-foreground">Current: {currentFaviconUrl}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
