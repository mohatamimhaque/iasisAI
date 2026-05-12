import { redirect } from "next/navigation"
import { Brain, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteAiConfig, upsertAiConfig } from "@/app/admin/system/actions"

export const metadata = { title: "AI Models" }

const MODULE_LABELS: Record<string, string> = {
  chat: "Chat",
  triage: "Triage",
}

async function adminGuard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")
  return supabase
}

export default async function AdminAiModelsPage() {
  const supabase = await adminGuard()
  const { data: configs } = await supabase
    .from("ai_api_configs")
    .select("id, name, module, input_mode, api_endpoint, timeout_ms, is_active")
    .order("module")
    .order("name")

  const list = configs ?? []
  const docsBaseUrl = list.find((item) => item.is_active && item.api_endpoint)?.api_endpoint ?? "https://api.example.com"
  const hasChat = list.some((item) => item.module === "chat")
  const hasTriage = list.some((item) => item.module === "triage")
  const canAddNew = !(hasChat && hasTriage)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">AI Models</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Add your own AI model API. Set the base URL, supported input type, timeout, and enable it. Base URL is stored
          in the database so public docs stay in sync.
        </p>
      </header>

      <section className="mt-8 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No AI configurations yet. Add one below.
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((m) => (
              <li key={m.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Brain className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-serif text-xl tracking-tight text-foreground">{m.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">API URL: {m.api_endpoint}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-1 sm:text-right">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">Module</dt>
                      <dd className="mt-0.5 text-foreground">{MODULE_LABELS[m.module] ?? m.module}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">Input</dt>
                      <dd className="mt-0.5 text-foreground">{m.input_mode ?? "text"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">Timeout</dt>
                      <dd className="mt-0.5 text-foreground">{m.timeout_ms ?? 30000} ms</dd>
                    </div>
                  </div>
                </div>

                <details className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">Edit configuration</summary>
                  <form action={upsertAiConfig} className="mt-4 space-y-3">
                    <input type="hidden" name="id" value={m.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`name_${m.id}`}>Name</Label>
                        <Input id={`name_${m.id}`} name="name" defaultValue={m.name} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`module_${m.id}`}>Module</Label>
                        <select
                          id={`module_${m.id}`}
                          name="module"
                          defaultValue={m.module}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="chat">Chat</option>
                          <option value="triage">Triage</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`endpoint_${m.id}`}>API URL</Label>
                        <Input
                          id={`endpoint_${m.id}`}
                          name="api_endpoint"
                          defaultValue={m.api_endpoint ?? ""}
                          placeholder="https://api.example.com/your-endpoint"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`input_${m.id}`}>Input mode</Label>
                        <select
                          id={`input_${m.id}`}
                          name="input_mode"
                          defaultValue={m.input_mode ?? "text"}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="both">Text + Image</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`timeout_${m.id}`}>Timeout (ms)</Label>
                        <Input
                          id={`timeout_${m.id}`}
                          name="timeout_ms"
                          type="number"
                          min="1000"
                          step="500"
                          defaultValue={m.timeout_ms ?? 30000}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" name="is_active" defaultChecked={m.is_active ?? false} className="rounded border-border" />
                      Active
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="submit"
                        formAction={deleteAiConfig.bind(null, m.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline"
                      >
                        Delete configuration
                      </button>
                      <Button type="submit">Save changes</Button>
                    </div>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Add new AI configuration</h2>
        {!canAddNew ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Only two APIs are allowed: one for Chat and one for Triage. Edit the existing entries above.
          </p>
        ) : (
          <form action={upsertAiConfig} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new_name">Name</Label>
              <Input id="new_name" name="name" required placeholder="Custom Vision Model" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_module">Module</Label>
              <select
                id="new_module"
                name="module"
                required
                defaultValue=""
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Choose…
                </option>
                {!hasChat ? <option value="chat">Chat</option> : null}
                {!hasTriage ? <option value="triage">Triage</option> : null}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_endpoint">API URL</Label>
              <Input id="new_endpoint" name="api_endpoint" required placeholder="https://api.example.com/your-endpoint" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_input">Input mode</Label>
              <select
                id="new_input"
                name="input_mode"
                defaultValue="text"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="both">Text + Image</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_timeout">Timeout (ms)</Label>
              <Input id="new_timeout" name="timeout_ms" type="number" min="1000" step="500" defaultValue="30000" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="is_active" defaultChecked className="rounded border-border" />
            Active
          </label>
          <div className="flex justify-end">
            <Button type="submit">Add configuration</Button>
          </div>
          </form>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg text-foreground">Custom API documentation</h2>
          <a
            href={docsBaseUrl}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            API endpoint
            <ExternalLink className="size-3" />
          </a>
        </div>
        <p className="mt-2">Iasis sends requests to the configured API URL. The payload supports text, image, or both.</p>
        <p className="mt-1 text-xs text-muted-foreground">API URL: {docsBaseUrl}</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-foreground">Request</p>
            <pre className="mt-2 overflow-auto rounded-lg bg-background p-3 text-xs text-foreground">{`POST ${docsBaseUrl}
Content-Type: application/json

{
  "module": "chat", // chat | triage
  "model": "your-model-id",
  "input": {
    "type": "both", // text | image | both
    "text": "Patient symptoms...",
    "image_url": "https://.../xray.png"
  },
  "timeout_ms": 30000,
  "metadata": {
    "user_id": "uuid",
    "session_id": "uuid"
  }
}`}</pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Response</p>
            <pre className="mt-2 overflow-auto rounded-lg bg-background p-3 text-xs text-foreground">{`{
  "id": "req_123",
  "output_text": "...",
  "output_json": { "triage": "..." },
  "model_used": "your-model-id",
  "usage": { "input_tokens": 123, "output_tokens": 456 },
  "error": null
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}
