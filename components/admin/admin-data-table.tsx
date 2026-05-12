"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { bulkDeleteRecords } from "@/app/admin/data/actions"

interface ColumnConfig {
  key: string
  label: string
}

interface AdminDataTableProps {
  table: string
  idField: string
  columns: ColumnConfig[]
  rows: Array<Record<string, unknown>>
}

export function AdminDataTable({ table, idField, columns, rows }: AdminDataTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [mode, setMode] = useState<"soft" | "hard">("soft")
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, checked]) => checked).map(([id]) => id),
    [selected],
  )

  const allChecked = rows.length > 0 && selectedIds.length === rows.length

  function toggleAll(next: boolean) {
    const updated: Record<string, boolean> = {}
    if (next) {
      for (const row of rows) {
        const idValue = String(row[idField] ?? "")
        if (idValue) updated[idValue] = true
      }
    }
    setSelected(updated)
  }

  function toggleOne(id: string, next: boolean) {
    setSelected((prev) => ({ ...prev, [id]: next }))
  }

  function runDelete() {
    setError(null)
    setMessage(null)
    start(async () => {
      const payload = new FormData()
      payload.set("table", table)
      payload.set("mode", mode)
      payload.set("ids", JSON.stringify(selectedIds))
      const res = await bulkDeleteRecords(payload)
      if (res?.error) setError(res.error)
      else setMessage("Delete completed.")
    })
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="radio"
              name="delete_mode"
              value="soft"
              checked={mode === "soft"}
              onChange={() => setMode("soft")}
              className="size-3"
            />
            Soft delete
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="radio"
              name="delete_mode"
              value="hard"
              checked={mode === "hard"}
              onChange={() => setMode("hard")}
              className="size-3"
            />
            Hard delete
          </label>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={selectedIds.length === 0 || pending}>
              Delete selected ({selectedIds.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-sm text-muted-foreground">
              You are about to {mode === "soft" ? "soft delete" : "hard delete"} {selectedIds.length} record(s) in
              <span className="font-medium text-foreground"> {table}</span>.
            </p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={runDelete} disabled={pending}>
                {pending ? "Deleting..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? <p className="mb-3 text-sm text-primary">{message}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                <Checkbox checked={allChecked} onCheckedChange={(v) => toggleAll(Boolean(v))} />
              </th>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const idValue = String(row[idField] ?? "")
              return (
                <tr key={idValue} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={Boolean(selected[idValue])}
                      onCheckedChange={(v) => toggleOne(idValue, Boolean(v))}
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-muted-foreground">
                      {formatValue(row[c.key], c.key)}
                    </td>
                  ))}
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatValue(value: unknown, key?: string) {
  if (value == null) return "—"
  if (typeof value === "string") {
    const formatted = formatDateTime(value, key)
    return formatted ?? value
  }
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (value instanceof Date) return formatDateTime(value) ?? value.toISOString()
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function formatDateTime(value: string | Date, key?: string) {
  if (key && !key.endsWith("_at")) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
