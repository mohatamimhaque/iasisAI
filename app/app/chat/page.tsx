import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, MessageCircle, Plus, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { createChatThread } from "./actions"

export const metadata = {
  title: "AI Health Chat",
}

const SAMPLES = [
  "What does high WBC mean on a blood test?",
  "Can I take paracetamol with empty stomach?",
  "Is mild fever for two days something to worry about?",
  "How can I manage my type 2 diabetes day to day?",
]

function relTime(d: string) {
  const diffMs = Date.now() - new Date(d).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function ChatListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: threads } = await supabase
    .from("chat_threads")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50)

  const list = threads ?? []

  const { data: models } = await supabase
    .from("ai_api_configs")
    .select("id, name, input_mode, timeout_ms, is_active")
    .eq("module", "chat")
    .eq("is_active", true)
    .order("is_active", { ascending: false })
    .order("name")

  const modelList = (models ?? []).filter((m) => m.input_mode !== "image")
  const defaultModelId = modelList[0]?.id ?? null

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">AI Health Chat</p>
          <h1 className="mt-1 text-balance font-serif text-4xl tracking-tight text-foreground">Ask Iasis anything</h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            A private, always-on health assistant. It is not a doctor, but it can explain medical terms, help you
            understand reports, and tell you when to seek help.
          </p>
        </div>
        <form action={createChatThread}>
          <input type="hidden" name="ai_config_id" value={defaultModelId ?? ""} />
          <Button type="submit" size="lg">
            <Plus className="size-4" />
            New chat
          </Button>
        </form>
      </header>

      {modelList.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Choose model</p>
              <h2 className="mt-1 font-serif text-2xl tracking-tight text-foreground">Start with a model</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {modelList.map((m) => (
              <form key={m.id} action={createChatThread} className="rounded-2xl border border-border p-4">
                <input type="hidden" name="ai_config_id" value={m.id} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Input: {m.input_mode ?? "text"} · Timeout: {m.timeout_ms ?? 30000} ms
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-900">
                    Approved
                  </span>
                </div>
                <div className="mt-4">
                  <Button type="submit" variant="secondary" className="w-full">
                    Start chat
                  </Button>
                </div>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {list.length === 0 ? (
        <section className="mt-10 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl tracking-tight text-foreground">Start with a question</h2>
              <p className="mt-1 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                Try one of these to see how Iasis can help — or write your own.
              </p>
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SAMPLES.map((s) => (
              <li key={s}>
                <form action={createChatThread}>
                  <input type="hidden" name="ai_config_id" value={defaultModelId ?? ""} />
                  <button
                    type="submit"
                    className="group flex w-full items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-secondary/40"
                  >
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="flex-1 text-sm text-foreground">{s}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>

        </section>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={`/app/chat/${t.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircle className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-medium text-foreground">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{relTime(t.updated_at)}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
