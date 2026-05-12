import { redirect } from "next/navigation"
import { Database } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AdminDataTable } from "@/components/admin/admin-data-table"

export const metadata = { title: "Data manager" }
export const dynamic = "force-dynamic"

const PAGE_SIZE = 12
const MAX_PAGE_SIZE = 500

const TABLES = {
  profiles: {
    label: "Users",
    idField: "id",
    columns: [
      { key: "full_name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "created_at", label: "Created" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  health_records: {
    label: "Health records",
    idField: "user_id",
    columns: [
      { key: "chronic_conditions", label: "Conditions" },
      { key: "allergies", label: "Allergies" },
      { key: "updated_at", label: "Updated" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "updated_at",
  },
  lab_reports: {
    label: "Lab reports",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "patient_id", label: "Patient" },
      { key: "clinic_id", label: "Clinic" },
      { key: "report_type", label: "Type" },
      { key: "reported_at", label: "Reported" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "reported_at",
  },
  marketing_content: {
    label: "Marketing content",
    idField: "key",
    columns: [
      { key: "key", label: "Key" },
      { key: "page", label: "Page" },
      { key: "title", label: "Title" },
      { key: "updated_at", label: "Updated" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "updated_at",
  },
  medicine_reminders: {
    label: "Medicine reminders",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "medicine_name", label: "Medicine" },
      { key: "frequency", label: "Frequency" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  medicines: {
    label: "Medicines",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "generic_name", label: "Generic" },
      { key: "category", label: "Category" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  mental_health_sessions: {
    label: "Mental health sessions",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "kind", label: "Kind" },
      { key: "score", label: "Score" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  pharmacies: {
    label: "Pharmacies",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "district", label: "District" },
      { key: "verified", label: "Verified" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  prescription_items: {
    label: "Prescription items",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "prescription_id", label: "Prescription" },
      { key: "medicine_name", label: "Medicine" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  prescriptions: {
    label: "Prescriptions",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "patient_id", label: "Patient" },
      { key: "doctor_id", label: "Doctor" },
      { key: "status", label: "Status" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  support_tickets: {
    label: "Support tickets",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "subject", label: "Subject" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  transactions: {
    label: "Transactions",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "amount_bdt", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
  triage_sessions: {
    label: "Triage sessions",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "urgency", label: "Urgency" },
      { key: "created_at", label: "Created" },
      { key: "deleted_at", label: "Deleted" },
    ],
    orderBy: "created_at",
  },
} as const

type TableKey = keyof typeof TABLES

type SearchParams = {
  table?: TableKey
  page?: string
  include_deleted?: string
  page_size?: string
}

export default async function AdminDataPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")

  const resolved = (await searchParams) ?? {}
  const tableKey = (resolved.table ?? "profiles") as TableKey
  const table = TABLES[tableKey] ?? TABLES.profiles
  const includeDeleted = resolved.include_deleted === "1"
  const pageParam = Number.parseInt(resolved.page ?? "1", 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSizeParam = Number.parseInt(resolved.page_size ?? "", 10)
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, MAX_PAGE_SIZE) : PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const selectFields = Array.from(new Set([table.idField, ...table.columns.map((c) => c.key)])).join(",")

  let query = supabase
    .from(tableKey)
    .select(selectFields, { count: "exact" })
    .order(table.orderBy, { ascending: false })

  if (!includeDeleted) {
    query = query.is("deleted_at", null)
  }

  const { data, count } = await query.range(from, to)
  const rows = (data ?? []) as Array<Record<string, unknown>>
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Data manager</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Bulk delete records across core tables. Use soft delete by default to preserve auditability.
          </p>
        </div>
        <Database className="size-6 text-primary" />
      </header>

      <form className="mt-6 flex flex-wrap items-end gap-3" action="/admin/data" method="get">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground" htmlFor="table">
            Table
          </label>
          <select
            id="table"
            name="table"
            defaultValue={tableKey}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            {Object.entries(TABLES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" name="include_deleted" value="1" defaultChecked={includeDeleted} />
          Show deleted
        </label>
        <div className="w-28">
          <label className="text-xs uppercase tracking-wider text-muted-foreground" htmlFor="page_size">
            Per page
          </label>
          <input
            id="page_size"
            name="page_size"
            type="number"
            min={1}
            max={MAX_PAGE_SIZE}
            defaultValue={pageSize}
            list="page_size_options"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          />
          <datalist id="page_size_options">
            <option value="12" />
            <option value="25" />
            <option value="50" />
            <option value="100" />
          </datalist>
        </div>
        <button type="submit" className="rounded-md border border-border px-3 py-1 text-xs">
          Apply
        </button>
      </form>

      <div className="mt-6">
        <AdminDataTable table={tableKey} idField={table.idField} columns={table.columns} rows={rows} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <a
            className={`rounded-md border border-border px-3 py-1 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            href={`/admin/data?table=${tableKey}&page=${page - 1}&include_deleted=${includeDeleted ? "1" : "0"}&page_size=${pageSize}`}
          >
            Previous
          </a>
          <a
            className={`rounded-md border border-border px-3 py-1 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            href={`/admin/data?table=${tableKey}&page=${page + 1}&include_deleted=${includeDeleted ? "1" : "0"}&page_size=${pageSize}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  )
}
