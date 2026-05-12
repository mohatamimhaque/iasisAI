"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { promoteAdmin, searchAdminCandidates } from "@/app/admin/settings/actions"

type AdminCandidate = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
}

export function AdminAddAdminForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, start] = useTransition()
  const [query, setQuery] = useState("")
  const [candidates, setCandidates] = useState<AdminCandidate[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminCandidate | null>(null)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setCandidates([])
      setSearching(false)
      setSearchError(null)
      return
    }

    let active = true
    setSearching(true)
    setSearchError(null)

    const timer = setTimeout(async () => {
      try {
        const results = await searchAdminCandidates(term)
        if (!active) return
        setCandidates(results)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : "Search failed"
        setSearchError(message)
        setCandidates([])
      } finally {
        if (active) setSearching(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl tracking-tight text-foreground">Add admin</h2>
      <p className="mt-2 text-sm text-muted-foreground">Promote an existing user by their profile ID (UUID).</p>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        action={(fd) => {
          setError(null)
          setSuccess(false)
          start(async () => {
            const res = await promoteAdmin(fd)
            if (res?.error) setError(res.error)
            else setSuccess(true)
          })
        }}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin_user_search">Search user</Label>
            <div className="relative">
              <Input
                id="admin_user_search"
                placeholder="Search by name or email"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSelected(null)
                }}
                autoComplete="off"
              />
              {(searching || searchError || candidates.length > 0) && (
                <div className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-popover p-2 text-sm shadow-lg">
                  {searching ? <p className="px-2 py-1 text-muted-foreground">Searching...</p> : null}
                  {searchError ? <p className="px-2 py-1 text-destructive">{searchError}</p> : null}
                  {!searching && !searchError && candidates.length === 0 ? (
                    <p className="px-2 py-1 text-muted-foreground">No matches found.</p>
                  ) : null}
                  {!searching && !searchError && candidates.length > 0 ? (
                    <ul role="listbox" className="grid gap-1">
                      {candidates.map((candidate) => (
                        <li key={candidate.id} role="option">
                          <button
                            type="button"
                            className="flex w-full items-start justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
                            onClick={() => {
                              setSelected(candidate)
                              setUserId(candidate.id)
                              setQuery(candidate.full_name ?? candidate.email ?? candidate.id)
                              setCandidates([])
                            }}
                          >
                            <span className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {candidate.full_name ?? candidate.email ?? "Unknown user"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {candidate.email ?? "No email"}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {candidate.role ?? "user"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Type at least 2 characters to see up to 8 suggestions.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin_user_id">User ID</Label>
            <Input
              id="admin_user_id"
              name="user_id"
              placeholder="e.g. 8f2c2a3c-7d2b-4f8f-9f1c-1234567890ab"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value)
                setSelected(null)
              }}
            />
            {selected ? (
              <p className="text-xs text-muted-foreground">
                Selected: {selected.full_name ?? selected.email ?? selected.id}
              </p>
            ) : null}
          </div>
        </div>
        <Button type="submit" disabled={pending} className="sm:mb-0.5">
          {pending ? "Promoting..." : "Make admin"}
        </Button>
      </form>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? <p className="mt-3 text-sm text-primary">Admin role updated.</p> : null}
    </section>
  )
}
