"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowUp,
  MessageCircle,
  Pin,
  PinOff,
  Trash2,
  ChevronRight,
  Brain,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createConversation,
  deleteConversation,
  togglePinConversation,
  addMemoryEntry,
  deleteMemoryEntry,
} from "@/app/app/chat/actions"

type Conversation = {
  id: string
  title: string
  is_pinned: boolean
  is_archived: boolean
  updated_at: string
}

type MemoryEntry = {
  id: string
  content: string
  created_at: string
}

type Props = {
  conversations: Conversation[]
  memory: MemoryEntry[]
  userId: string
}

const TOPICS = [
  "Anxiety",
  "Low Mood",
  "Stress",
  "Burnout",
  "Panic",
  "Sleep Problems",
  "Relationship Issues",
  "Work Pressure",
]

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function RisaLanding({ conversations, memory, userId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState("")
  const [showMemory, setShowMemory] = useState(false)
  const [newMemory, setNewMemory] = useState("")
  const [localMemory, setLocalMemory] = useState(memory)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleTopicClick = (topic: string) => {
    setInput(topic)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isPending) return
    const fd = new FormData()
    fd.set("message", input.trim())
    startTransition(() => createConversation(undefined, fd))
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this conversation?")) return
    startTransition(() => deleteConversation(id))
  }

  const handlePin = (id: string, currently: boolean) => {
    startTransition(() => togglePinConversation(id, !currently))
  }

  const handleAddMemory = () => {
    if (!newMemory.trim()) return
    const optimistic: MemoryEntry = {
      id: `tmp-${Date.now()}`,
      content: newMemory.trim(),
      created_at: new Date().toISOString(),
    }
    setLocalMemory((prev) => [optimistic, ...prev])
    const content = newMemory.trim()
    setNewMemory("")
    startTransition(() => addMemoryEntry(content))
  }

  const handleDeleteMemory = (id: string) => {
    setLocalMemory((prev) => prev.filter((m) => m.id !== id))
    startTransition(() => deleteMemoryEntry(id))
  }

  const pinned = conversations.filter((c) => c.is_pinned)
  const recent = conversations.filter((c) => !c.is_pinned)
  const hasConversations = conversations.length > 0

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <img src="/svg/RISA.svg" alt="RISA AI" className="h-6 w-auto" />
        <button
          onClick={() => setShowMemory((s) => !s)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary",
            showMemory && "bg-secondary text-foreground"
          )}
        >
          <Brain className="size-3.5" />
          Memory
          {localMemory.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {localMemory.length}
            </span>
          )}
        </button>
      </div>

      {/* Memory panel */}
      {showMemory && (
        <div className="mx-4 mb-4 rounded-2xl border border-border bg-card p-4 sm:mx-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">My Memory</p>
            <button
              onClick={() => setShowMemory(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Private notes that are referenced in your conversations.
          </p>
          <div className="flex gap-2">
            <input
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
              placeholder="Add a note about yourself…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              onClick={handleAddMemory}
              disabled={!newMemory.trim()}
              className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {localMemory.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {localMemory.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2"
                >
                  <p className="flex-1 text-xs text-foreground">{m.content}</p>
                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Main content — always centered hero + input, list below */}
      <div className="flex flex-1 flex-col items-center px-4 pb-8 pt-6 sm:px-8 sm:pt-10">
        {/* Hero heading — always visible */}
        <div className={cn("w-full max-w-xl text-center", hasConversations ? "mb-5" : "mb-8")}>
          <h1
            className={cn(
              "font-semibold tracking-tight text-foreground",
              hasConversations ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
            )}
          >
            How can I support you today?
          </h1>
          {!hasConversations && (
            <p className="mt-3 text-sm text-muted-foreground">
              Share what happened, how you&apos;re feeling, and what you need most right now.
              Available in Bengali &amp; English.
            </p>
          )}
        </div>

        {/* Input box — always visible */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className="rounded-2xl border border-border bg-card px-3 py-2.5 shadow-sm transition-colors focus-within:border-primary/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Share what's on your mind…"
              rows={2}
              disabled={isPending}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.slice(0, 4).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isPending}
                className="ml-2 shrink-0 rounded-xl bg-primary p-2 text-primary-foreground transition-opacity disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            In an emergency, call <strong className="text-foreground">999</strong>. RISA AI is not a replacement for professional care.
          </p>
        </form>

        {/* Full topic chips when no conversations yet */}
        {!hasConversations && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {TOPICS.slice(4).map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Previous conversations — always shown when they exist */}
        {hasConversations && (
          <div className="mt-8 w-full max-w-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Previous conversations
              </p>
            </div>

            {pinned.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pinned
                </p>
                <ul className="space-y-1.5">
                  {pinned.map((c) => (
                    <ConvRow key={c.id} conv={c} onPin={handlePin} onDelete={handleDelete} />
                  ))}
                </ul>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent
                  </p>
                )}
                <ul className="space-y-1.5">
                  {recent.map((c) => (
                    <ConvRow key={c.id} conv={c} onPin={handlePin} onDelete={handleDelete} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center text-[11px] text-muted-foreground">
        Powered by{" "}
        <a
          href="https://risa.up.railway.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <img src="/svg/RISA.svg" alt="" aria-hidden="true" className="h-3.5 w-auto" />
          RISA AI
        </a>
      </footer>
    </div>
  )
}

function ConvRow({
  conv,
  onPin,
  onDelete,
}: {
  conv: Conversation
  onPin: (id: string, currently: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <li className="group relative">
      <Link
        href={`/app/chat/${conv.id}`}
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
      >
        <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{conv.title}</p>
          <p className="text-[11px] text-muted-foreground">{relTime(conv.updated_at)}</p>
        </div>
        {conv.is_pinned && <Pin className="size-3 shrink-0 text-primary/60" />}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
        <button
          onClick={(e) => {
            e.preventDefault()
            onPin(conv.id, conv.is_pinned)
          }}
          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          title={conv.is_pinned ? "Unpin" : "Pin"}
        >
          {conv.is_pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(conv.id)
          }}
          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-rose-500"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  )
}
