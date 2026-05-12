"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateAvatarUrl, updateProfile } from "@/app/app/settings/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const DIVISIONS = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

interface Props {
  email: string
  profile: {
    full_name?: string | null
    phone?: string | null
    date_of_birth?: string | null
    gender?: string | null
    blood_group?: string | null
    division?: string | null
    district?: string | null
    avatar_url?: string | null
  }
}

export function ProfileEditForm({ email, profile }: Props) {
  const [gender, setGender] = useState(profile.gender ?? "")
  const [bloodGroup, setBloodGroup] = useState(profile.blood_group ?? "")
  const [division, setDivision] = useState(profile.division ?? "")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [isUploading, setIsUploading] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("gender", gender)
    formData.set("blood_group", bloodGroup)
    formData.set("division", division)

    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) setError(res.error)
      else setMessage("Saved")
    })
  }

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
        throw new Error(payload?.error ?? "Failed to request upload URL")
      }

      const payload = (await res.json()) as { publicUrl: string }

      const result = await updateAvatarUrl(payload.publicUrl)
      if (result?.error) throw new Error(result.error)

      setAvatarUrl(payload.publicUrl)
      setMessage("Profile photo updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Profile photo</Label>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-14">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile photo" /> : null}
              <AvatarFallback className="bg-primary/10 text-sm text-primary">{email[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onAvatarChange}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Max 1MB.</p>
              {isUploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
            </div>
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="+880 1XXX..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={profile.date_of_birth ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood_group">Blood group</Label>
          <Select value={bloodGroup} onValueChange={setBloodGroup}>
            <SelectTrigger id="blood_group">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="division">Division</Label>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger id="division">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DIVISIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District / area</Label>
          <Input id="district" name="district" defaultValue={profile.district ?? ""} placeholder="e.g. Gulshan" />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
