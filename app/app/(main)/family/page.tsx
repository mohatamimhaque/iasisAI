import { redirect } from "next/navigation"
import { Trash2, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { AddFamilyMemberDialog } from "@/components/family/add-family-member-dialog"
import { deleteFamilyMember } from "./actions"

export const metadata = {
  title: "Family",
}

function calculateAge(dob: string | null) {
  if (!dob) return null
  const years = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)
  return Math.floor(years)
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export default async function FamilyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: members } = await supabase
    .from("family_members")
    .select("id, full_name, relationship, date_of_birth, gender, blood_group, notes")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })

  const list = members ?? []
  const canAddMore = list.length < 6

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Family</p>
          <h1 className="mt-1 text-balance font-serif text-4xl tracking-tight text-foreground">
            Care for the people you love
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Add up to 6 family members. Each has their own health record, prescriptions and reminders — all from your
            account.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {list.length} of 6 members added
          </p>
        </div>
        <AddFamilyMemberDialog canAddMore={canAddMore} />
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No family members yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Add a parent, child, or spouse so you can track their care alongside your own.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list.map((m) => {
            const age = calculateAge(m.date_of_birth)
            return (
              <li key={m.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-lg text-primary">
                    {initials(m.full_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-medium text-foreground">{m.full_name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {m.relationship}
                      {age !== null ? ` · ${age} yrs` : ""}
                      {m.blood_group ? ` · ${m.blood_group}` : ""}
                    </p>
                  </div>
                </div>
                {m.notes ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.notes}</p>
                ) : null}
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
                  <form action={deleteFamilyMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
