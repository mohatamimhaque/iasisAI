import { redirect } from "next/navigation"
import { Brain, Cog, Mail, MapPin, Phone, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { deleteAiConfig, deleteSiteConfig, upsertAiConfig, upsertContactDetails, upsertSiteConfig } from "@/app/admin/system/actions"
import { BrandingUploader } from "@/components/admin/branding-uploader"

export const metadata = { title: "System CMS" }

export default async function AdminSystemPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: configs }, { data: aiConfigs }] = await Promise.all([
    supabase
      .from("site_config")
      .select("key, value, value_type, label, category, updated_at")
      .order("category")
      .order("key"),
    supabase
      .from("ai_api_configs")
      .select("id, name, module, input_mode, api_endpoint, timeout_ms, is_active")
      .order("module")
      .order("name"),
  ])

  const brandingMap = new Map<string, string>()
  for (const cfg of configs ?? []) {
    if (cfg.value) brandingMap.set(cfg.key, cfg.value)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">System CMS</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Manage AI model configurations and site-wide settings. Changes take effect on the next request.
        </p>
      </header>

      {/* Branding */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Cog className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Branding assets</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the site logo and favicon. Files are stored in Cloudflare R2 and referenced via site_config.
        </p>
        <div className="mt-4">
          <BrandingUploader
            logoUrl={brandingMap.get("logo_url") ?? null}
            faviconUrl={brandingMap.get("favicon_url") ?? null}
          />
        </div>
      </section>

      {/* AI API configs */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">AI model configurations</h2>
        </div>

        {aiConfigs && aiConfigs.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {aiConfigs.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-medium text-foreground">{c.name}</p>
                      {c.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">Active</span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">API URL: {c.api_endpoint}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Module: {c.module} · Input: {c.input_mode ?? "text"} · Timeout: {c.timeout_ms ?? 30000} ms
                    </p>
                  </div>
                  <form action={deleteAiConfig.bind(null, c.id)}>
                    <button
                      type="submit"
                      aria-label="Delete configuration"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No AI configurations stored yet — add one below.
          </p>
        )}

        <details className="mt-4 rounded-2xl border border-border bg-card p-6">
          <summary className="cursor-pointer text-sm font-medium text-foreground">Add new AI configuration</summary>
          <form action={upsertAiConfig} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ai_name">Name</Label>
                <Input id="ai_name" name="name" required placeholder="Triage default" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ai_module">Module</Label>
                <select
                  id="ai_module"
                  name="module"
                  required
                  defaultValue=""
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  <option value="chat">Chat</option>
                  <option value="triage">Triage</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ai_endpoint">API URL</Label>
                <Input id="ai_endpoint" name="api_endpoint" required placeholder="https://api.example.com/your-endpoint" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ai_input">Input mode</Label>
                <select
                  id="ai_input"
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
                <Label htmlFor="ai_timeout">Timeout (ms)</Label>
                <Input id="ai_timeout" name="timeout_ms" type="number" min="1000" step="500" defaultValue="30000" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="is_active" defaultChecked className="rounded border-border" />
              Active
            </label>
            <div className="flex justify-end">
              <Button type="submit">Save configuration</Button>
            </div>
          </form>
        </details>
      </section>

      {/* Contact details */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Contact details</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          These values are displayed on the public <code>/contact</code> page.
        </p>
        <form action={upsertContactDetails} className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact_email" className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email
              </Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={brandingMap.get("contact_email") ?? "hello@iasis.health"}
                placeholder="hello@iasis.health"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_phone" className="flex items-center gap-1.5">
                <Phone className="size-3.5" /> Phone
              </Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={brandingMap.get("contact_phone") ?? "+880 1700 000 000"}
                placeholder="+880 1700 000 000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_office" className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Office address
              </Label>
              <Input
                id="contact_office"
                name="contact_office"
                defaultValue={brandingMap.get("contact_office") ?? "Gulshan-2, Dhaka 1212"}
                placeholder="Gulshan-2, Dhaka 1212"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_partnership_email" className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> Partnership email
              </Label>
              <Input
                id="contact_partnership_email"
                name="contact_partnership_email"
                type="email"
                defaultValue={brandingMap.get("contact_partnership_email") ?? "partners@iasis.health"}
                placeholder="partners@iasis.health"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Save contact details</Button>
          </div>
        </form>
      </section>

      {/* Site config */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Cog className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Site configuration</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Key/value pairs that drive marketing copy, feature flags, and contact details across the site.
        </p>

        {configs && configs.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {configs.map((c) => (
              <li key={c.key} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{c.key}</code>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-secondary-foreground">
                      {c.category}
                    </span>
                  </div>
                  {c.label ? <p className="mt-1 text-sm text-foreground">{c.label}</p> : null}
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.value}</p>
                </div>
                <form action={deleteSiteConfig.bind(null, c.key)}>
                  <button
                    type="submit"
                    aria-label="Delete setting"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No settings stored yet — add one below.
          </p>
        )}

        <details className="mt-4 rounded-2xl border border-border bg-card p-6">
          <summary className="cursor-pointer text-sm font-medium text-foreground">Add or update setting</summary>
          <form action={upsertSiteConfig} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cfg_key">Key</Label>
                <Input id="cfg_key" name="key" required placeholder="hero_subtitle" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg_category">Category</Label>
                <Input id="cfg_category" name="category" defaultValue="general" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg_label">Label</Label>
                <Input id="cfg_label" name="label" placeholder="Friendly description" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg_type">Value type</Label>
                <select
                  id="cfg_type"
                  name="value_type"
                  defaultValue="text"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cfg_value">Value</Label>
              <Textarea id="cfg_value" name="value" rows={3} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save setting</Button>
            </div>
          </form>
        </details>
      </section>
    </div>
  )
}
