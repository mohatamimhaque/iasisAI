"use client"

import * as React from "react"
import { Search, User, X, Check } from "lucide-react"
import { searchPatients, getPatientById, type PatientSearchResult } from "@/app/doctor/prescriptions/actions"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PatientSearchProps {
  patientId: string
  onChange: (id: string) => void
  defaultPatientId?: string
}
// yhyy
export function PatientSearch({ patientId, onChange, defaultPatientId }: PatientSearchProps) {
  const [query, setQuery] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<PatientSearchResult[]>([])
  const [selectedPatient, setSelectedPatient] = React.useState<PatientSearchResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 1. Resolve default patient if provided
  React.useEffect(() => {
    const activeId = patientId || defaultPatientId
    if (activeId) {
      setIsLoading(true)
      getPatientById(activeId)
        .then((patient) => {
          if (patient) {
            setSelectedPatient(patient)
            onChange(patient.id)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [defaultPatientId, patientId, onChange])

  // 2. Perform search as user types
  React.useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true)
      searchPatients(query)
        .then((results) => {
          setSuggestions(results)
          setIsOpen(results.length > 0)
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  // 3. Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectPatient(suggestions[activeIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const selectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient)
    onChange(patient.id)
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleClear = () => {
    setSelectedPatient(null)
    onChange("")
    setQuery("")
  }

  const getInitials = (name: string | null) => {
    if (!name) return "P"
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  if (selectedPatient) {
    return (
      <div className="relative flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm transition-all animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border-2 border-primary/10 shadow-sm">
            {selectedPatient.avatar_url && (
              <AvatarImage src={selectedPatient.avatar_url} alt={selectedPatient.full_name ?? "Patient"} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitials(selectedPatient.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{selectedPatient.full_name ?? "Unnamed Patient"}</h4>
            <p className="text-xs text-muted-foreground">{selectedPatient.email || "No email address"}</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground select-all">
              ID: {selectedPatient.id}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <X className="size-4 mr-1.5" />
          Change Patient
        </Button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {isLoading ? <Spinner className="size-4 text-primary" /> : <Search className="size-4" />}
        </span>
        <Input
          type="text"
          placeholder="Search patient by name or email..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-4 h-11 w-full text-sm rounded-lg focus-visible:ring-primary shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 max-h-[320px] w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Patient Suggestions (Max 8)
          </div>
          <ul className="space-y-0.5">
            {suggestions.map((patient, index) => (
              <li key={patient.id}>
                <button
                  type="button"
                  onClick={() => selectPatient(patient)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    index === activeIndex ? "bg-accent text-accent-foreground" : "text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {patient.avatar_url && (
                        <AvatarImage src={patient.avatar_url} alt={patient.full_name ?? "Patient"} />
                      )}
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                        {getInitials(patient.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="block font-medium truncate">{patient.full_name ?? "Unnamed"}</span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {patient.email}
                      </span>
                    </div>
                  </div>
                  {patientId === patient.id && <Check className="size-4 text-primary shrink-0 ml-2" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
          No patients found matching &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
