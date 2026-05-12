import { Brain } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "AI Models API" }

export default async function AiModelsPublicPage() {
  const supabase = await createClient()
  const { data: configs } = await supabase
    .from("ai_api_configs")
    .select("id, name, input_mode, api_endpoint, timeout_ms, is_active")
    .eq("is_active", true)
    .order("name")

  const list = configs ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Developer API</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">AI Models API</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Use these endpoints to send text, image, or mixed inputs to our AI. Base URLs are managed by admin and update
          dynamically.
        </p>
      </header>

      <section className="mt-8 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No active AI models are published yet.
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
                      <p className="mt-1 text-xs text-muted-foreground">Base URL: {m.api_endpoint}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-1 sm:text-right">
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
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  )
}
