"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Activity, Check, ChevronsUpDown, MapPin, User2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { COUNTRIES, type Country } from "@/lib/countries"
import { AvatarDropzone } from "@/components/onboarding/avatar-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

interface Props {
  userId: string
  defaultFullName: string
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

export function OnboardingForm({ userId, defaultFullName }: Props) {
  const router = useRouter()

  const [fullName, setFullName] = useState(defaultFullName)
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const [countryCode, setCountryCode] = useState("")
  const [stateProvince, setStateProvince] = useState("")
  const [city, setCity] = useState("")
  const [addressLine, setAddressLine] = useState("")

  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    const country = COUNTRIES.find((c) => c.code === code)
    if (country && !phone) setPhone(country.phone + " ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        phone: phone.trim() || null,
        date_of_birth: dob || null,
        gender: gender || null,
        blood_group: bloodGroup || null,
        country: countryCode || null,
        state_province: stateProvince || null,
        city: city.trim() || null,
        address_line: addressLine.trim() || null,
        onboarded: true,
      })
      .eq("id", userId)

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push("/app")
    router.refresh()
  }

  const handleSkip = async () => {
    setError(null)
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ onboarded: true }).eq("id", userId)
    setIsLoading(false)
    if (error) { setError(error.message); return }
    router.push("/app")
    router.refresh()
  }

  const stateLabel =
    selectedCountry?.code === "US" ? "State" :
    selectedCountry?.code === "CA" ? "Province / Territory" :
    selectedCountry?.code === "AU" ? "State / Territory" :
    selectedCountry?.code === "IN" ? "State / Union Territory" :
    selectedCountry?.code === "GB" ? "County / Region" :
    selectedCountry?.code === "DE" ? "State (Bundesland)" :
    "State / Province / Region"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Avatar ── */}
      <div className="flex flex-col items-center py-2">
        <AvatarDropzone onUploaded={setAvatarUrl} />
      </div>

      {/* ── Personal info ── */}
      <div className="space-y-5">
        <SectionHeader icon={User2} label="Personal info" />

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="As it appears on your ID"
            autoComplete="name"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={selectedCountry ? `${selectedCountry.phone} …` : "+1 555 000 0000"}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Medical profile ── */}
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
            <Label htmlFor="bloodGroup">Blood group</Label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger id="bloodGroup">
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

      {/* ── Location ── */}
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
          <Label htmlFor="stateProvince">{stateLabel}</Label>
          {selectedCountry?.states && selectedCountry.states.length > 0 ? (
            <Select value={stateProvince} onValueChange={setStateProvince}>
              <SelectTrigger id="stateProvince">
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
              id="stateProvince"
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
              autoComplete="address-level2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine">
              Address <span className="text-muted-foreground/70">(optional)</span>
            </Label>
            <Input
              id="addressLine"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
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

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
          Skip for now
        </Button>
        <Button type="submit" disabled={isLoading} className="sm:min-w-36">
          {isLoading ? "Saving…" : "Continue to Iasis"}
        </Button>
      </div>
    </form>
  )
}
