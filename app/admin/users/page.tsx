import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateUserRole, deleteUser } from "@/app/admin/users/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = { title: "Users" }
export const dynamic = "force-dynamic"

const ROLE_STYLES: Record<string, string> = {
  patient: "bg-primary/10 text-primary",
  doctor: "bg-emerald-100 text-emerald-900",
  clinic: "bg-amber-100 text-amber-900",
  admin: "bg-destructive/10 text-destructive",
}

type SearchParams = { email?: string; page?: string; page_size?: string }

const PAGE_SIZE = 12
const MAX_PAGE_SIZE = 500
const CACHE_TTL_MS = 5 * 60 * 1000
const emailCache = new Map<string, { email: string; ts: number }>()
const idCache = new Map<string, { id: string; ts: number }>()

async function adminGuard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")

  return { supabase, user }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const { supabase, user } = await adminGuard()

  const resolvedParams = (await searchParams) ?? {}
  const emailQuery = (resolvedParams.email ?? "").trim()
  const pageParam = Number.parseInt(resolvedParams.page ?? "1", 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSizeParam = Number.parseInt(resolvedParams.page_size ?? "", 10)
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, MAX_PAGE_SIZE) : PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const adminClient = createAdminClient()
  let emailLookupError: string | null = null
  let filteredUserId: string | null = null

  if (emailQuery) {
    if (!adminClient) {
      emailLookupError = "Email search requires SUPABASE_SERVICE_ROLE_KEY on the server."
    } else {
      const resolved = await findUserIdByEmail(adminClient, emailQuery)
      if (resolved.error) emailLookupError = resolved.error
      else filteredUserId = resolved.id
    }
  }

  const profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, role, onboarded, created_at", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to)

  const { data: profiles, count } = filteredUserId
    ? await profilesQuery.eq("id", filteredUserId)
    : await profilesQuery

  const list = profiles ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages
  const emailMap = adminClient ? await mapUserEmails(adminClient, list.map((p) => p.id)) : new Map<string, string>()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Users</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every account on Iasis — patients, doctors, clinics, and admins. Newest first.
        </p>
      </header>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <form className="flex flex-wrap items-end gap-3" action="/admin/users" method="get">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="search_email" className="text-xs uppercase tracking-wider text-muted-foreground">
              Search by email
            </label>
            <Input
              id="search_email"
              name="email"
              type="email"
              defaultValue={emailQuery}
              placeholder="admin@example.com"
            />
          </div>
          <div className="w-28">
            <label htmlFor="page_size" className="text-xs uppercase tracking-wider text-muted-foreground">
              Per page
            </label>
            <Input
              id="page_size"
              name="page_size"
              type="number"
              min={1}
              max={MAX_PAGE_SIZE}
              defaultValue={pageSize}
              list="page_size_options"
            />
            <datalist id="page_size_options">
              <option value="12" />
              <option value="25" />
              <option value="50" />
              <option value="100" />
            </datalist>
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/users">Clear</Link>
          </Button>
        </form>
        {emailLookupError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {emailLookupError}
          </p>
        ) : null}
        {emailQuery && !emailLookupError && !filteredUserId ? (
          <p className="mt-3 text-sm text-muted-foreground">No user found for that email.</p>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">No users yet.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Onboarded</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 text-foreground">{p.full_name ?? <span className="text-muted-foreground italic">—</span>}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[p.role] ?? "bg-muted text-muted-foreground"}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {emailMap.get(p.id) ?? <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.onboarded ? "Yes" : "No"}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDateTime(p.created_at)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="user_id" value={p.id} />
                        <select
                          name="role"
                          defaultValue={p.role === "admin" ? "patient" : p.role}
                          disabled={p.id === user.id}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="clinic">Clinic</option>
                        </select>
                        <button
                          type="submit"
                          disabled={p.id === user.id}
                          className="text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
                        >
                          {p.id === user.id ? "Current admin" : p.role === "admin" ? "Demote" : "Update role"}
                        </button>
                      </form>
                      <form action={deleteUser}>
                        <input type="hidden" name="user_id" value={p.id} />
                        <button
                          type="submit"
                          disabled={p.id === user.id}
                          className="text-xs text-destructive hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!emailQuery ? (
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild disabled={!canPrev}>
                  <Link href={`/admin/users?page=${page - 1}&page_size=${pageSize}`}>Previous</Link>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={!canNext}>
                  <Link href={`/admin/users?page=${page + 1}&page_size=${pageSize}`}>Next</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

async function findUserIdByEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
): Promise<{ id: string | null; error: string | null }> {
  const cached = idCache.get(email.toLowerCase())
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { id: cached.id, error: null }
  }

  const target = email.toLowerCase()
  const perPage = 1000
  let page = 1

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return { id: null, error: error.message }

    const users = data?.users ?? []
    const match = users.find((u) => u.email?.toLowerCase() === target)
    if (match) {
      idCache.set(target, { id: match.id, ts: Date.now() })
      if (match.email) emailCache.set(match.id, { email: match.email, ts: Date.now() })
      return { id: match.id, error: null }
    }

    if (users.length < perPage) break
    page += 1
  }

  return { id: null, error: null }
}

async function mapUserEmails(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  ids: string[],
): Promise<Map<string, string>> {
  const wanted = new Set(ids)
  const map = new Map<string, string>()
  if (wanted.size === 0) return map

  const now = Date.now()
  for (const id of Array.from(wanted)) {
    const cached = emailCache.get(id)
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      map.set(id, cached.email)
      wanted.delete(id)
    }
  }

  if (wanted.size === 0) return map

  const perPage = 1000
  let page = 1

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) break

    const users = data?.users ?? []
    for (const user of users) {
      if (user.id && user.email && wanted.has(user.id)) {
        map.set(user.id, user.email)
        emailCache.set(user.id, { email: user.email, ts: Date.now() })
      }
    }

    if (map.size === wanted.size || users.length < perPage) break
    page += 1
  }

  return map
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
