"use client"

import { useState, useMemo, useTransition } from "react"
import { Activity, Check, ChevronsUpDown, MapPin, User2 } from "lucide-react"
import { COUNTRIES, type Country } from "@/lib/countries"
import { AvatarDropzone } from "@/components/onboarding/avatar-dropzone"
import { updateAvatarUrl, updateProfile } from "@/app/app/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

interface Props {
  email: string
  profile: {
    full_name?: string | null
    phone?: string | null
    date_of_birth?: string | null
    gender?: string | null
    blood_group?: string | null
    country?: string | null
    state_province?: string | null
    city?: string | null
    address_line?: string | null
    avatar_url?: string | null
  }
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 pt-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-3.5 text-primary" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

export function ProfileEditForm({ email, profile }: Props) {
  const [gender, setGender]               = useState(profile.gender         ?? "")
  const [bloodGroup, setBloodGroup]       = useState(profile.blood_group    ?? "")
  const [countryCode, setCountryCode]     = useState(profile.country        ?? "")
  const [stateProvince, setStateProvince] = useState(profile.state_province ?? "")
  const [countryOpen, setCountryOpen]     = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [message, setMessage]             = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [isPending, startTransition]      = useTransition()

  const selectedCountry: Country | undefined = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode),
    [countryCode],
  )

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    )
  }, [countrySearch])

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setStateProvince("")
    setCountryOpen(false)
    setCountrySearch("")
  }

  const stateLabel =
    selectedCountry?.code === "US" ? "State" :
    selectedCountry?.code === "CA" ? "Province / Territory" :
    selectedCountry?.code === "AU" ? "State / Territory" :
    selectedCountry?.code === "IN" ? "State / Union Territory" :
    selectedCountry?.code === "GB" ? "County / Region" :
    selectedCountry?.code === "DE" ? "State (Bundesland)" :
    "State / Province / Region"

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("gender", gender)
    formData.set("blood_group", bloodGroup)
    formData.set("country", countryCode)
    formData.set("state_province", stateProvince)

    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) setError(res.error)
      else setMessage("Profile saved")
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Avatar */}
      <div className="flex flex-col items-center py-2">
        <AvatarDropzone
          currentUrl={profile.avatar_url}
          onUploaded={async (url) => {
            setMessage(null)
            setError(null)
            const res = await updateAvatarUrl(url)
            if (res?.error) setError(res.error)
            else setMessage("Profile photo updated")
          }}
        />
      </div>

      {/* Personal info */}
      <div className="space-y-5">
        <SectionHeader icon={User2} label="Personal info" />

        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile.full_name ?? ""}
            placeholder="As it appears on your ID"
            autoComplete="name"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder={selectedCountry ? `${selectedCountry.phone} …` : "+1 555 000 0000"}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={profile.date_of_birth ?? ""}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Medical profile */}
      <div className="space-y-5">
        <SectionHeader icon={Activity} label="Medical profile" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other / Prefer not to say</SelectItem>
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
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-5">
        <SectionHeader icon={MapPin} label="Location" />

        {/* Country combobox */}
        <div className="space-y-2">
          <Label>Country</Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between font-normal"
              >
                {selectedCountry ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select country…</span>
                )}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search country…"
                  value={countrySearch}
                  onValueChange={setCountrySearch}
                />
                <CommandList className="max-h-64">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.code}
                        onSelect={handleCountrySelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            countryCode === country.code ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="mr-2">{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{country.phone}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* State / Province */}
        <div className="space-y-2">
          <Label htmlFor="state_province">{stateLabel}</Label>
          {selectedCountry?.states && selectedCountry.states.length > 0 ? (
            <Select value={stateProvince} onValueChange={setStateProvince}>
              <SelectTrigger id="state_province">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {selectedCountry.states.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="state_province"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
              placeholder="State, province, or region"
            />
          )}
        </div>

        {/* City + Address */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile.city ?? ""}
              placeholder="Your city"
              autoComplete="address-level2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line">
              Address <span className="text-muted-foreground/70">(optional)</span>
            </Label>
            <Input
              id="address_line"
              name="address_line"
              defaultValue={profile.address_line ?? ""}
              placeholder="Street address"
              autoComplete="street-address"
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-primary">{message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
