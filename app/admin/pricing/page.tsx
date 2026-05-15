import { redirect } from "next/navigation"
import { Tag, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { deletePricingPlan, upsertPricingPlan } from "@/app/admin/pricing/actions"

export const metadata = { title: "Pricing Plans" }
export const dynamic = "force-dynamic"

export default async function AdminPricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")

  const adminClient = createAdminClient()
  const client = adminClient ?? supabase

  const { data: plans, error } = await client
    .from("pricing_plans")
    .select("id, name, price, cadence, description, features, cta_label, cta_href, is_highlighted, is_active, order_index")
    .order("order_index")
    .order("name")

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Content</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Pricing Plans</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Manage plans shown on the public <code>/pricing</code> page. Changes take effect immediately.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Database error: {error.message}. Make sure you have run the <code>pricing_plans</code> SQL migration.
        </div>
      )}

      <section className="mt-10 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Plans ({plans?.length ?? 0})</h2>
        </div>

        {plans && plans.length > 0 ? (
          <ul className="space-y-3">
            {plans.map((plan) => (
              <li key={plan.id} className={`rounded-2xl border bg-card ${plan.is_highlighted ? "border-primary" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <span className="font-mono text-sm font-semibold text-primary">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                      {plan.is_highlighted && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Highlighted</span>
                      )}
                      {!plan.is_active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(plan.features as string[])?.length ?? 0} features · CTA: &ldquo;{plan.cta_label}&rdquo; · Order: {plan.order_index}
                    </p>
                  </div>
                  <form action={deletePricingPlan.bind(null, plan.id as string)}>
                    <button
                      type="submit"
                      aria-label="Delete plan"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>

                <details className="border-t border-border">
                  <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Edit plan
                  </summary>
                  <form action={upsertPricingPlan} className="space-y-4 p-5">
                    <input type="hidden" name="id" value={plan.id as string} />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`name_${plan.id}`}>Plan name</Label>
                        <Input id={`name_${plan.id}`} name="name" required defaultValue={plan.name as string} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`price_${plan.id}`}>Price</Label>
                        <Input id={`price_${plan.id}`} name="price" required defaultValue={plan.price as string} placeholder="৳200" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cadence_${plan.id}`}>Cadence</Label>
                        <Input id={`cadence_${plan.id}`} name="cadence" required defaultValue={plan.cadence as string} placeholder="/ consultation" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`desc_${plan.id}`}>Description</Label>
                      <Input id={`desc_${plan.id}`} name="description" defaultValue={(plan.description as string) ?? ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`features_${plan.id}`}>Features (one per line)</Label>
                      <Textarea
                        id={`features_${plan.id}`}
                        name="features"
                        rows={6}
                        defaultValue={((plan.features as string[]) ?? []).join("\n")}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`cta_label_${plan.id}`}>CTA label</Label>
                        <Input id={`cta_label_${plan.id}`} name="cta_label" defaultValue={plan.cta_label as string} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cta_href_${plan.id}`}>CTA URL</Label>
                        <Input id={`cta_href_${plan.id}`} name="cta_href" defaultValue={plan.cta_href as string} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`order_${plan.id}`}>Order index</Label>
                        <Input id={`order_${plan.id}`} name="order_index" type="number" defaultValue={plan.order_index as number} />
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" name="is_highlighted" defaultChecked={plan.is_highlighted as boolean} className="rounded border-border" />
                        Highlighted (featured card)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" name="is_active" defaultChecked={plan.is_active as boolean} className="rounded border-border" />
                        Active (visible on site)
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm">
                        Save changes
                      </Button>
                    </div>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          !error && (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No pricing plans yet — add one below.
            </p>
          )
        )}
      </section>

      <details className="mt-6 rounded-2xl border border-border bg-card p-6">
        <summary className="cursor-pointer text-sm font-medium text-foreground">Add new plan</summary>
        <form action={upsertPricingPlan} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="new_name">Plan name</Label>
              <Input id="new_name" name="name" required placeholder="Enterprise" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_price">Price</Label>
              <Input id="new_price" name="price" required placeholder="৳500" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_cadence">Cadence</Label>
              <Input id="new_cadence" name="cadence" required defaultValue="/ consultation" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_desc">Description</Label>
            <Input id="new_desc" name="description" placeholder="Short plan description" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_features">Features (one per line)</Label>
            <Textarea id="new_features" name="features" rows={6} placeholder={"Feature one\nFeature two\nFeature three"} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="new_cta_label">CTA label</Label>
              <Input id="new_cta_label" name="cta_label" defaultValue="Get started" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_cta_href">CTA URL</Label>
              <Input id="new_cta_href" name="cta_href" defaultValue="/auth/sign-up" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_order">Order index</Label>
              <Input id="new_order" name="order_index" type="number" defaultValue="99" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="is_highlighted" className="rounded border-border" />
              Highlighted (featured card)
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="is_active" defaultChecked className="rounded border-border" />
              Active (visible on site)
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add plan</Button>
          </div>
        </form>
      </details>
    </div>
  )
}
